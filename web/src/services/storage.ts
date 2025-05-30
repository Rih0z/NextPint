import { UserProfile, ImportedBeer, BeerSearchSession, AppSettings } from '@/types';

export class StorageService {
  private static instance: StorageService;
  
  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  private async getItem<T>(key: string): Promise<T | null> {
    if (!this.isClient()) return null;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  }

  private async setItem<T>(key: string, value: T): Promise<void> {
    if (!this.isClient()) return;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
      throw error;
    }
  }

  private async removeItem(key: string): Promise<void> {
    if (!this.isClient()) return;
    
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
      throw error;
    }
  }

  // User Profile
  async getUserProfile(): Promise<UserProfile | null> {
    return this.getItem<UserProfile>('userProfile');
  }

  async saveUserProfile(profile: UserProfile): Promise<void> {
    await this.setItem('userProfile', profile);
  }

  // Beer History
  async getBeerHistory(): Promise<ImportedBeer[]> {
    return (await this.getItem<ImportedBeer[]>('beerHistory')) || [];
  }

  async saveBeerHistory(history: ImportedBeer[]): Promise<void> {
    await this.setItem('beerHistory', history);
  }

  async addBeerEntry(entry: ImportedBeer): Promise<void> {
    const history = await this.getBeerHistory();
    history.push(entry);
    await this.saveBeerHistory(history);
  }

  // Sessions
  async getSessions(): Promise<BeerSearchSession[]> {
    return (await this.getItem<BeerSearchSession[]>('sessions')) || [];
  }

  async saveSessions(sessions: BeerSearchSession[]): Promise<void> {
    await this.setItem('sessions', sessions);
  }

  async getSession(sessionId: string): Promise<BeerSearchSession | null> {
    const sessions = await this.getSessions();
    return sessions.find(s => s.sessionId === sessionId) || null;
  }

  async saveSession(session: BeerSearchSession): Promise<void> {
    const sessions = await this.getSessions();
    const index = sessions.findIndex(s => s.sessionId === session.sessionId);
    
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.push(session);
    }
    
    await this.saveSessions(sessions);
  }

  // App Settings
  async getAppSettings(): Promise<AppSettings | null> {
    return this.getItem<AppSettings>('appSettings');
  }

  async saveAppSettings(settings: AppSettings): Promise<void> {
    await this.setItem('appSettings', settings);
  }

  // Onboarding
  async isOnboardingCompleted(): Promise<boolean> {
    return (await this.getItem<boolean>('onboardingCompleted')) || false;
  }

  async setOnboardingCompleted(completed: boolean): Promise<void> {
    await this.setItem('onboardingCompleted', completed);
  }

  // Clear all data
  async clearAllData(): Promise<void> {
    const keys = ['userProfile', 'beerHistory', 'sessions', 'appSettings', 'onboardingCompleted'];
    for (const key of keys) {
      await this.removeItem(key);
    }
  }
}

export const storageService = StorageService.getInstance();