export interface UserProfile {
  id: string;
  version: string;
  preferences: UserPreferences;
  history: ImportedBeer[];
  sessions: BeerSearchSession[];
  settings: UserSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  favoriteStyles: string[];
  flavorProfile: FlavorProfile;
  avoidList: string[];
  preferredBreweries: string[];
  budgetRange: BudgetRange;
  locationPreferences: string[];
}

export interface FlavorProfile {
  hoppy: number; // 1-5
  malty: number; // 1-5
  bitter: number; // 1-5
  sweet: number; // 1-5
  sour: number; // 1-5
  alcohol: number; // 1-5
}

export interface BudgetRange {
  min: number;
  max: number;
  currency: string;
}

export interface UserSettings {
  language: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  dataRetentionDays: number;
  aiPreference: string[];
}

// Re-export beer and session types that are referenced
export type {ImportedBeer} from './beer';
export type {BeerSearchSession} from './session';