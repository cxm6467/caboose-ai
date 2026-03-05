export interface EnvConfig {
  PORT: number;
  HOST: string;
  NODE_ENV: 'development' | 'production' | 'test';
  LOG_LEVEL: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
  GITHUB_TOKEN: string;
  GITHUB_WEBHOOK_SECRET: string;
  GITHUB_OWNER: string;
  GITHUB_REPO: string;
  UPDATE_SCHEDULE: string;
  DOC_SOURCES: string[];
  RULES_FILE_PATHS: string[];
  DEFAULT_BRANCH: string;
}

declare module 'fastify' {
  interface FastifyInstance {
    config: EnvConfig;
  }
}
