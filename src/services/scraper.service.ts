import axios from 'axios';
import * as cheerio from 'cheerio';
import type { DocumentationSource } from '../types/index.js';

export class ScraperService {
  private userAgent = 'caboose-ai/1.0 (Documentation Update Service)';

  /**
   * Fetch and parse documentation from a URL
   */
  async fetchDocumentation(url: string): Promise<DocumentationSource> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
        },
        timeout: 30000,
      });

      const content = this.extractContent(response.data);

      return {
        url,
        content,
        lastUpdated: new Date(),
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch documentation from ${url}: ${error.message}`);
    }
  }

  /**
   * Fetch documentation from multiple URLs
   */
  async fetchAllDocumentation(urls: string[]): Promise<DocumentationSource[]> {
    const results = await Promise.allSettled(
      urls.map((url) => this.fetchDocumentation(url))
    );

    const successful: DocumentationSource[] = [];
    const errors: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successful.push(result.value);
      } else {
        errors.push(`${urls[index]}: ${result.reason.message}`);
      }
    });

    if (errors.length > 0) {
      console.warn('Some documentation sources failed:', errors);
    }

    return successful;
  }

  /**
   * Extract meaningful content from HTML
   */
  private extractContent(html: string): string {
    const $ = cheerio.load(html);

    // Remove script and style tags
    $('script, style, nav, footer, header, .sidebar, .menu').remove();

    // Try to find main content area
    const mainSelectors = [
      'main',
      'article',
      '[role="main"]',
      '.content',
      '.documentation',
      '.docs',
      '#content',
      '#main',
    ];

    let content = '';

    for (const selector of mainSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        content = element.text();
        break;
      }
    }

    // Fallback to body if no main content found
    if (!content) {
      content = $('body').text();
    }

    // Clean up whitespace
    content = content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join('\n');

    return content;
  }

  /**
   * Extract specific sections from documentation
   */
  extractSection(content: string, sectionTitle: string): string | null {
    const lines = content.split('\n');
    const sectionStart = lines.findIndex((line) =>
      line.toLowerCase().includes(sectionTitle.toLowerCase())
    );

    if (sectionStart === -1) {
      return null;
    }

    // Find the next section or end of content
    const sectionEnd = lines.findIndex(
      (line, index) =>
        index > sectionStart &&
        line.match(/^#+\s/) // Markdown heading
    );

    const endIndex = sectionEnd === -1 ? lines.length : sectionEnd;
    return lines.slice(sectionStart, endIndex).join('\n');
  }

  /**
   * Generate a summary of changes between two documentation versions
   */
  compareDocumentation(oldContent: string, newContent: string): string {
    const changes: string[] = [];

    if (oldContent === newContent) {
      return 'No changes detected';
    }

    const oldLength = oldContent.length;
    const newLength = newContent.length;
    const diff = Math.abs(newLength - oldLength);
    const percentChange = ((diff / oldLength) * 100).toFixed(1);

    if (newLength > oldLength) {
      changes.push(`Content expanded by ${diff} characters (${percentChange}%)`);
    } else {
      changes.push(`Content reduced by ${diff} characters (${percentChange}%)`);
    }

    // Simple keyword analysis
    const oldKeywords = this.extractKeywords(oldContent);
    const newKeywords = this.extractKeywords(newContent);

    const addedKeywords = newKeywords.filter((kw) => !oldKeywords.includes(kw));
    const removedKeywords = oldKeywords.filter((kw) => !newKeywords.includes(kw));

    if (addedKeywords.length > 0) {
      changes.push(`New topics: ${addedKeywords.slice(0, 5).join(', ')}`);
    }

    if (removedKeywords.length > 0) {
      changes.push(`Removed topics: ${removedKeywords.slice(0, 5).join(', ')}`);
    }

    return changes.join('\n');
  }

  /**
   * Extract keywords from content (simple implementation)
   */
  private extractKeywords(content: string): string[] {
    const words = content
      .toLowerCase()
      .split(/\W+/)
      .filter((word) => word.length > 5);

    const frequency: Record<string, number> = {};
    words.forEach((word) => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word]) => word);
  }
}
