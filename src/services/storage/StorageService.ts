import AsyncStorage from '@react-native-async-storage/async-storage';
import {ValidationResult} from '@types/storage';

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
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error saving data for key ${key}:`, error);
      throw new Error(`Failed to save data: ${error}`);
    }
  }

  static async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Error retrieving data for key ${key}:`, error);
      return null;
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing data for key ${key}:`, error);
      throw new Error(`Failed to remove data: ${error}`);
    }
  }

  static async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw new Error(`Failed to clear storage: ${error}`);
    }
  }

  static async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }

  static async getStorageSize(): Promise<{usedSize: number; totalSize: number}> {
    try {
      const keys = await this.getAllKeys();
      let usedSize = 0;

      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          usedSize += new Blob([value]).size;
        }
      }

      return {
        usedSize,
        totalSize: 10 * 1024 * 1024, // 10MB typical limit
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
    return this.STORAGE_KEYS;
  }
}