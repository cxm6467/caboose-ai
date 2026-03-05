import { describe, it, expect } from 'vitest';
import { validateEnv } from '../../src/config/env.js';

describe('Environment Configuration', () => {
  it('should validate correct environment variables', () => {
    const env = {
      PORT: '3000',
      HOST: '0.0.0.0',
      NODE_ENV: 'development',
      LOG_LEVEL: 'info',
      GITHUB_TOKEN: 'test_token',
      GITHUB_WEBHOOK_SECRET: 'test_secret',
      GITHUB_OWNER: 'test_owner',
      GITHUB_REPO: 'test_repo',
      UPDATE_SCHEDULE: '0 2 * * *',
      DOC_SOURCES: 'https://example.com,https://example.org',
      RULES_FILE_PATHS: '.cursorrules,CLAUDE.md',
      DEFAULT_BRANCH: 'main',
    };

    const result = validateEnv(env);

    expect(result.PORT).toBe(3000);
    expect(result.HOST).toBe('0.0.0.0');
    expect(result.NODE_ENV).toBe('development');
    expect(result.DOC_SOURCES).toEqual(['https://example.com', 'https://example.org']);
    expect(result.RULES_FILE_PATHS).toEqual(['.cursorrules', 'CLAUDE.md']);
  });

  it('should throw error for missing required fields', () => {
    const env = {
      PORT: '3000',
      HOST: '0.0.0.0',
    };

    expect(() => validateEnv(env)).toThrow('Environment validation failed');
  });

  it('should use default values for optional fields', () => {
    const env = {
      GITHUB_TOKEN: 'test_token',
      GITHUB_WEBHOOK_SECRET: 'test_secret',
      GITHUB_OWNER: 'test_owner',
      GITHUB_REPO: 'test_repo',
      DOC_SOURCES: 'https://example.com',
      RULES_FILE_PATHS: '.cursorrules',
    };

    const result = validateEnv(env);

    expect(result.PORT).toBe(3000);
    expect(result.HOST).toBe('0.0.0.0');
    expect(result.NODE_ENV).toBe('development');
    expect(result.UPDATE_SCHEDULE).toBe('0 2 * * *');
    expect(result.DEFAULT_BRANCH).toBe('main');
  });
});
