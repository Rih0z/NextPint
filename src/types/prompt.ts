export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: PromptCategory;
  version: string;
  locale: string;
  template: string;
  variables: PromptVariable[];
  examples?: PromptExample[];
  metadata: PromptMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export enum PromptCategory {
  IMPORT = 'import',
  SEARCH = 'search',
  ANALYSIS = 'analysis',
  COMPARISON = 'comparison',
}

export interface PromptVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  required: boolean;
  description: string;
  placeholder?: string;
  defaultValue?: any;
  validation?: VariableValidation;
}

export interface VariableValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
}

export interface PromptExample {
  input: Record<string, any>;
  output: string;
  description?: string;
}

export interface PromptMetadata {
  supportedAI: string[];
  estimatedTokens: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  author?: string;
  language?: string;
}

export interface GeneratedPrompt {
  id: string;
  templateId: string;
  content: string;
  variables: Record<string, any>;
  aiService?: string;
  generatedAt: Date;
  usedAt?: Date;
  copiedCount: number;
}

export interface PromptTemplateCache {
  templates: CachedTemplate[];
  lastUpdated: Date;
  version: string;
  expiresAt: Date;
}

export interface CachedTemplate {
  id: string;
  name: string;
  description: string;
  category: PromptCategory;
  version: string;
  locale: string;
  template: string;
  variables: PromptVariable[];
  metadata: PromptMetadata;
  cachedAt: Date;
}