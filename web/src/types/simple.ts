// Simplified types for MVP implementation

export interface UserProfile {
  id: string;
  favoriteStyles: string[];
  avoidList: string[];
  totalBeers: number;
  lastUpdated: string;
}

export interface ImportedBeer {
  id: string;
  name: string;
  brewery: string;
  style: string;
  rating: number;
  notes?: string;
  source: 'untappd' | 'ratebeer' | 'beeradvocate';
  date?: string;
  importedAt: string;
}

export interface BeerSearchSession {
  sessionId: string;
  createdAt: string;
  profile: {
    sessionGoal: string;
    mood: 'adventurous' | 'stable' | 'relaxed';
    tastePreference: {
      primary: 'hoppy' | 'malty' | 'balanced';
      avoid: string[];
    };
    constraints: {
      location: string;
      budget: string;
      other: string[];
    };
    searchKeywords: string[];
  };
  results?: {
    prompt: string;
    copiedAt?: string;
    aiResponse?: string;
  };
}