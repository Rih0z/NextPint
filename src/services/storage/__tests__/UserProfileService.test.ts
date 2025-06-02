import { UserProfileService } from '../UserProfileService';
import { StorageService } from '../StorageService';
import { mockUserProfile } from '@/test-utils/test-helpers';
import { UserProfile, UserPreferences } from '@/types';

// Mock StorageService
jest.mock('../StorageService', () => ({
  StorageService: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    getStorageKeys: jest.fn(() => ({
      USER_PROFILE: 'user_profile'
    }))
  }
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-123')
}));

describe('UserProfileService', () => {
  const mockStorageService = StorageService as jest.Mocked<typeof StorageService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockStorageService.getItem.mockResolvedValue(null);
  });

  describe('getUserProfile', () => {
    it('should return stored profile', async () => {
      mockStorageService.getItem.mockResolvedValueOnce(mockUserProfile);
      
      const profile = await UserProfileService.getUserProfile();
      expect(profile).toEqual(mockUserProfile);
      expect(mockStorageService.getItem).toHaveBeenCalledWith('user_profile');
    });

    it('should return null when no profile exists', async () => {
      mockStorageService.getItem.mockResolvedValueOnce(null);
      
      const profile = await UserProfileService.getUserProfile();
      expect(profile).toBeNull();
    });
  });

  describe('saveUserProfile', () => {
    it('should save valid profile', async () => {
      await UserProfileService.saveUserProfile(mockUserProfile);
      
      expect(mockStorageService.setItem).toHaveBeenCalledWith(
        'user_profile',
        expect.objectContaining({
          ...mockUserProfile,
          updatedAt: expect.any(Date)
        })
      );
    });

    it('should validate profile before saving', async () => {
      const invalidProfile = { ...mockUserProfile, id: '' };
      
      await expect(UserProfileService.saveUserProfile(invalidProfile))
        .rejects.toThrow('Invalid user profile');
    });

    it('should validate flavor profile range', async () => {
      const invalidProfile = {
        ...mockUserProfile,
        preferences: {
          ...mockUserProfile.preferences,
          flavorProfile: {
            ...mockUserProfile.preferences.flavorProfile,
            hoppy: 6 // Invalid range
          }
        }
      };
      
      await expect(UserProfileService.saveUserProfile(invalidProfile))
        .rejects.toThrow('hoppy must be a number between 1 and 5');
    });

    it('should validate budget range', async () => {
      const invalidProfile = {
        ...mockUserProfile,
        preferences: {
          ...mockUserProfile.preferences,
          budgetRange: {
            min: 100,
            max: 50, // Max less than min
            currency: 'USD'
          }
        }
      };
      
      await expect(UserProfileService.saveUserProfile(invalidProfile))
        .rejects.toThrow('Budget maximum must be greater than minimum');
    });
  });

  describe('createUserProfile', () => {
    it('should create profile with default preferences', async () => {
      const profile = await UserProfileService.createUserProfile();
      
      expect(profile.id).toBe('mock-uuid-123');
      expect(profile.version).toBe('1.0.0');
      expect(profile.preferences.favoriteStyles).toEqual([]);
      expect(profile.preferences.flavorProfile.hoppy).toBe(3);
      expect(profile.preferences.budgetRange.currency).toBe('JPY');
      expect(profile.settings.language).toBe('ja-JP');
      expect(profile.createdAt).toBeInstanceOf(Date);
      expect(profile.updatedAt).toBeInstanceOf(Date);
      
      expect(mockStorageService.setItem).toHaveBeenCalledWith('user_profile', profile);
    });

    it('should create profile with custom preferences', async () => {
      const customPreferences: Partial<UserPreferences> = {
        favoriteStyles: ['IPA', 'Stout'],
        flavorProfile: {
          hoppy: 5,
          malty: 2,
          bitter: 4,
          sweet: 1,
          sour: 3,
          alcohol: 4
        }
      };
      
      const profile = await UserProfileService.createUserProfile(customPreferences);
      
      expect(profile.preferences.favoriteStyles).toEqual(['IPA', 'Stout']);
      expect(profile.preferences.flavorProfile.hoppy).toBe(5);
      expect(profile.preferences.flavorProfile.malty).toBe(2);
    });
  });

  describe('updateUserPreferences', () => {
    it('should update preferences for existing profile', async () => {
      mockStorageService.getItem.mockResolvedValueOnce(mockUserProfile);
      
      const updates: Partial<UserPreferences> = {
        favoriteStyles: ['Lager', 'Pilsner'],
        avoidList: ['Sour Ales']
      };
      
      await UserProfileService.updateUserPreferences(updates);
      
      expect(mockStorageService.setItem).toHaveBeenCalledWith(
        'user_profile',
        expect.objectContaining({
          preferences: expect.objectContaining({
            favoriteStyles: ['Lager', 'Pilsner'],
            avoidList: ['Sour Ales'],
            // Other preferences should remain unchanged
            flavorProfile: mockUserProfile.preferences.flavorProfile
          })
        })
      );
    });

    it('should throw error if profile does not exist', async () => {
      mockStorageService.getItem.mockResolvedValueOnce(null);
      
      const updates: Partial<UserPreferences> = {
        favoriteStyles: ['IPA']
      };
      
      await expect(UserProfileService.updateUserPreferences(updates))
        .rejects.toThrow('User profile not found');
    });

    it('should update flavor profile', async () => {
      mockStorageService.getItem.mockResolvedValueOnce(mockUserProfile);
      
      const updates: Partial<UserPreferences> = {
        flavorProfile: {
          hoppy: 5,
          malty: 4,
          bitter: 5,
          sweet: 1,
          sour: 2,
          alcohol: 4
        }
      };
      
      await UserProfileService.updateUserPreferences(updates);
      
      expect(mockStorageService.setItem).toHaveBeenCalledWith(
        'user_profile',
        expect.objectContaining({
          preferences: expect.objectContaining({
            flavorProfile: updates.flavorProfile
          })
        })
      );
    });
  });

  describe('deleteUserProfile', () => {
    it('should delete user profile', async () => {
      await UserProfileService.deleteUserProfile();
      
      expect(mockStorageService.removeItem).toHaveBeenCalledWith('user_profile');
    });
  });

  describe('hasUserProfile', () => {
    it('should return true when profile exists', async () => {
      mockStorageService.getItem.mockResolvedValueOnce(mockUserProfile);
      
      const hasProfile = await UserProfileService.hasUserProfile();
      expect(hasProfile).toBe(true);
    });

    it('should return false when profile does not exist', async () => {
      mockStorageService.getItem.mockResolvedValueOnce(null);
      
      const hasProfile = await UserProfileService.hasUserProfile();
      expect(hasProfile).toBe(false);
    });
  });

  describe('validateUserProfile', () => {
    const validationMethod = (UserProfileService as any).validateUserProfile;

    it('should validate complete profile', () => {
      const result = validationMethod(mockUserProfile);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require user ID', () => {
      const invalidProfile = { ...mockUserProfile, id: '' };
      const result = validationMethod(invalidProfile);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('User ID is required');
    });

    it('should require version', () => {
      const invalidProfile = { ...mockUserProfile, version: '' };
      const result = validationMethod(invalidProfile);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Version is required');
    });

    it('should validate flavor profile values', () => {
      const invalidProfile = {
        ...mockUserProfile,
        preferences: {
          ...mockUserProfile.preferences,
          flavorProfile: {
            hoppy: 0, // Invalid
            malty: 6, // Invalid
            bitter: 3,
            sweet: 2,
            sour: 4,
            alcohol: -1 // Invalid
          }
        }
      };
      const result = validationMethod(invalidProfile);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('hoppy must be a number between 1 and 5');
      expect(result.errors).toContain('malty must be a number between 1 and 5');
      expect(result.errors).toContain('alcohol must be a number between 1 and 5');
    });

    it('should validate budget range', () => {
      const invalidProfile = {
        ...mockUserProfile,
        preferences: {
          ...mockUserProfile.preferences,
          budgetRange: {
            min: -10, // Invalid
            max: 50,
            currency: '' // Invalid
          }
        }
      };
      const result = validationMethod(invalidProfile);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Budget minimum cannot be negative');
      expect(result.errors).toContain('Budget currency is required');
    });

    it('should require preferences', () => {
      const invalidProfile = { ...mockUserProfile, preferences: null as any };
      const result = validationMethod(invalidProfile);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Preferences are required');
    });

    it('should require settings', () => {
      const invalidProfile = { ...mockUserProfile, settings: null as any };
      const result = validationMethod(invalidProfile);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Settings are required');
    });

    it('should require created date', () => {
      const invalidProfile = { ...mockUserProfile, createdAt: null as any };
      const result = validationMethod(invalidProfile);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Created date is required');
    });

    it('should require flavor profile', () => {
      const invalidProfile = {
        ...mockUserProfile,
        preferences: {
          ...mockUserProfile.preferences,
          flavorProfile: null as any
        }
      };
      const result = validationMethod(invalidProfile);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Flavor profile is required');
    });

    it('should validate budget maximum greater than minimum', () => {
      const invalidProfile = {
        ...mockUserProfile,
        preferences: {
          ...mockUserProfile.preferences,
          budgetRange: {
            min: 100,
            max: 50,
            currency: 'USD'
          }
        }
      };
      const result = validationMethod(invalidProfile);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Budget maximum must be greater than minimum');
    });
  });
});