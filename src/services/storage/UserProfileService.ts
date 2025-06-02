import {v4 as uuidv4} from 'uuid';
import {UserProfile, UserPreferences, ValidationResult} from '@/types';
import {StorageService} from './StorageService';

export class UserProfileService {
  private static readonly STORAGE_KEY = StorageService.getStorageKeys().USER_PROFILE;

  static async getUserProfile(): Promise<UserProfile | null> {
    return await StorageService.getItem<UserProfile>(this.STORAGE_KEY);
  }

  static async saveUserProfile(profile: UserProfile): Promise<void> {
    const validation = this.validateUserProfile(profile);
    if (!validation.isValid) {
      throw new Error(`Invalid user profile: ${validation.errors.join(', ')}`);
    }

    profile.updatedAt = new Date();
    await StorageService.setItem(this.STORAGE_KEY, profile);
  }

  static async createUserProfile(preferences?: Partial<UserPreferences>): Promise<UserProfile> {
    const profile: UserProfile = {
      id: uuidv4(),
      version: '1.0.0',
      preferences: {
        favoriteStyles: [],
        flavorProfile: {
          hoppy: 3,
          malty: 3,
          bitter: 3,
          sweet: 3,
          sour: 3,
          alcohol: 3,
        },
        avoidList: [],
        preferredBreweries: [],
        budgetRange: {
          min: 0,
          max: 10000,
          currency: 'JPY',
        },
        locationPreferences: [],
        ...preferences,
      },
      history: [],
      sessions: [],
      settings: {
        language: 'ja-JP',
        theme: 'auto',
        notifications: true,
        dataRetentionDays: 365,
        aiPreference: ['chatgpt', 'claude', 'gemini'],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.saveUserProfile(profile);
    return profile;
  }

  static async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<void> {
    const profile = await this.getUserProfile();
    if (!profile) {
      throw new Error('User profile not found');
    }

    profile.preferences = {
      ...profile.preferences,
      ...preferences,
    };

    await this.saveUserProfile(profile);
  }

  static async deleteUserProfile(): Promise<void> {
    await StorageService.removeItem(this.STORAGE_KEY);
  }

  static async hasUserProfile(): Promise<boolean> {
    const profile = await this.getUserProfile();
    return profile !== null;
  }

  private static validateUserProfile(profile: UserProfile): ValidationResult {
    const errors: string[] = [];

    if (!profile.id) {
      errors.push('User ID is required');
    }

    if (!profile.version) {
      errors.push('Version is required');
    }

    if (!profile.preferences) {
      errors.push('Preferences are required');
    } else {
      // Validate flavor profile
      const flavorProfile = profile.preferences.flavorProfile;
      if (!flavorProfile) {
        errors.push('Flavor profile is required');
      } else {
        const flavorKeys = ['hoppy', 'malty', 'bitter', 'sweet', 'sour', 'alcohol'];
        for (const key of flavorKeys) {
          const value = flavorProfile[key as keyof typeof flavorProfile];
          if (typeof value !== 'number' || value < 1 || value > 5) {
            errors.push(`${key} must be a number between 1 and 5`);
          }
        }
      }

      // Validate budget range
      const budgetRange = profile.preferences.budgetRange;
      if (!budgetRange) {
        errors.push('Budget range is required');
      } else {
        if (budgetRange.min < 0) {
          errors.push('Budget minimum cannot be negative');
        }
        if (budgetRange.max < budgetRange.min) {
          errors.push('Budget maximum must be greater than minimum');
        }
        if (!budgetRange.currency) {
          errors.push('Budget currency is required');
        }
      }
    }

    if (!profile.settings) {
      errors.push('Settings are required');
    }

    if (!profile.createdAt) {
      errors.push('Created date is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}