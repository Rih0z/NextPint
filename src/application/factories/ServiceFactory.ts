import { StorageService } from '@/services/storage/StorageService';
import { BeerHistoryService } from '@/services/storage/BeerHistoryService';
import { SessionService } from '@/services/storage/SessionService';
import { UserProfileService } from '@/services/storage/UserProfileService';
import { SettingsService } from '@/services/storage/SettingsService';
import { PromptService } from '@/services/prompt/PromptService';
import { AnalyticsService } from '@/services/analytics/AnalyticsService';

export interface IStorageService {
  getBeerHistory(): Promise<any[]>;
  saveBeerHistory(beers: any[]): Promise<void>;
  getSessions(): Promise<any[]>;
  saveSessions(sessions: any[]): Promise<void>;
  getUserProfile(): Promise<any>;
  saveUserProfile(profile: any): Promise<void>;
  getSettings(): Promise<any>;
  saveSettings(settings: any): Promise<void>;
}

export interface IPromptService {
  generateSessionPrompt(profile: any): Promise<string>;
  getTemplates(): Promise<any[]>;
  getTemplate(id: string): Promise<any>;
}

export interface IAnalyticsService {
  trackEvent(event: string, data?: any): void;
  getInsights(): Promise<any>;
  exportData(): string;
}

class StorageServiceImpl implements IStorageService {
  async getBeerHistory(): Promise<any[]> {
    return BeerHistoryService.getImportedBeers();
  }

  async saveBeerHistory(beers: any[]): Promise<void> {
    await BeerHistoryService.addImportedBeers(beers);
  }

  async getSessions(): Promise<any[]> {
    return SessionService.getSessions();
  }

  async saveSessions(sessions: any[]): Promise<void> {
    for (const session of sessions) {
      await SessionService.createSession(session);
    }
  }

  async getUserProfile(): Promise<any> {
    return UserProfileService.getUserProfile();
  }

  async saveUserProfile(profile: any): Promise<void> {
    await UserProfileService.saveUserProfile(profile);
  }

  async getSettings(): Promise<any> {
    return SettingsService.getSettings();
  }

  async saveSettings(settings: any): Promise<void> {
    await SettingsService.saveSettings(settings);
  }
}

/**
 * Service Factory - Dependency Injection Container
 * 
 * Provides centralized service management following SOLID principles:
 * - Single Responsibility: Each service has one clear purpose
 * - Open/Closed: Easy to extend with new services
 * - Dependency Inversion: Depend on abstractions, not concretions
 */
export class ServiceFactory {
  private static storageService: IStorageService | null = null;
  private static promptService: IPromptService | null = null;
  private static analyticsService: IAnalyticsService | null = null;

  /**
   * Get Storage Service instance (Singleton)
   */
  static getStorageService(): IStorageService {
    if (!this.storageService) {
      this.storageService = new StorageServiceImpl();
    }
    return this.storageService;
  }

  /**
   * Get Prompt Service instance (Singleton)
   */
  static getPromptService(): IPromptService {
    if (!this.promptService) {
      this.promptService = new PromptService();
    }
    return this.promptService;
  }

  /**
   * Get Analytics Service instance (Singleton)
   */
  static getAnalyticsService(): IAnalyticsService {
    if (!this.analyticsService) {
      this.analyticsService = new AnalyticsService();
    }
    return this.analyticsService;
  }

  /**
   * Set custom Storage Service (for testing/mocking)
   */
  static setStorageService(service: IStorageService): void {
    this.storageService = service;
  }

  /**
   * Set custom Prompt Service (for testing/mocking)
   */
  static setPromptService(service: IPromptService): void {
    this.promptService = service;
  }

  /**
   * Set custom Analytics Service (for testing/mocking)
   */
  static setAnalyticsService(service: IAnalyticsService): void {
    this.analyticsService = service;
  }

  /**
   * Reset all services (for testing)
   */
  static resetServices(): void {
    this.storageService = null;
    this.promptService = null;
    this.analyticsService = null;
  }
}