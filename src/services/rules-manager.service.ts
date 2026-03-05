import { format } from 'date-fns';
import type { FastifyBaseLogger } from 'fastify';
import { GitHubService } from './github.service.js';
import { ScraperService } from './scraper.service.js';
import type { UpdateResult, RuleFile, DocumentationSource } from '../types/index.js';

export class RulesManagerService {
  private github: GitHubService;
  private scraper: ScraperService;
  private logger: FastifyBaseLogger;
  private docSources: string[];
  private ruleFilePaths: string[];

  constructor(
    github: GitHubService,
    scraper: ScraperService,
    logger: FastifyBaseLogger,
    docSources: string[],
    ruleFilePaths: string[]
  ) {
    this.github = github;
    this.scraper = scraper;
    this.logger = logger;
    this.docSources = docSources;
    this.ruleFilePaths = ruleFilePaths;
  }

  /**
   * Check for documentation updates and update rule files if needed
   */
  async checkAndUpdateRules(): Promise<UpdateResult> {
    const timestamp = new Date();
    const filesUpdated: string[] = [];
    const errors: string[] = [];

    try {
      this.logger.info('Starting documentation update check...');

      // Fetch latest documentation
      const docs = await this.scraper.fetchAllDocumentation(this.docSources);

      if (docs.length === 0) {
        this.logger.warn('No documentation sources could be fetched');
        return {
          success: false,
          filesUpdated: [],
          errors: ['Failed to fetch any documentation sources'],
          timestamp,
        };
      }

      // Fetch current rule files
      const ruleFiles = await this.github.getRuleFiles(this.ruleFilePaths);

      // Determine if updates are needed
      const needsUpdate = await this.shouldUpdateRules(ruleFiles, docs);

      if (!needsUpdate) {
        this.logger.info('No updates needed');
        return {
          success: true,
          filesUpdated: [],
          timestamp,
        };
      }

      // Generate updated content
      const updatedContent = this.generateUpdatedRules(ruleFiles, docs);

      // Create branch for updates
      const branchName = `docs-update-${format(timestamp, 'yyyy-MM-dd-HHmmss')}`;
      const branchExists = await this.github.branchExists(branchName);

      if (!branchExists) {
        await this.github.createBranch(branchName);
        this.logger.info(`Created branch: ${branchName}`);
      }

      // Update files
      for (const file of ruleFiles) {
        try {
          const newContent = updatedContent.get(file.path);
          if (newContent && newContent !== file.content) {
            await this.github.updateFile(
              file.path,
              newContent,
              `Update ${file.path} with latest documentation`,
              file.sha
            );
            filesUpdated.push(file.path);
            this.logger.info(`Updated file: ${file.path}`);
          }
        } catch (error: any) {
          const errorMsg = `Failed to update ${file.path}: ${error.message}`;
          errors.push(errorMsg);
          this.logger.error(errorMsg);
        }
      }

      // Create pull request if files were updated
      if (filesUpdated.length > 0) {
        const prBody = this.generatePRBody(docs, filesUpdated);
        const prNumber = await this.github.createPullRequest(
          'Update AI assistant rules with latest documentation',
          prBody,
          branchName
        );
        this.logger.info(`Created pull request #${prNumber}`);
      }

      return {
        success: errors.length === 0,
        filesUpdated,
        errors: errors.length > 0 ? errors : undefined,
        timestamp,
      };
    } catch (error: any) {
      this.logger.error('Failed to update rules:', error);
      return {
        success: false,
        filesUpdated,
        errors: [error.message],
        timestamp,
      };
    }
  }

  /**
   * Determine if rules should be updated based on documentation changes
   */
  private async shouldUpdateRules(
    ruleFiles: RuleFile[],
    docs: DocumentationSource[]
  ): Promise<boolean> {
    // Simple check: if documentation was fetched and rule files exist
    // In a more sophisticated implementation, you could:
    // - Compare hashes of documentation content
    // - Check timestamps
    // - Analyze specific sections for changes
    return docs.length > 0 && ruleFiles.length > 0;
  }

  /**
   * Generate updated rule content based on documentation
   */
  private generateUpdatedRules(
    ruleFiles: RuleFile[],
    docs: DocumentationSource[]
  ): Map<string, string> {
    const updates = new Map<string, string>();

    for (const file of ruleFiles) {
      const updatedContent = this.mergeDocumentationIntoRules(file, docs);
      updates.set(file.path, updatedContent);
    }

    return updates;
  }

  /**
   * Merge documentation updates into existing rules
   */
  private mergeDocumentationIntoRules(
    ruleFile: RuleFile,
    docs: DocumentationSource[]
  ): string {
    let content = ruleFile.content;

    // Add documentation update section
    const updateSection = this.createDocumentationUpdateSection(docs);

    // Check if update section already exists
    const sectionMarker = '## Latest Documentation Updates';
    if (content.includes(sectionMarker)) {
      // Replace existing section
      const sectionRegex = /## Latest Documentation Updates[\s\S]*?(?=\n##|$)/;
      content = content.replace(sectionRegex, updateSection);
    } else {
      // Append new section
      content = `${content}\n\n${updateSection}`;
    }

    return content;
  }

  /**
   * Create documentation update section
   */
  private createDocumentationUpdateSection(docs: DocumentationSource[]): string {
    const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    let section = `## Latest Documentation Updates\n\n`;
    section += `*Last updated: ${timestamp}*\n\n`;

    for (const doc of docs) {
      section += `### ${doc.url}\n\n`;
      section += `Key information extracted from latest documentation:\n\n`;

      // Extract relevant snippets (simplified)
      const snippets = this.extractRelevantSnippets(doc.content);
      snippets.forEach((snippet) => {
        section += `- ${snippet}\n`;
      });

      section += `\n`;
    }

    return section;
  }

  /**
   * Extract relevant snippets from documentation
   */
  private extractRelevantSnippets(content: string): string[] {
    const lines = content.split('\n').filter((line) => line.trim().length > 20);

    // Take first 5 meaningful lines as snippets
    return lines.slice(0, 5).map((line) => {
      if (line.length > 100) {
        return line.substring(0, 97) + '...';
      }
      return line;
    });
  }

  /**
   * Generate pull request body
   */
  private generatePRBody(docs: DocumentationSource[], filesUpdated: string[]): string {
    let body = '## Documentation Update\n\n';
    body += 'This PR updates AI assistant rule files with the latest documentation.\n\n';

    body += '### Documentation Sources\n\n';
    docs.forEach((doc) => {
      body += `- [${doc.url}](${doc.url})\n`;
    });

    body += '\n### Files Updated\n\n';
    filesUpdated.forEach((file) => {
      body += `- \`${file}\`\n`;
    });

    body += '\n### Changes\n\n';
    body += 'Updated rule files with latest information from official documentation sources.\n';
    body += 'Please review the changes and merge if appropriate.\n\n';
    body += '*This PR was automatically generated by caboose-ai*\n';

    return body;
  }

  /**
   * Manually trigger an update
   */
  async triggerUpdate(): Promise<UpdateResult> {
    return this.checkAndUpdateRules();
  }
}
