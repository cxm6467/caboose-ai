export interface RuleFile {
  path: string;
  content: string;
  sha: string;
}

export interface DocumentationSource {
  url: string;
  content: string;
  lastUpdated: Date;
}

export interface UpdateResult {
  success: boolean;
  filesUpdated: string[];
  errors?: string[];
  timestamp: Date;
}

export interface WebhookPayload {
  action: string;
  repository: {
    name: string;
    owner: {
      login: string;
    };
  };
  ref?: string;
}
