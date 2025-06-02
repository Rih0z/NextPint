import { ImportedBeer, BeerSearchSession, UserProfile, AppSettings, ImportSource } from '@/types';

export const mockImportedBeer: ImportedBeer = {
  id: 'beer-123',
  name: 'Test IPA',
  brewery: 'Test Brewery',
  style: 'IPA',
  abv: 6.5,
  ibu: 65,
  rating: 4.2,
  venue: 'Test Pub',
  notes: 'Great beer',
  source: ImportSource.UNTAPPD,
  tags: ['craft', 'hoppy'],
  importedAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
};

export const mockBeerSearchSession: BeerSearchSession = {
  sessionId: 'session-123',
  userId: 'user-123',
  name: 'Test Session',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  status: 'active' as any,
  profile: {
    sessionGoal: 'Find new IPAs',
    mood: 'adventurous',
    tastePreference: {
      primary: 'hoppy',
      avoid: ['sweet'],
      intensity: 4
    },
    constraints: {
      location: 'Tokyo',
      budget: '5000-15000円',
      other: []
    },
    searchKeywords: ['IPA', 'hoppy']
  },
  generatedPrompts: [{
    id: 'prompt-123',
    templateId: 'template-123',
    content: 'Find me IPAs',
    variables: {},
    generatedAt: new Date('2024-01-01'),
    copiedCount: 0
  }],
  results: [],
  notes: 'Test notes'
};

export const mockUserProfile: UserProfile = {
  id: 'user-123',
  version: '1.0.0',
  preferences: {
    favoriteStyles: ['IPA', 'Stout'],
    flavorProfile: {
      hoppy: 4,
      malty: 3,
      bitter: 4,
      sweet: 2,
      sour: 2,
      alcohol: 3
    },
    avoidList: ['Light Lager'],
    preferredBreweries: ['Test Brewery'],
    budgetRange: { min: 0, max: 20, currency: 'USD' },
    locationPreferences: ['Tokyo']
  },
  history: [],
  sessions: [],
  settings: {
    language: 'ja-JP',
    theme: 'dark',
    notifications: true,
    dataRetentionDays: 365,
    aiPreference: ['chatgpt']
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
};

export const mockAppSettings: AppSettings = {
  version: '1.0.0',
  firstLaunch: new Date('2024-01-01'),
  lastLaunch: new Date('2024-01-01'),
  launchCount: 5,
  onboardingCompleted: true,
  dataBackupEnabled: true,
  analyticsEnabled: true,
  crashReportingEnabled: false,
  autoUpdateTemplates: true,
  cacheSettings: {
    maxCacheSize: 10485760,
    cacheRetentionDays: 30
  }
};

export const createMockLocalStorage = () => {
  const store: { [key: string]: string } = {};
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
    clear: jest.fn(() => { Object.keys(store).forEach(key => delete store[key]); }),
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
    get length() { return Object.keys(store).length; }
  };
};