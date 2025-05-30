export interface UserProfile {
  id: string;
  version: string;
  preferences: UserPreferences;
  historyIds: string[];
  sessionIds: string[];
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

