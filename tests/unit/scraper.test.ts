import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ScraperService } from '../../src/services/scraper.service.js';
import axios from 'axios';

vi.mock('axios');

describe('ScraperService', () => {
  let scraper: ScraperService;

  beforeEach(() => {
    scraper = new ScraperService();
    vi.clearAllMocks();
  });

  it('should fetch and parse HTML content', async () => {
    const mockHtml = `
      <!DOCTYPE html>
      <html>
        <head><title>Test</title></head>
        <body>
          <main>
            <h1>Test Documentation</h1>
            <p>This is test content.</p>
          </main>
        </body>
      </html>
    `;

    vi.mocked(axios.get).mockResolvedValue({
      data: mockHtml,
    });

    const result = await scraper.fetchDocumentation('https://example.com');

    expect(result.url).toBe('https://example.com');
    expect(result.content).toContain('Test Documentation');
    expect(result.content).toContain('This is test content');
    expect(result.lastUpdated).toBeInstanceOf(Date);
  });

  it('should handle fetch errors gracefully', async () => {
    vi.mocked(axios.get).mockRejectedValue(new Error('Network error'));

    await expect(scraper.fetchDocumentation('https://example.com')).rejects.toThrow(
      'Failed to fetch documentation'
    );
  });

  it('should fetch multiple documentation sources', async () => {
    vi.mocked(axios.get).mockResolvedValue({
      data: '<main>Content</main>',
    });

    const urls = ['https://example.com', 'https://example.org'];
    const results = await scraper.fetchAllDocumentation(urls);

    expect(results).toHaveLength(2);
    expect(results[0].url).toBe('https://example.com');
    expect(results[1].url).toBe('https://example.org');
  });

  it('should extract sections from content', () => {
    const content = 'Introduction\nSome intro text\n\nMain Content\nMain section text here\nMore content';
    const section = scraper.extractSection(content, 'Main Content');

    expect(section).toBeDefined();
    expect(section).toContain('Main Content');
  });

  it('should compare documentation versions', () => {
    const oldContent = 'Old documentation content';
    const newContent = 'New documentation content with more information';

    const comparison = scraper.compareDocumentation(oldContent, newContent);

    expect(comparison).toContain('Content expanded');
  });
});
