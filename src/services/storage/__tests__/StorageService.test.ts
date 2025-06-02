import { StorageService } from '../StorageService';
import { createMockLocalStorage } from '@/test-utils/test-helpers';

describe('StorageService', () => {
  let mockLocalStorage: ReturnType<typeof createMockLocalStorage>;

  beforeEach(() => {
    mockLocalStorage = createMockLocalStorage();
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('setItem', () => {
    it('should save data to localStorage', async () => {
      const data = { foo: 'bar', num: 123 };
      await StorageService.setItem('test_key', data);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test_key', JSON.stringify(data));
    });

    it('should handle complex data structures', async () => {
      const data = {
        array: [1, 2, 3],
        nested: { a: { b: { c: 'deep' } } },
        date: new Date('2024-01-01')
      };
      await StorageService.setItem('complex', data);
      
      const saved = mockLocalStorage.setItem.mock.calls[0][1];
      expect(JSON.parse(saved)).toEqual({
        array: [1, 2, 3],
        nested: { a: { b: { c: 'deep' } } },
        date: '2024-01-01T00:00:00.000Z'
      });
    });

    it('should handle null and undefined', async () => {
      await StorageService.setItem('null', null);
      await StorageService.setItem('undefined', undefined);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('null', 'null');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('undefined', undefined);
    });

    it('should throw error on localStorage failure', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockLocalStorage.setItem.mockImplementationOnce(() => {
        throw new Error('QuotaExceededError');
      });

      await expect(StorageService.setItem('fail', 'data'))
        .rejects.toThrow('Failed to save data');
      
      consoleSpy.mockRestore();
    });

    it('should handle SSR (no window)', async () => {
      const windowBackup = global.window;
      // @ts-expect-error
      delete global.window;
      
      await expect(StorageService.setItem('ssr', 'data')).resolves.not.toThrow();
      
      global.window = windowBackup;
    });
  });

  describe('getItem', () => {
    it('should retrieve data from localStorage', async () => {
      const data = { test: 'value' };
      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(data));
      
      const result = await StorageService.getItem('test_key');
      expect(result).toEqual(data);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('test_key');
    });

    it('should return null for non-existent key', async () => {
      mockLocalStorage.getItem.mockReturnValueOnce(null);
      
      const result = await StorageService.getItem('missing');
      expect(result).toBeNull();
    });

    it('should handle invalid JSON gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockLocalStorage.getItem.mockReturnValueOnce('invalid json {');
      
      const result = await StorageService.getItem('invalid');
      expect(result).toBeNull();
      
      consoleSpy.mockRestore();
    });

    it('should handle localStorage errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockLocalStorage.getItem.mockImplementationOnce(() => {
        throw new Error('Access denied');
      });

      const result = await StorageService.getItem('error');
      expect(result).toBeNull();
      
      consoleSpy.mockRestore();
    });

    it('should handle SSR (no window)', async () => {
      const windowBackup = global.window;
      // @ts-expect-error
      delete global.window;
      
      const result = await StorageService.getItem('ssr');
      expect(result).toBeNull();
      
      global.window = windowBackup;
    });
  });

  describe('removeItem', () => {
    it('should remove item from localStorage', async () => {
      await StorageService.removeItem('test_key');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test_key');
    });

    it('should throw error on failure', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockLocalStorage.removeItem.mockImplementationOnce(() => {
        throw new Error('Remove failed');
      });

      await expect(StorageService.removeItem('fail'))
        .rejects.toThrow('Failed to remove data');
      
      consoleSpy.mockRestore();
    });

    it('should handle SSR', async () => {
      const windowBackup = global.window;
      // @ts-expect-error
      delete global.window;
      
      await expect(StorageService.removeItem('ssr')).resolves.not.toThrow();
      
      global.window = windowBackup;
    });
  });

  describe('clear', () => {
    it('should clear all localStorage', async () => {
      await StorageService.clear();
      expect(mockLocalStorage.clear).toHaveBeenCalled();
    });

    it('should throw error on failure', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockLocalStorage.clear.mockImplementationOnce(() => {
        throw new Error('Clear failed');
      });

      await expect(StorageService.clear())
        .rejects.toThrow('Failed to clear storage');
      
      consoleSpy.mockRestore();
    });

    it('should handle SSR', async () => {
      const windowBackup = global.window;
      // @ts-expect-error
      delete global.window;
      
      await expect(StorageService.clear()).resolves.not.toThrow();
      
      global.window = windowBackup;
    });
  });

  describe('getAllKeys', () => {
    it('should return all localStorage keys', async () => {
      // Mock Object.keys(localStorage) to return our test keys
      const mockKeys = ['key1', 'key2', 'key3'];
      const originalObjectKeys = Object.keys;
      Object.keys = jest.fn((obj) => {
        if (obj === window.localStorage) {
          return mockKeys;
        }
        return originalObjectKeys(obj);
      });
      
      const keys = await StorageService.getAllKeys();
      expect(keys).toEqual(mockKeys);
      
      Object.keys = originalObjectKeys;
    });

    it('should return empty array on error', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      Object.defineProperty(window, 'localStorage', {
        get() { throw new Error('Access denied'); }
      });

      const keys = await StorageService.getAllKeys();
      expect(keys).toEqual([]);
      
      consoleSpy.mockRestore();
    });

    it('should handle SSR', async () => {
      const windowBackup = global.window;
      // @ts-expect-error
      delete global.window;
      
      const keys = await StorageService.getAllKeys();
      expect(keys).toEqual([]);
      
      global.window = windowBackup;
    });
  });

  describe('getStorageSize', () => {
    it('should calculate storage size', async () => {
      const data1 = JSON.stringify({ large: 'x'.repeat(1000) });
      const data2 = JSON.stringify({ small: 'data' });
      
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'key1') return data1;
        if (key === 'key2') return data2;
        return null;
      });
      
      // Mock getAllKeys to return our test keys
      jest.spyOn(StorageService, 'getAllKeys').mockResolvedValueOnce(['key1', 'key2']);
      
      const size = await StorageService.getStorageSize();
      
      expect(size.usedSize).toBe(new Blob([data1]).size + new Blob([data2]).size);
      expect(size.totalSize).toBe(5 * 1024 * 1024); // 5MB
    });

    it('should handle empty storage', async () => {
      jest.spyOn(StorageService, 'getAllKeys').mockResolvedValueOnce([]);
      
      const size = await StorageService.getStorageSize();
      expect(size.usedSize).toBe(0);
    });

    it('should handle errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      jest.spyOn(StorageService, 'getAllKeys').mockRejectedValueOnce(new Error('Failed'));
      
      const size = await StorageService.getStorageSize();
      expect(size).toEqual({ usedSize: 0, totalSize: 0 });
      
      consoleSpy.mockRestore();
    });

    it('should handle SSR', async () => {
      const windowBackup = global.window;
      // @ts-expect-error
      delete global.window;
      
      const size = await StorageService.getStorageSize();
      expect(size).toEqual({ usedSize: 0, totalSize: 0 });
      
      global.window = windowBackup;
    });
  });

  describe('validateData', () => {
    it('should validate data with validator function', () => {
      const validator = (data: any) => ({
        isValid: data.value > 0,
        errors: data.value > 0 ? [] : ['Value must be positive']
      });

      const result1 = StorageService.validateData({ value: 5 }, validator);
      expect(result1.isValid).toBe(true);
      expect(result1.errors).toEqual([]);

      const result2 = StorageService.validateData({ value: -1 }, validator);
      expect(result2.isValid).toBe(false);
      expect(result2.errors).toContain('Value must be positive');
    });

    it('should handle validator errors', () => {
      const validator = () => {
        throw new Error('Validator crashed');
      };

      const result = StorageService.validateData({}, validator);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Validation error: Error: Validator crashed');
    });
  });

  describe('getStorageKeys', () => {
    it('should return storage key constants', () => {
      const keys = StorageService.getStorageKeys();
      
      expect(keys.USER_PROFILE).toBe('user_profile');
      expect(keys.IMPORTED_BEERS).toBe('imported_beers');
      expect(keys.SEARCH_SESSIONS).toBe('search_sessions');
      expect(keys.PROMPT_TEMPLATES_CACHE).toBe('prompt_templates_cache');
      expect(keys.APP_SETTINGS).toBe('app_settings');
    });

    it('should return frozen object', () => {
      const keys = StorageService.getStorageKeys();
      
      // Check if object is frozen
      expect(Object.isFrozen(keys)).toBe(true);
    });
  });
});