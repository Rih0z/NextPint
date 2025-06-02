import { UserProfile } from './user';
import { ImportedBeer } from './beer';
import { BeerSearchSession } from './session';

export interface AppSettings {
  version: string;
  firstLaunch: Date;
  lastLaunch: Date;
  launchCount: number;
  onboardingCompleted: boolean;
  dataBackupEnabled: boolean;
  analyticsEnabled: boolean;
  crashReportingEnabled: boolean;
  autoUpdateTemplates: boolean;
  cacheSettings: CacheSettings;
}

export interface CacheSettings {
  maxCacheSize: number;
  cacheRetentionDays: number;
}

export interface DataBackup {
  version: string;
  createdAt: Date;
  userProfile: UserProfile;
  importedBeers: ImportedBeer[];
  sessions: BeerSearchSession[];
  settings: AppSettings;
  checksum: string;
}

export interface StorageKeys {
  USER_PROFILE: 'user_profile';
  IMPORTED_BEERS: 'imported_beers';
  SEARCH_SESSIONS: 'search_sessions';
  PROMPT_TEMPLATES_CACHE: 'prompt_templates_cache';
  APP_SETTINGS: 'app_settings';
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Re-export types that are referenced
export type {UserProfile} from './user';
export type {ImportedBeer} from './beer';
export type {BeerSearchSession} from './session';