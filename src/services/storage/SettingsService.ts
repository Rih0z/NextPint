import {AppSettings, ValidationResult} from '@/types';
import {StorageService} from './StorageService';

export class SettingsService {
  private static readonly STORAGE_KEY = StorageService.getStorageKeys().APP_SETTINGS;
  private static readonly DEFAULT_SETTINGS: AppSettings = {
    version: '1.0.0',
    firstLaunch: new Date(),
    lastLaunch: new Date(),
    launchCount: 1,
    onboardingCompleted: false,
    dataBackupEnabled: true,
    analyticsEnabled: false,
    crashReportingEnabled: false,
    autoUpdateTemplates: true,
    cacheSettings: {
      maxCacheSize: 10 * 1024 * 1024, // 10MB
      cacheRetentionDays: 30,
    },
  };

  static async getSettings(): Promise<AppSettings> {
    const settings = await StorageService.getItem<AppSettings>(this.STORAGE_KEY);
    return settings || this.DEFAULT_SETTINGS;
  }

  static async saveSettings(settings: AppSettings): Promise<void> {
    const validation = this.validateSettings(settings);
    if (!validation.isValid) {
      throw new Error(`Invalid settings: ${validation.errors.join(', ')}`);
    }

    await StorageService.setItem(this.STORAGE_KEY, settings);
  }

  static async updateSettings(updates: Partial<AppSettings>): Promise<void> {
    const currentSettings = await this.getSettings();
    const newSettings = {
      ...currentSettings,
      ...updates,
    };

    await this.saveSettings(newSettings);
  }

  static async initializeSettings(): Promise<AppSettings> {
    const existingSettings = await StorageService.getItem<AppSettings>(this.STORAGE_KEY);

    if (existingSettings) {
      // Update launch count and last launch date
      existingSettings.launchCount += 1;
      existingSettings.lastLaunch = new Date();
      await this.saveSettings(existingSettings);
      return existingSettings;
    } else {
      // Create new settings with current date
      const newSettings = {
        ...this.DEFAULT_SETTINGS,
        firstLaunch: new Date(),
        lastLaunch: new Date(),
      };
      await this.saveSettings(newSettings);
      return newSettings;
    }
  }

  static async completeOnboarding(): Promise<void> {
    await this.updateSettings({
      onboardingCompleted: true,
    });
  }

  static async resetOnboarding(): Promise<void> {
    await this.updateSettings({
      onboardingCompleted: false,
    });
  }

  static async isFirstLaunch(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.launchCount === 1;
  }

  static async getStorageInfo(): Promise<{
    usedSize: number;
    maxSize: number;
    retentionDays: number;
  }> {
    const settings = await this.getSettings();
    const storageSize = await StorageService.getStorageSize();

    return {
      usedSize: storageSize.usedSize,
      maxSize: settings.cacheSettings.maxCacheSize,
      retentionDays: settings.cacheSettings.cacheRetentionDays,
    };
  }

  static async updateCacheSettings(cacheSettings: Partial<AppSettings['cacheSettings']>): Promise<void> {
    const currentSettings = await this.getSettings();
    await this.updateSettings({
      cacheSettings: {
        ...currentSettings.cacheSettings,
        ...cacheSettings,
      },
    });
  }

  static async resetToDefaults(): Promise<void> {
    const currentSettings = await this.getSettings();
    const resetSettings = {
      ...this.DEFAULT_SETTINGS,
      // Preserve certain values
      firstLaunch: currentSettings.firstLaunch,
      launchCount: currentSettings.launchCount,
      onboardingCompleted: currentSettings.onboardingCompleted,
      lastLaunch: new Date(),
    };

    await this.saveSettings(resetSettings);
  }

  static async exportSettings(): Promise<string> {
    const settings = await this.getSettings();
    return JSON.stringify(settings, null, 2);
  }

  static async importSettings(settingsJson: string): Promise<void> {
    try {
      const settings = JSON.parse(settingsJson) as AppSettings;
      const validation = this.validateSettings(settings);
      
      if (!validation.isValid) {
        throw new Error(`Invalid settings format: ${validation.errors.join(', ')}`);
      }

      await this.saveSettings(settings);
    } catch (error) {
      throw new Error(`Failed to import settings: ${error}`);
    }
  }

  static async clearSettings(): Promise<void> {
    await StorageService.removeItem(this.STORAGE_KEY);
  }

  private static validateSettings(settings: AppSettings): ValidationResult {
    const errors: string[] = [];

    if (!settings.version) {
      errors.push('Version is required');
    }

    if (!settings.firstLaunch) {
      errors.push('First launch date is required');
    }

    if (!settings.lastLaunch) {
      errors.push('Last launch date is required');
    }

    if (typeof settings.launchCount !== 'number' || settings.launchCount < 0) {
      errors.push('Launch count must be a non-negative number');
    }

    if (typeof settings.onboardingCompleted !== 'boolean') {
      errors.push('Onboarding completed must be a boolean');
    }

    if (typeof settings.dataBackupEnabled !== 'boolean') {
      errors.push('Data backup enabled must be a boolean');
    }

    if (typeof settings.analyticsEnabled !== 'boolean') {
      errors.push('Analytics enabled must be a boolean');
    }

    if (typeof settings.crashReportingEnabled !== 'boolean') {
      errors.push('Crash reporting enabled must be a boolean');
    }

    if (typeof settings.autoUpdateTemplates !== 'boolean') {
      errors.push('Auto update templates must be a boolean');
    }

    if (!settings.cacheSettings) {
      errors.push('Cache settings are required');
    } else {
      if (typeof settings.cacheSettings.maxCacheSize !== 'number' || settings.cacheSettings.maxCacheSize <= 0) {
        errors.push('Max cache size must be a positive number');
      }

      if (typeof settings.cacheSettings.cacheRetentionDays !== 'number' || settings.cacheSettings.cacheRetentionDays <= 0) {
        errors.push('Cache retention days must be a positive number');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}