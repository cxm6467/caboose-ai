import { z } from 'zod';
import type { EnvConfig } from '../types/env.js';

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  GITHUB_TOKEN: z.string().min(1, 'GITHUB_TOKEN is required'),
  GITHUB_WEBHOOK_SECRET: z.string().min(1, 'GITHUB_WEBHOOK_SECRET is required'),
  GITHUB_OWNER: z.string().min(1, 'GITHUB_OWNER is required'),
  GITHUB_REPO: z.string().min(1, 'GITHUB_REPO is required'),
  UPDATE_SCHEDULE: z.string().default('0 2 * * *'),
  DOC_SOURCES: z.string().transform((val) => val.split(',').map((s) => s.trim())),
  RULES_FILE_PATHS: z.string().transform((val) => val.split(',').map((s) => s.trim())),
  DEFAULT_BRANCH: z.string().default('main'),
});

export function validateEnv(env: Record<string, unknown>): EnvConfig {
  try {
    return envSchema.parse(env) as EnvConfig;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
      throw new Error(`Environment validation failed:\n${issues.join('\n')}`);
    }
    throw error;
  }
}
