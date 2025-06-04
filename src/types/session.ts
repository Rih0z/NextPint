import { GeneratedPrompt } from './prompt';

export interface BeerSearchSession {
  sessionId: string;
  userId: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
  status: SessionStatus;
  profile: SessionProfile;
  generatedPrompts: GeneratedPrompt[];
  results?: SessionResult[];
  notes?: string;
}

export enum SessionStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

export interface SessionProfile {
  sessionGoal: string;
  mood: string;
  tastePreference: TastePreference;
  constraints: SessionConstraints;
  searchKeywords: string[];
  timeFrame?: TimeFrame;
  includeSnsHistory?: boolean;
}

export interface TastePreference {
  primary: string;
  avoid: string[];
  intensity: number; // 1-5
}

export interface SessionConstraints {
  location?: string;
  budget?: string;
  availability?: string;
  occasion?: string;
  other: string[];
}

export interface TimeFrame {
  start?: Date;
  end?: Date;
}

export interface SessionResult {
  id: string;
  promptId: string;
  aiService: string;
  input: string;
  output: string;
  satisfaction: number;
  feedback?: string;
  processedAt: Date;
}

export interface SessionFilter {
  status?: SessionStatus[];
  dateRange?: {start: Date; end: Date};
  categories?: string[];
  searchText?: string;
}

// Re-export prompt types that are referenced
export type {GeneratedPrompt} from './prompt';