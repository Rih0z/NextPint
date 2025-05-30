import {useState, useEffect} from 'react';
import {AppSettings} from '@types';
import {SettingsService} from '@services/storage';

export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const appSettings = await SettingsService.initializeSettings();
      setSettings(appSettings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<AppSettings>) => {
    try {
      await SettingsService.updateSettings(updates);
      const updatedSettings = await SettingsService.getSettings();
      setSettings(updatedSettings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    }
  };

  const completeOnboarding = async () => {
    try {
      await SettingsService.completeOnboarding();
      const updatedSettings = await SettingsService.getSettings();
      setSettings(updatedSettings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete onboarding');
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    updateSettings,
    completeOnboarding,
    reload: loadSettings,
  };
};