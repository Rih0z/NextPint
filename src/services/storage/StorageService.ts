import {ValidationResult} from '@/types/storage';

export class StorageService {
  private static readonly STORAGE_KEYS = {
    USER_PROFILE: 'user_profile',
    IMPORTED_BEERS: 'imported_beers',
    SEARCH_SESSIONS: 'search_sessions',
    PROMPT_TEMPLATES_CACHE: 'prompt_templates_cache',
    APP_SETTINGS: 'app_settings',
  } as const;

  static async setItem<T>(key: string, value: T): Promise<void> {
    try {
      if (typeof window === 'undefined') return; // SSR guard
      const jsonValue = JSON.stringify(value);
      localStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error saving data for key ${key}:`, error);
      throw new Error(`Failed to save data: ${error}`);
    }
  }

  static async getItem<T>(key: string): Promise<T | null> {
    try {
      if (typeof window === 'undefined') return null; // SSR guard
      const jsonValue = localStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Error retrieving data for key ${key}:`, error);
      return null;
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      if (typeof window === 'undefined') return; // SSR guard
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing data for key ${key}:`, error);
      throw new Error(`Failed to remove data: ${error}`);
    }
  }

  static async clear(): Promise<void> {
    try {
      if (typeof window === 'undefined') return; // SSR guard
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw new Error(`Failed to clear storage: ${error}`);
    }
  }

  static async getAllKeys(): Promise<string[]> {
    try {
      if (typeof window === 'undefined') return []; // SSR guard
      return Object.keys(localStorage);
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }

  static async getStorageSize(): Promise<{usedSize: number; totalSize: number}> {
    try {
      if (typeof window === 'undefined') return {usedSize: 0, totalSize: 0}; // SSR guard
      const keys = await this.getAllKeys();
      let usedSize = 0;

      for (const key of keys) {
        const value = localStorage.getItem(key);
        if (value) {
          usedSize += new Blob([value]).size;
        }
      }

      return {
        usedSize,
        totalSize: 5 * 1024 * 1024, // 5MB localStorage typical limit
      };
    } catch (error) {
      console.error('Error calculating storage size:', error);
      return {usedSize: 0, totalSize: 0};
    }
  }

  static validateData<T>(data: T, validator: (data: T) => ValidationResult): ValidationResult {
    try {
      return validator(data);
    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation error: ${error}`],
      };
    }
  }

  static getStorageKeys() {
    return Object.freeze({ ...this.STORAGE_KEYS });
  }
}