import AsyncStorage from '@react-native-async-storage/async-storage';
import {StorageService} from '../StorageService';

describe('StorageService', () => {
  beforeEach(() => {
    AsyncStorage.clear();
  });

  describe('setItem', () => {
    it('should store data correctly', async () => {
      const testData = {id: 1, name: 'Test Beer'};
      await StorageService.setItem('test_key', testData);

      const storedData = await AsyncStorage.getItem('test_key');
      expect(JSON.parse(storedData!)).toEqual(testData);
    });

    it('should throw error when storage fails', async () => {
      const error = new Error('Storage error');
      AsyncStorage.setItem = jest.fn().mockRejectedValue(error);

      await expect(
        StorageService.setItem('test_key', {data: 'test'})
      ).rejects.toThrow('Failed to save data');
    });
  });

  describe('getItem', () => {
    it('should retrieve stored data correctly', async () => {
      const testData = {id: 1, name: 'Test Beer'};
      await AsyncStorage.setItem('test_key', JSON.stringify(testData));

      const retrievedData = await StorageService.getItem('test_key');
      expect(retrievedData).toEqual(testData);
    });

    it('should return null for non-existent key', async () => {
      const result = await StorageService.getItem('non_existent_key');
      expect(result).toBeNull();
    });

    it('should return null when JSON parsing fails', async () => {
      await AsyncStorage.setItem('test_key', 'invalid json');
      const result = await StorageService.getItem('test_key');
      expect(result).toBeNull();
    });
  });

  describe('removeItem', () => {
    it('should remove item from storage', async () => {
      await AsyncStorage.setItem('test_key', JSON.stringify({data: 'test'}));
      await StorageService.removeItem('test_key');

      const result = await AsyncStorage.getItem('test_key');
      expect(result).toBeNull();
    });

    it('should throw error when removal fails', async () => {
      const error = new Error('Remove error');
      AsyncStorage.removeItem = jest.fn().mockRejectedValue(error);

      await expect(
        StorageService.removeItem('test_key')
      ).rejects.toThrow('Failed to remove data');
    });
  });

  describe('clear', () => {
    it('should clear all storage', async () => {
      await AsyncStorage.setItem('key1', JSON.stringify({data: 'test1'}));
      await AsyncStorage.setItem('key2', JSON.stringify({data: 'test2'}));

      await StorageService.clear();

      const keys = await AsyncStorage.getAllKeys();
      expect(keys).toHaveLength(0);
    });
  });

  describe('getAllKeys', () => {
    it('should return all storage keys', async () => {
      await AsyncStorage.setItem('key1', JSON.stringify({data: 'test1'}));
      await AsyncStorage.setItem('key2', JSON.stringify({data: 'test2'}));

      const keys = await StorageService.getAllKeys();
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
    });

    it('should return empty array on error', async () => {
      AsyncStorage.getAllKeys = jest.fn().mockRejectedValue(new Error());
      const keys = await StorageService.getAllKeys();
      expect(keys).toEqual([]);
    });
  });

  describe('validateData', () => {
    it('should validate data correctly', () => {
      const validator = (data: any) => ({
        isValid: data.id > 0,
        errors: data.id > 0 ? [] : ['Invalid ID'],
      });

      const validResult = StorageService.validateData({id: 1}, validator);
      expect(validResult.isValid).toBe(true);
      expect(validResult.errors).toHaveLength(0);

      const invalidResult = StorageService.validateData({id: -1}, validator);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toContain('Invalid ID');
    });

    it('should handle validator errors', () => {
      const validator = () => {
        throw new Error('Validation error');
      };

      const result = StorageService.validateData({}, validator);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Validation error');
    });
  });
});