import {useState, useEffect} from 'react';
import {UserProfile, UserPreferences} from '@/types';
import {UserProfileService} from '@/services/storage/UserProfileService';

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const userProfile = await UserProfileService.getUserProfile();
      setProfile(userProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (preferences?: Partial<UserPreferences>) => {
    try {
      setLoading(true);
      setError(null);
      const newProfile = await UserProfileService.createUserProfile(preferences);
      setProfile(newProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (preferences: Partial<UserPreferences>) => {
    try {
      await UserProfileService.updateUserPreferences(preferences);
      const updatedProfile = await UserProfileService.getUserProfile();
      setProfile(updatedProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
    }
  };

  const deleteProfile = async () => {
    try {
      await UserProfileService.deleteUserProfile();
      setProfile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete profile');
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    createProfile,
    updatePreferences,
    deleteProfile,
    reload: loadProfile,
    hasProfile: profile !== null,
  };
};