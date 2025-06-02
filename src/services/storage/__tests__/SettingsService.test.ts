import { SettingsService } from '../SettingsService';
import { StorageService } from '../StorageService';
import { mockAppSettings } from '@/test-utils/test-helpers';

// Mock StorageService
jest.mock('../StorageService', () => ({
  StorageService: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    getStorageKeys: jest.fn(() => ({
      APP_SETTINGS: 'app_settings'
    })),
    getStorageSize: jest.fn(() => Promise.resolve({ usedSize: 1024, totalSize: 5242880 }))
  }
}));

describe('SettingsService', () => {
  const mockStorageService = StorageService as jest.Mocked<typeof StorageService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockStorageService.getItem.mockResolvedValue(null);
  });

  describe('getSettings', () => {
    it('should return stored settings', async () => {
      mockStorageService.getItem.mockResolvedValueOnce(mockAppSettings);
      
      const settings = await SettingsService.getSettings();
      expect(settings).toEqual(mockAppSettings);
      expect(mockStorageService.getItem).toHaveBeenCalledWith('app_settings');
    });

    it('should return default settings when none exist', async () => {
      mockStorageService.getItem.mockResolvedValueOnce(null);
      
      const settings = await SettingsService.getSettings();
      expect(settings.version).toBe('1.0.0');
      expect(settings.launchCount).toBe(1);
      expect(settings.onboardingCompleted).toBe(false);
      expect(settings.dataBackupEnabled).toBe(true);
    });
  });

  describe('saveSettings', () => {
    it('should save valid settings', async () => {
      await SettingsService.saveSettings(mockAppSettings);
      
      expect(mockStorageService.setItem).toHaveBeenCalledWith('app_settings', mockAppSettings);
    });

    it('should validate settings before saving', async () => {
      const invalidSettings = { ...mockAppSettings, version: '' };
      
      await expect(SettingsService.saveSettings(invalidSettings))
        .rejects.toThrow('Invalid settings');
    });

    it('should validate launch count', async () => {
      const invalidSettings = { ...mockAppSettings, launchCount: -1 };
      
      await expect(SettingsService.saveSettings(invalidSettings))
        .rejects.toThrow('Launch count must be a non-negative number');
    });

    it('should validate cache settings', async () => {
      const invalidSettings = {
        ...mockAppSettings,
        cacheSettings: {
          maxCacheSize: -1,
          cacheRetentionDays: 30
        }
      };
      
      await expect(SettingsService.saveSettings(invalidSettings))
        .rejects.toThrow('Max cache size must be a positive number');
    });
  });

  describe('updateSettings', () => {
    it('should update existing settings', async () => {
      mockStorageService.getItem.mockResolvedValueOnce(mockAppSettings);
      
      const updates = { analyticsEnabled: true };
      await SettingsService.updateSettings(updates);
      
      expect(mockStorageService.setItem).toHaveBeenCalledWith(
        'app_settings',
        expect.objectContaining({
          ...mockAppSettings,
          ...updates
        })
      );
    });

    it('should merge with existing settings', async () => {
      const existingSettings = { ...mockAppSettings, launchCount: 10 };
      mockStorageService.getItem.mockResolvedValueOnce(existingSettings);
      
      const updates = { analyticsEnabled: true };
      await SettingsService.updateSettings(updates);
      
      expect(mockStorageService.setItem).toHaveBeenCalledWith(
        'app_settings',
        expect.objectContaining({
          launchCount: 10,
          analyticsEnabled: true
        })
      );
    });
  });

  describe('initializeSettings', () => {
    it('should create new settings if none exist', async () => {
      mockStorageService.getItem.mockResolvedValueOnce(null);
      
      const settings = await SettingsService.initializeSettings();
      
      expect(settings.launchCount).toBe(1);
      expect(settings.firstLaunch).toBeInstanceOf(Date);
      expect(settings.lastLaunch).toBeInstanceOf(Date);
      expect(mockStorageService.setItem).toHaveBeenCalled();
    });

    it('should update launch count for existing settings', async () => {
      const existingSettings = { ...mockAppSettings, launchCount: 5 };
      mockStorageService.getItem.mockResolvedValueOnce(existingSettings);
      
      const settings = await SettingsService.initializeSettings();
      
      expect(settings.launchCount).toBe(6);
      expect(settings.lastLaunch).toBeInstanceOf(Date);
    });
  });

  describe('completeOnboarding', () => {
    it('should set onboarding as completed', async () => {
      mockStorageService.getItem.mockResolvedValueOnce(mockAppSettings);
      
      await SettingsService.completeOnboarding();
      
      expect(mockStorageService.setItem).toHaveBeenCalledWith(
        'app_settings',
        expect.objectContaining({
          onboardingCompleted: true
        })
      );
    });
  });

  describe('resetOnboarding', () => {
    it('should reset onboarding status', async () => {
      const completedSettings = { ...mockAppSettings, onboardingCompleted: true };
      mockStorageService.getItem.mockResolvedValueOnce(completedSettings);
      
      await SettingsService.resetOnboarding();
      
      expect(mockStorageService.setItem).toHaveBeenCalledWith(
        'app_settings',
        expect.objectContaining({
          onboardingCompleted: false
        })
      );
    });
  });

  describe('isFirstLaunch', () => {
    it('should return true for first launch', async () => {
      const firstLaunchSettings = { ...mockAppSettings, launchCount: 1 };
      mockStorageService.getItem.mockResolvedValueOnce(firstLaunchSettings);
      
      const isFirst = await SettingsService.isFirstLaunch();
      expect(isFirst).toBe(true);
    });

    it('should return false for subsequent launches', async () => {
      const existingSettings = { ...mockAppSettings, launchCount: 5 };
      mockStorageService.getItem.mockResolvedValueOnce(existingSettings);
      
      const isFirst = await SettingsService.isFirstLaunch();
      expect(isFirst).toBe(false);
    });
  });

  describe('getStorageInfo', () => {
    it('should return storage information', async () => {
      mockStorageService.getItem.mockResolvedValueOnce(mockAppSettings);
      
      const info = await SettingsService.getStorageInfo();
      
      expect(info.usedSize).toBe(1024);
      expect(info.maxSize).toBe(mockAppSettings.cacheSettings.maxCacheSize);
      expect(info.retentionDays).toBe(mockAppSettings.cacheSettings.cacheRetentionDays);
    });
  });

  describe('updateCacheSettings', () => {
    it('should update cache settings', async () => {
      mockStorageService.getItem.mockResolvedValueOnce(mockAppSettings);
      
      const cacheUpdates = { maxCacheSize: 20971520 }; // 20MB
      await SettingsService.updateCacheSettings(cacheUpdates);
      
      expect(mockStorageService.setItem).toHaveBeenCalledWith(
        'app_settings',
        expect.objectContaining({
          cacheSettings: expect.objectContaining({
            maxCacheSize: 20971520,
            cacheRetentionDays: 30 // Unchanged
          })
        })
      );
    });
  });

  describe('resetToDefaults', () => {
    it('should reset to default settings while preserving certain values', async () => {
      const existingSettings = {
        ...mockAppSettings,
        launchCount: 25,
        analyticsEnabled: true,
        onboardingCompleted: true
      };
      mockStorageService.getItem.mockResolvedValueOnce(existingSettings);
      
      await SettingsService.resetToDefaults();
      
      expect(mockStorageService.setItem).toHaveBeenCalledWith(
        'app_settings',
        expect.objectContaining({
          analyticsEnabled: false, // Reset to default
          launchCount: 25, // Preserved
          onboardingCompleted: true, // Preserved
          firstLaunch: existingSettings.firstLaunch, // Preserved
          lastLaunch: expect.any(Date) // Updated
        })
      );
    });
  });

  describe('exportSettings', () => {
    it('should export settings as JSON string', async () => {
      mockStorageService.getItem.mockResolvedValueOnce(mockAppSettings);
      
      const exported = await SettingsService.exportSettings();
      const parsed = JSON.parse(exported);
      
      expect(parsed).toEqual(mockAppSettings);
      expect(exported).toContain('\n'); // Should be formatted
    });
  });

  describe('importSettings', () => {
    it('should import valid settings', async () => {
      const settingsJson = JSON.stringify(mockAppSettings);
      
      await SettingsService.importSettings(settingsJson);
      
      expect(mockStorageService.setItem).toHaveBeenCalledWith('app_settings', mockAppSettings);
    });

    it('should reject invalid JSON', async () => {
      const invalidJson = '{ invalid json }';
      
      await expect(SettingsService.importSettings(invalidJson))
        .rejects.toThrow('Failed to import settings');
    });

    it('should validate imported settings', async () => {
      const invalidSettings = { ...mockAppSettings, version: '' };
      const settingsJson = JSON.stringify(invalidSettings);
      
      await expect(SettingsService.importSettings(settingsJson))
        .rejects.toThrow('Invalid settings format');
    });
  });

  describe('clearSettings', () => {
    it('should clear all settings', async () => {
      await SettingsService.clearSettings();
      
      expect(mockStorageService.removeItem).toHaveBeenCalledWith('app_settings');
    });
  });

  describe('validateSettings', () => {
    it('should validate all required fields', () => {
      const validationMethod = (SettingsService as any).validateSettings;
      
      const result = validationMethod(mockAppSettings);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing version', () => {
      const validationMethod = (SettingsService as any).validateSettings;
      const invalidSettings = { ...mockAppSettings, version: '' };
      
      const result = validationMethod(invalidSettings);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Version is required');
    });

    it('should detect invalid boolean fields', () => {
      const validationMethod = (SettingsService as any).validateSettings;
      const invalidSettings = { ...mockAppSettings, onboardingCompleted: 'not a boolean' };
      
      const result = validationMethod(invalidSettings);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Onboarding completed must be a boolean');
    });

    it('should validate cache settings', () => {
      const validationMethod = (SettingsService as any).validateSettings;
      const invalidSettings = {
        ...mockAppSettings,
        cacheSettings: {
          maxCacheSize: 0,
          cacheRetentionDays: -1
        }
      };
      
      const result = validationMethod(invalidSettings);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Max cache size must be a positive number');
      expect(result.errors).toContain('Cache retention days must be a positive number');
    });
  });
});