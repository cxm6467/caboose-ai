import { Octokit } from '@octokit/rest';
import type { EnvConfig } from '../types/env.js';
import type { RuleFile } from '../types/index.js';

export class GitHubService {
  private octokit: Octokit;
  private owner: string;
  private repo: string;
  private branch: string;

  constructor(config: EnvConfig) {
    this.octokit = new Octokit({
      auth: config.GITHUB_TOKEN,
    });
    this.owner = config.GITHUB_OWNER;
    this.repo = config.GITHUB_REPO;
    this.branch = config.DEFAULT_BRANCH;
  }

  /**
   * Fetch a file from the repository
   */
  async getFile(path: string): Promise<RuleFile | null> {
    try {
      const response = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path,
        ref: this.branch,
      });

      if ('content' in response.data && response.data.type === 'file') {
        const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
        return {
          path,
          content,
          sha: response.data.sha,
        };
      }

      return null;
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch file ${path}: ${error.message}`);
    }
  }

  /**
   * Get all rule files from the repository
   */
  async getRuleFiles(filePaths: string[]): Promise<RuleFile[]> {
    const files: RuleFile[] = [];

    for (const path of filePaths) {
      const file = await this.getFile(path);
      if (file) {
        files.push(file);
      }
    }

    return files;
  }

  /**
   * Update or create a file in the repository
   */
  async updateFile(
    path: string,
    content: string,
    message: string,
    sha?: string
  ): Promise<void> {
    try {
      await this.octokit.repos.createOrUpdateFileContents({
        owner: this.owner,
        repo: this.repo,
        path,
        message,
        content: Buffer.from(content).toString('base64'),
        branch: this.branch,
        sha,
      });
    } catch (error: any) {
      throw new Error(`Failed to update file ${path}: ${error.message}`);
    }
  }

  /**
   * Create a pull request
   */
  async createPullRequest(
    title: string,
    body: string,
    head: string,
    base: string = this.branch
  ): Promise<number> {
    try {
      const response = await this.octokit.pulls.create({
        owner: this.owner,
        repo: this.repo,
        title,
        body,
        head,
        base,
      });
      return response.data.number;
    } catch (error: any) {
      throw new Error(`Failed to create pull request: ${error.message}`);
    }
  }

  /**
   * Create a new branch
   */
  async createBranch(branchName: string): Promise<void> {
    try {
      // Get the latest commit SHA from the base branch
      const { data: ref } = await this.octokit.git.getRef({
        owner: this.owner,
        repo: this.repo,
        ref: `heads/${this.branch}`,
      });

      const sha = ref.object.sha;

      // Create the new branch
      await this.octokit.git.createRef({
        owner: this.owner,
        repo: this.repo,
        ref: `refs/heads/${branchName}`,
        sha,
      });
    } catch (error: any) {
      throw new Error(`Failed to create branch ${branchName}: ${error.message}`);
    }
  }

  /**
   * Check if a branch exists
   */
  async branchExists(branchName: string): Promise<boolean> {
    try {
      await this.octokit.git.getRef({
        owner: this.owner,
        repo: this.repo,
        ref: `heads/${branchName}`,
      });
      return true;
    } catch (error: any) {
      if (error.status === 404) {
        return false;
      }
      throw error;
    }
  }
}
