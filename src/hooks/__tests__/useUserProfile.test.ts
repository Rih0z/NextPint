import {renderHook, act} from '@testing-library/react-hooks';
import {useUserProfile} from '../useUserProfile';
import {UserProfileService} from '@services/storage';
import {UserProfile} from '@types';

jest.mock('@services/storage');

describe('useUserProfile', () => {
  const mockProfile: UserProfile = {
    id: 'test-id',
    version: '1.0.0',
    preferences: {
      favoriteStyles: ['IPA'],
      flavorProfile: {
        hoppy: 4,
        malty: 3,
        bitter: 4,
        sweet: 2,
        sour: 1,
        alcohol: 3,
      },
      avoidList: [],
      preferredBreweries: [],
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

  it('should load user profile on mount', async () => {
    (UserProfileService.getUserProfile as jest.Mock).mockResolvedValue(mockProfile);

    const {result, waitForNextUpdate} = renderHook(() => useUserProfile());

    expect(result.current.loading).toBe(true);
    expect(result.current.profile).toBeNull();

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.profile).toEqual(mockProfile);
    expect(result.current.hasProfile).toBe(true);
  });

  it('should handle no profile case', async () => {
    (UserProfileService.getUserProfile as jest.Mock).mockResolvedValue(null);

    const {result, waitForNextUpdate} = renderHook(() => useUserProfile());

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.profile).toBeNull();
    expect(result.current.hasProfile).toBe(false);
  });

  describe('createProfile', () => {
    it('should create profile with default values', async () => {
      (UserProfileService.getUserProfile as jest.Mock).mockResolvedValue(null);
      (UserProfileService.createUserProfile as jest.Mock).mockResolvedValue(mockProfile);

      const {result, waitForNextUpdate} = renderHook(() => useUserProfile());
      await waitForNextUpdate();

      await act(async () => {
        await result.current.createProfile();
      });

      expect(UserProfileService.createUserProfile).toHaveBeenCalledWith(undefined);
      expect(result.current.profile).toEqual(mockProfile);
      expect(result.current.hasProfile).toBe(true);
    });

    it('should create profile with custom preferences', async () => {
      (UserProfileService.getUserProfile as jest.Mock).mockResolvedValue(null);
      (UserProfileService.createUserProfile as jest.Mock).mockResolvedValue(mockProfile);

      const {result, waitForNextUpdate} = renderHook(() => useUserProfile());
      await waitForNextUpdate();

      const customPreferences = {favoriteStyles: ['Stout', 'Porter']};

      await act(async () => {
        await result.current.createProfile(customPreferences);
      });

      expect(UserProfileService.createUserProfile).toHaveBeenCalledWith(customPreferences);
    });
  });

  describe('updatePreferences', () => {
    it('should update preferences successfully', async () => {
      (UserProfileService.getUserProfile as jest.Mock).mockResolvedValue(mockProfile);
      (UserProfileService.updateUserPreferences as jest.Mock).mockResolvedValue(undefined);
      
      const updatedProfile = {
        ...mockProfile,
        preferences: {
          ...mockProfile.preferences,
          favoriteStyles: ['IPA', 'Lager'],
        },
      };
      
      (UserProfileService.getUserProfile as jest.Mock)
        .mockResolvedValueOnce(mockProfile)
        .mockResolvedValueOnce(updatedProfile);

      const {result, waitForNextUpdate} = renderHook(() => useUserProfile());
      await waitForNextUpdate();

      await act(async () => {
        await result.current.updatePreferences({favoriteStyles: ['IPA', 'Lager']});
      });

      expect(UserProfileService.updateUserPreferences).toHaveBeenCalledWith({
        favoriteStyles: ['IPA', 'Lager'],
      });
      expect(result.current.profile?.preferences.favoriteStyles).toEqual(['IPA', 'Lager']);
    });
  });

  describe('deleteProfile', () => {
    it('should delete profile successfully', async () => {
      (UserProfileService.getUserProfile as jest.Mock).mockResolvedValue(mockProfile);
      (UserProfileService.deleteUserProfile as jest.Mock).mockResolvedValue(undefined);

      const {result, waitForNextUpdate} = renderHook(() => useUserProfile());
      await waitForNextUpdate();

      expect(result.current.hasProfile).toBe(true);

      await act(async () => {
        await result.current.deleteProfile();
      });

      expect(UserProfileService.deleteUserProfile).toHaveBeenCalledTimes(1);
      expect(result.current.profile).toBeNull();
      expect(result.current.hasProfile).toBe(false);
    });
  });

  it('should handle errors gracefully', async () => {
    const error = new Error('Failed to load profile');
    (UserProfileService.getUserProfile as jest.Mock).mockRejectedValue(error);

    const {result, waitForNextUpdate} = renderHook(() => useUserProfile());

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Failed to load profile');
    expect(result.current.profile).toBeNull();
  });
});