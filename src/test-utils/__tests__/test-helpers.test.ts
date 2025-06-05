import {
  mockImportedBeer,
  mockBeerSearchSession,
  mockUserProfile,
  mockAppSettings,
  createMockLocalStorage
} from '../test-helpers';
import { ImportSource } from '@/types';

describe('test-helpers', () => {
  describe('mock objects', () => {
    it('should provide valid mockImportedBeer', () => {
      expect(mockImportedBeer).toMatchObject({
        id: 'beer-123',
        name: 'Test IPA',
        brewery: 'Test Brewery',
        style: 'IPA',
        abv: 6.5,
        source: ImportSource.UNTAPPD
      });
    });

    it('should provide valid mockBeerSearchSession', () => {
      expect(mockBeerSearchSession).toMatchObject({
        sessionId: 'session-123',
        userId: 'user-123',
        name: 'Test Session',
        status: 'active'
      });
    });

    it('should provide valid mockUserProfile', () => {
      expect(mockUserProfile).toMatchObject({
        id: 'user-123',
        version: '1.0.0',
        preferences: expect.objectContaining({
          favoriteStyles: ['IPA', 'Stout']
        })
      });
    });

    it('should provide valid mockAppSettings', () => {
      expect(mockAppSettings).toMatchObject({
        version: '1.0.0',
        onboardingCompleted: true,
        analyticsEnabled: true
      });
    });
  });

  describe('createMockLocalStorage', () => {
    let mockStorage: ReturnType<typeof createMockLocalStorage>;

    beforeEach(() => {
      mockStorage = createMockLocalStorage();
    });

    it('should set and get items', () => {
      mockStorage.setItem('test-key', 'test-value');
      expect(mockStorage.getItem('test-key')).toBe('test-value');
    });

    it('should return null for non-existent keys', () => {
      expect(mockStorage.getItem('non-existent')).toBeNull();
    });

    it('should remove items', () => {
      mockStorage.setItem('test-key', 'test-value');
      mockStorage.removeItem('test-key');
      expect(mockStorage.getItem('test-key')).toBeNull();
    });

    it('should clear all items', () => {
      mockStorage.setItem('key1', 'value1');
      mockStorage.setItem('key2', 'value2');
      mockStorage.clear();
      expect(mockStorage.getItem('key1')).toBeNull();
      expect(mockStorage.getItem('key2')).toBeNull();
    });

    it('should return keys by index', () => {
      mockStorage.setItem('key1', 'value1');
      mockStorage.setItem('key2', 'value2');
      
      expect(mockStorage.key(0)).toBe('key1');
      expect(mockStorage.key(1)).toBe('key2');
      expect(mockStorage.key(2)).toBeNull();
    });

    it('should provide correct length', () => {
      expect(mockStorage.length).toBe(0);
      
      mockStorage.setItem('key1', 'value1');
      expect(mockStorage.length).toBe(1);
      
      mockStorage.setItem('key2', 'value2');
      expect(mockStorage.length).toBe(2);
      
      mockStorage.removeItem('key1');
      expect(mockStorage.length).toBe(1);
    });

    it('should call jest functions correctly', () => {
      mockStorage.setItem('test', 'value');
      expect(mockStorage.setItem).toHaveBeenCalledWith('test', 'value');
      
      mockStorage.getItem('test');
      expect(mockStorage.getItem).toHaveBeenCalledWith('test');
      
      mockStorage.removeItem('test');
      expect(mockStorage.removeItem).toHaveBeenCalledWith('test');
      
      mockStorage.clear();
      expect(mockStorage.clear).toHaveBeenCalled();
      
      mockStorage.key(0);
      expect(mockStorage.key).toHaveBeenCalledWith(0);
    });
  });
});