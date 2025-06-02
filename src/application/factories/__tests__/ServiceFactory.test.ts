import { ServiceFactory } from '../ServiceFactory';
import { PromptService } from '@/services/prompt/PromptService';
import { AnalyticsService } from '@/services/analytics/AnalyticsService';
import { mockImportedBeer, mockBeerSearchSession, mockUserProfile, mockAppSettings } from '@/test-utils/test-helpers';

// Mock the services
jest.mock('@/services/prompt/PromptService');
jest.mock('@/services/analytics/AnalyticsService');
jest.mock('@/services/storage/BeerHistoryService', () => ({
  BeerHistoryService: {
    getImportedBeers: jest.fn(() => Promise.resolve([])),
    addImportedBeers: jest.fn(() => Promise.resolve())
  }
}));
jest.mock('@/services/storage/SessionService', () => ({
  SessionService: {
    getSessions: jest.fn(() => Promise.resolve([])),
    createSession: jest.fn(() => Promise.resolve())
  }
}));
jest.mock('@/services/storage/UserProfileService', () => ({
  UserProfileService: {
    getUserProfile: jest.fn(() => Promise.resolve(null)),
    saveUserProfile: jest.fn(() => Promise.resolve())
  }
}));
jest.mock('@/services/storage/SettingsService', () => ({
  SettingsService: {
    getSettings: jest.fn(() => Promise.resolve({})),
    saveSettings: jest.fn(() => Promise.resolve())
  }
}));

describe('ServiceFactory', () => {
  beforeEach(() => {
    // Reset the singleton instances
    ServiceFactory.resetServices();
    jest.clearAllMocks();
  });

  describe('getStorageService', () => {
    it('should return a storage service instance', () => {
      const service = ServiceFactory.getStorageService();
      expect(service).toBeDefined();
      expect(service.getBeerHistory).toBeDefined();
      expect(service.saveBeerHistory).toBeDefined();
      expect(service.getSessions).toBeDefined();
      expect(service.saveSessions).toBeDefined();
      expect(service.getUserProfile).toBeDefined();
      expect(service.saveUserProfile).toBeDefined();
      expect(service.getSettings).toBeDefined();
      expect(service.saveSettings).toBeDefined();
    });

    it('should return the same instance on multiple calls (singleton)', () => {
      const service1 = ServiceFactory.getStorageService();
      const service2 = ServiceFactory.getStorageService();
      expect(service1).toBe(service2);
    });

    it('should handle getBeerHistory', async () => {
      const service = ServiceFactory.getStorageService();
      const beers = await service.getBeerHistory();
      expect(Array.isArray(beers)).toBe(true);
    });

    it('should handle saveBeerHistory', async () => {
      const service = ServiceFactory.getStorageService();
      await expect(service.saveBeerHistory([mockImportedBeer])).resolves.not.toThrow();
    });

    it('should handle getSessions', async () => {
      const service = ServiceFactory.getStorageService();
      const sessions = await service.getSessions();
      expect(Array.isArray(sessions)).toBe(true);
    });

    it('should handle saveSessions', async () => {
      const service = ServiceFactory.getStorageService();
      await expect(service.saveSessions([mockBeerSearchSession])).resolves.not.toThrow();
    });

    it('should handle getUserProfile', async () => {
      const service = ServiceFactory.getStorageService();
      await service.getUserProfile();
      // Test passes if no error is thrown
    });

    it('should handle saveUserProfile', async () => {
      const service = ServiceFactory.getStorageService();
      await expect(service.saveUserProfile(mockUserProfile)).resolves.not.toThrow();
    });

    it('should handle getSettings', async () => {
      const service = ServiceFactory.getStorageService();
      await service.getSettings();
      // Test passes if no error is thrown
    });

    it('should handle saveSettings', async () => {
      const service = ServiceFactory.getStorageService();
      await expect(service.saveSettings(mockAppSettings)).resolves.not.toThrow();
    });
  });

  describe('getPromptService', () => {
    it('should return a prompt service instance', () => {
      const service = ServiceFactory.getPromptService();
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(PromptService);
    });

    it('should return the same instance on multiple calls (singleton)', () => {
      const service1 = ServiceFactory.getPromptService();
      const service2 = ServiceFactory.getPromptService();
      expect(service1).toBe(service2);
    });

    it('should have required methods', () => {
      const service = ServiceFactory.getPromptService();
      expect(service.generateSessionPrompt).toBeDefined();
      expect(service.getTemplates).toBeDefined();
      expect(service.getTemplate).toBeDefined();
    });
  });

  describe('getAnalyticsService', () => {
    it('should return an analytics service instance', () => {
      const service = ServiceFactory.getAnalyticsService();
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(AnalyticsService);
    });

    it('should return the same instance on multiple calls (singleton)', () => {
      const service1 = ServiceFactory.getAnalyticsService();
      const service2 = ServiceFactory.getAnalyticsService();
      expect(service1).toBe(service2);
    });

    it('should have required methods', () => {
      const service = ServiceFactory.getAnalyticsService();
      expect(service.trackEvent).toBeDefined();
      expect(service.getInsights).toBeDefined();
      expect(service.exportData).toBeDefined();
    });
  });

  describe('setStorageService', () => {
    it('should allow setting a custom storage service', () => {
      const mockService = {
        getBeerHistory: jest.fn(),
        saveBeerHistory: jest.fn(),
        getSessions: jest.fn(),
        saveSessions: jest.fn(),
        getUserProfile: jest.fn(),
        saveUserProfile: jest.fn(),
        getSettings: jest.fn(),
        saveSettings: jest.fn(),
      };

      ServiceFactory.setStorageService(mockService);
      const service = ServiceFactory.getStorageService();
      expect(service).toBe(mockService);
    });
  });

  describe('setPromptService', () => {
    it('should allow setting a custom prompt service', () => {
      const mockService = {
        generateSessionPrompt: jest.fn(),
        getTemplates: jest.fn(),
        getTemplate: jest.fn(),
      };

      ServiceFactory.setPromptService(mockService);
      const service = ServiceFactory.getPromptService();
      expect(service).toBe(mockService);
    });
  });

  describe('setAnalyticsService', () => {
    it('should allow setting a custom analytics service', () => {
      const mockService = {
        trackEvent: jest.fn(),
        getInsights: jest.fn(),
        exportData: jest.fn(),
      };

      ServiceFactory.setAnalyticsService(mockService);
      const service = ServiceFactory.getAnalyticsService();
      expect(service).toBe(mockService);
    });
  });

  describe('resetServices', () => {
    it('should reset all services to null', () => {
      // Set some services first
      const mockStorageService = {
        getBeerHistory: jest.fn(),
        saveBeerHistory: jest.fn(),
        getSessions: jest.fn(),
        saveSessions: jest.fn(),
        getUserProfile: jest.fn(),
        saveUserProfile: jest.fn(),
        getSettings: jest.fn(),
        saveSettings: jest.fn(),
      };
      ServiceFactory.setStorageService(mockStorageService);

      // Reset services
      ServiceFactory.resetServices();

      // Get services again - should create new instances
      const storageService = ServiceFactory.getStorageService();
      const promptService = ServiceFactory.getPromptService();
      const analyticsService = ServiceFactory.getAnalyticsService();

      // Should not be the same as the mock
      expect(storageService).not.toBe(mockStorageService);
      expect(promptService).toBeInstanceOf(PromptService);
      expect(analyticsService).toBeInstanceOf(AnalyticsService);
    });
  });
});