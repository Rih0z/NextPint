import {UserProfileService} from '../UserProfileService';
import {StorageService} from '../StorageService';
import {UserProfile} from '@types';

jest.mock('../StorageService');

describe('UserProfileService', () => {
  const mockProfile: UserProfile = {
    id: 'test-id',
    version: '1.0.0',
    preferences: {
      favoriteStyles: ['IPA', 'Stout'],
      flavorProfile: {
        hoppy: 4,
        malty: 3,
        bitter: 4,
        sweet: 2,
        sour: 1,
        alcohol: 3,
      },
      avoidList: ['Sour'],
      preferredBreweries: ['Test Brewery'],
      budgetRange: {
        min: 500,
        max: 2000,
        currency: 'JPY',
      },
      locationPreferences: ['Tokyo'],
    },
    history: [],
    sessions: [],
    settings: {
      language: 'ja-JP',
      theme: 'auto',
      notifications: true,
      dataRetentionDays: 365,
      aiPreference: ['chatgpt'],
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserProfile', () => {
    it('should retrieve user profile', async () => {
      (StorageService.getItem as jest.Mock).mockResolvedValue(mockProfile);

      const result = await UserProfileService.getUserProfile();
      expect(result).toEqual(mockProfile);
      expect(StorageService.getItem).toHaveBeenCalledWith('user_profile');
    });

    it('should return null when no profile exists', async () => {
      (StorageService.getItem as jest.Mock).mockResolvedValue(null);

      const result = await UserProfileService.getUserProfile();
      expect(result).toBeNull();
    });
  });

  describe('saveUserProfile', () => {
    it('should save valid user profile', async () => {
      (StorageService.setItem as jest.Mock).mockResolvedValue(undefined);

      await UserProfileService.saveUserProfile(mockProfile);

      expect(StorageService.setItem).toHaveBeenCalledWith(
        'user_profile',
        expect.objectContaining({
          ...mockProfile,
          updatedAt: expect.any(Date),
        })
      );
    });

    it('should throw error for invalid profile', async () => {
      const invalidProfile = {...mockProfile, id: ''};

      await expect(
        UserProfileService.saveUserProfile(invalidProfile)
      ).rejects.toThrow('Invalid user profile: User ID is required');
    });
  });

  describe('createUserProfile', () => {
    it('should create new user profile with defaults', async () => {
      (StorageService.setItem as jest.Mock).mockResolvedValue(undefined);

      const result = await UserProfileService.createUserProfile();

      expect(result).toMatchObject({
        id: expect.any(String),
        version: '1.0.0',
        preferences: expect.objectContaining({
          favoriteStyles: [],
          flavorProfile: {
            hoppy: 3,
            malty: 3,
            bitter: 3,
            sweet: 3,
            sour: 3,
            alcohol: 3,
          },
        }),
      });
    });

    it('should create profile with custom preferences', async () => {
      (StorageService.setItem as jest.Mock).mockResolvedValue(undefined);

      const customPreferences = {
        favoriteStyles: ['Lager'],
        budgetRange: {
          min: 1000,
          max: 3000,
          currency: 'JPY',
        },
      };

      const result = await UserProfileService.createUserProfile(customPreferences);

      expect(result.preferences).toMatchObject(customPreferences);
    });
  });

  describe('updateUserPreferences', () => {
    it('should update user preferences', async () => {
      (StorageService.getItem as jest.Mock).mockResolvedValue(mockProfile);
      (StorageService.setItem as jest.Mock).mockResolvedValue(undefined);

      const newPreferences = {
        favoriteStyles: ['Pilsner', 'Wheat'],
      };

      await UserProfileService.updateUserPreferences(newPreferences);

      expect(StorageService.setItem).toHaveBeenCalledWith(
        'user_profile',
        expect.objectContaining({
          preferences: expect.objectContaining({
            ...mockProfile.preferences,
            favoriteStyles: ['Pilsner', 'Wheat'],
          }),
        })
      );
    });

    it('should throw error when profile not found', async () => {
      (StorageService.getItem as jest.Mock).mockResolvedValue(null);

      await expect(
        UserProfileService.updateUserPreferences({})
      ).rejects.toThrow('User profile not found');
    });
  });

  describe('validation', () => {
    it('should validate flavor profile values', async () => {
      const invalidProfile = {
        ...mockProfile,
        preferences: {
          ...mockProfile.preferences,
          flavorProfile: {
            ...mockProfile.preferences.flavorProfile,
            hoppy: 6, // Invalid: > 5
          },
        },
      };

      await expect(
        UserProfileService.saveUserProfile(invalidProfile)
      ).rejects.toThrow('hoppy must be a number between 1 and 5');
    });

    it('should validate budget range', async () => {
      const invalidProfile = {
        ...mockProfile,
        preferences: {
          ...mockProfile.preferences,
          budgetRange: {
            min: 2000,
            max: 1000, // Invalid: max < min
            currency: 'JPY',
          },
        },
      };

      await expect(
        UserProfileService.saveUserProfile(invalidProfile)
      ).rejects.toThrow('Budget maximum must be greater than minimum');
    });
  });

  describe('hasUserProfile', () => {
    it('should return true when profile exists', async () => {
      (StorageService.getItem as jest.Mock).mockResolvedValue(mockProfile);

      const result = await UserProfileService.hasUserProfile();
      expect(result).toBe(true);
    });

    it('should return false when profile does not exist', async () => {
      (StorageService.getItem as jest.Mock).mockResolvedValue(null);

      const result = await UserProfileService.hasUserProfile();
      expect(result).toBe(false);
    });
  });
});