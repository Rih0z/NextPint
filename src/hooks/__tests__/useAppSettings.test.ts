import {renderHook, act} from '@testing-library/react-hooks';
import {useAppSettings} from '../useAppSettings';
import {SettingsService} from '@services/storage';

jest.mock('@services/storage');

describe('useAppSettings', () => {
  const mockSettings = {
    version: '1.0.0',
    firstLaunch: new Date('2024-01-01'),
    lastLaunch: new Date('2024-01-01'),
    launchCount: 1,
    onboardingCompleted: false,
    dataBackupEnabled: true,
    analyticsEnabled: false,
    crashReportingEnabled: false,
    autoUpdateTemplates: true,
    cacheSettings: {
      maxCacheSize: 10485760,
      cacheRetentionDays: 30,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize settings on mount', async () => {
    (SettingsService.initializeSettings as jest.Mock).mockResolvedValue(mockSettings);

    const {result, waitForNextUpdate} = renderHook(() => useAppSettings());

    expect(result.current.loading).toBe(true);
    expect(result.current.settings).toBeNull();

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.settings).toEqual(mockSettings);
    expect(SettingsService.initializeSettings).toHaveBeenCalledTimes(1);
  });

  it('should handle initialization error', async () => {
    const error = new Error('Failed to load');
    (SettingsService.initializeSettings as jest.Mock).mockRejectedValue(error);

    const {result, waitForNextUpdate} = renderHook(() => useAppSettings());

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Failed to load');
    expect(result.current.settings).toBeNull();
  });

  describe('updateSettings', () => {
    it('should update settings successfully', async () => {
      (SettingsService.initializeSettings as jest.Mock).mockResolvedValue(mockSettings);
      (SettingsService.updateSettings as jest.Mock).mockResolvedValue(undefined);
      (SettingsService.getSettings as jest.Mock).mockResolvedValue({
        ...mockSettings,
        analyticsEnabled: true,
      });

      const {result, waitForNextUpdate} = renderHook(() => useAppSettings());
      await waitForNextUpdate();

      await act(async () => {
        await result.current.updateSettings({analyticsEnabled: true});
      });

      expect(SettingsService.updateSettings).toHaveBeenCalledWith({
        analyticsEnabled: true,
      });
      expect(result.current.settings?.analyticsEnabled).toBe(true);
    });

    it('should handle update error', async () => {
      (SettingsService.initializeSettings as jest.Mock).mockResolvedValue(mockSettings);
      (SettingsService.updateSettings as jest.Mock).mockRejectedValue(
        new Error('Update failed')
      );

      const {result, waitForNextUpdate} = renderHook(() => useAppSettings());
      await waitForNextUpdate();

      await act(async () => {
        await result.current.updateSettings({analyticsEnabled: true});
      });

      expect(result.current.error).toBe('Failed to update settings');
    });
  });

  describe('completeOnboarding', () => {
    it('should complete onboarding successfully', async () => {
      (SettingsService.initializeSettings as jest.Mock).mockResolvedValue(mockSettings);
      (SettingsService.completeOnboarding as jest.Mock).mockResolvedValue(undefined);
      (SettingsService.getSettings as jest.Mock).mockResolvedValue({
        ...mockSettings,
        onboardingCompleted: true,
      });

      const {result, waitForNextUpdate} = renderHook(() => useAppSettings());
      await waitForNextUpdate();

      await act(async () => {
        await result.current.completeOnboarding();
      });

      expect(SettingsService.completeOnboarding).toHaveBeenCalledTimes(1);
      expect(result.current.settings?.onboardingCompleted).toBe(true);
    });
  });

  describe('reload', () => {
    it('should reload settings', async () => {
      (SettingsService.initializeSettings as jest.Mock)
        .mockResolvedValueOnce(mockSettings)
        .mockResolvedValueOnce({...mockSettings, launchCount: 2});

      const {result, waitForNextUpdate} = renderHook(() => useAppSettings());
      await waitForNextUpdate();

      expect(result.current.settings?.launchCount).toBe(1);

      await act(async () => {
        await result.current.reload();
      });

      expect(result.current.settings?.launchCount).toBe(2);
      expect(SettingsService.initializeSettings).toHaveBeenCalledTimes(2);
    });
  });
});