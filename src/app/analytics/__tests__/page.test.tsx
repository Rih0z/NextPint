import React, { act } from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import AnalyticsPage from '../page';
import { ServiceFactory } from '@/application/factories/ServiceFactory';

// Mock Next.js
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: jest.fn()
}));

// Mock Navigation component
jest.mock('@/components/Navigation', () => {
  return function MockNavigation() {
    return <nav data-testid="navigation">Navigation</nav>;
  };
});

// Mock ServiceFactory
jest.mock('@/application/factories/ServiceFactory', () => ({
  ServiceFactory: {
    getAnalyticsService: jest.fn()
  }
}));

describe('AnalyticsPage', () => {
  const mockT = jest.fn((key: string) => key);
  const mockAnalyticsService = {
    trackEvent: jest.fn(),
    getInsights: jest.fn(),
    exportData: jest.fn()
  };

  const mockInsights = {
    totalBeers: 50,
    totalSessions: 10,
    favoriteStyles: ['IPA', 'Stout', 'Lager'],
    breweryPreferences: ['Brewery A', 'Brewery B'],
    tastingPatterns: {
      mostActiveDay: 'Friday',
      preferredTime: 'Evening',
      seasonalTrends: { 'Winter': 15, 'Spring': 12, 'Summer': 13, 'Fall': 10 }
    },
    discoveryMetrics: {
      newStylesThisMonth: 3,
      adventurousnessScore: 75,
      consistencyScore: 40
    },
    recommendations: {
      nextStyles: ['Saison', 'Porter', 'Wheat'],
      breweriesToExplore: ['New Brewery', 'Craft Co', 'Local Brew'],
      personalityType: 'Explorer - You love trying new styles'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTranslation as jest.Mock).mockReturnValue({ t: mockT });
    (ServiceFactory.getAnalyticsService as jest.Mock).mockReturnValue(mockAnalyticsService);
    
    mockAnalyticsService.getInsights.mockResolvedValue(mockInsights);
    mockAnalyticsService.exportData.mockReturnValue(JSON.stringify(mockInsights));
  });

  it('should render without crashing', async () => {
    await act(async () => {
      render(<AnalyticsPage />);
    });
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
  });

  it('should track page view on mount', async () => {
    await act(async () => {
      render(<AnalyticsPage />);
    });
    expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith('page_view', { page: 'analytics' });
  });

  it('should load and display insights', async () => {
    await act(async () => {
      render(<AnalyticsPage />);
    });

    await waitFor(() => {
      expect(mockAnalyticsService.getInsights).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('試したビール数')).toBeInTheDocument();
      expect(screen.getByText('発見セッション数')).toBeInTheDocument();
    });
  });

  it('should handle loading errors gracefully', async () => {
    mockAnalyticsService.getInsights.mockRejectedValue(new Error('Failed to load insights'));

    await act(async () => {
      render(<AnalyticsPage />);
    });

    await waitFor(() => {
      expect(mockAnalyticsService.getInsights).toHaveBeenCalled();
    });
  });

  it('should display loading state initially', async () => {
    await act(async () => {
      render(<AnalyticsPage />);
    });
    expect(screen.getByText('分析中...')).toBeInTheDocument();
  });

  it('should show refresh functionality', async () => {
    await act(async () => {
      render(<AnalyticsPage />);
    });

    await waitFor(() => {
      expect(mockAnalyticsService.getInsights).toHaveBeenCalled();
    });

    const refreshButton = screen.getByRole('button', { name: /更新/i });
    fireEvent.click(refreshButton);

    expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith('analytics_refresh');
  });

  it('should handle export functionality', async () => {
    await act(async () => {
      render(<AnalyticsPage />);
    });

    await waitFor(() => {
      const exportButton = screen.getByRole('button', { name: /エクスポート/i });
      expect(exportButton).toBeInTheDocument();
    });
  });

  it('should display insights data when loaded', async () => {
    await act(async () => {
      render(<AnalyticsPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('50')).toBeInTheDocument(); // totalBeers
      expect(screen.getByText('10')).toBeInTheDocument(); // totalSessions
    });
  });

  it('should show insights section', async () => {
    await act(async () => {
      render(<AnalyticsPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('ビール分析ダッシュボード')).toBeInTheDocument();
    });
  });

  it('should display personality type', async () => {
    await act(async () => {
      render(<AnalyticsPage />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Explorer/)).toBeInTheDocument();
    });
  });

  it('should show favorite styles', async () => {
    await act(async () => {
      render(<AnalyticsPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('IPA')).toBeInTheDocument();
      expect(screen.getByText('Stout')).toBeInTheDocument();
    });
  });

  it('should display discovery metrics', async () => {
    await act(async () => {
      render(<AnalyticsPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('75')).toBeInTheDocument(); // adventurousnessScore
      expect(screen.getByText('3')).toBeInTheDocument(); // newStylesThisMonth
    });
  });

  it('should handle export data functionality', async () => {
    // Mock DOM methods
    const mockCreateElement = jest.spyOn(document, 'createElement');
    const mockAppendChild = jest.spyOn(document.body, 'appendChild');
    const mockRemoveChild = jest.spyOn(document.body, 'removeChild');
    const mockClick = jest.fn();
    const mockAnchor = { 
      href: '', 
      download: '', 
      click: mockClick 
    } as any;
    
    mockCreateElement.mockReturnValue(mockAnchor);
    mockAppendChild.mockImplementation(() => mockAnchor);
    mockRemoveChild.mockImplementation(() => mockAnchor);

    global.URL.createObjectURL = jest.fn(() => 'mock-url');
    global.URL.revokeObjectURL = jest.fn();

    await act(async () => {
      render(<AnalyticsPage />);
    });

    await waitFor(() => {
      const exportButton = screen.getByRole('button', { name: /エクスポート/i });
      fireEvent.click(exportButton);
    });

    expect(mockAnalyticsService.exportData).toHaveBeenCalled();
    expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith('analytics_export');
    
    // Cleanup
    mockCreateElement.mockRestore();
    mockAppendChild.mockRestore();
    mockRemoveChild.mockRestore();
  });

  it('should handle export error', async () => {
    mockAnalyticsService.exportData.mockImplementation(() => {
      throw new Error('Export failed');
    });

    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    await act(async () => {
      render(<AnalyticsPage />);
    });

    await waitFor(() => {
      const exportButton = screen.getByRole('button', { name: /エクスポート/i });
      fireEvent.click(exportButton);
    });

    expect(alertSpy).toHaveBeenCalledWith('データのエクスポートに失敗しました');
    alertSpy.mockRestore();
  });

  it('should handle share with navigator.share', async () => {
    const mockShare = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', { value: mockShare, configurable: true });

    render(<AnalyticsPage />);

    await waitFor(() => {
      const shareButton = screen.getByRole('button', { name: /共有/i });
      fireEvent.click(shareButton);
    });

    expect(mockShare).toHaveBeenCalled();
    expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith('analytics_shared', { method: 'native' });
  });

  it('should handle share with clipboard fallback', async () => {
    // Remove navigator.share
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
    
    const mockWriteText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { 
      value: { writeText: mockWriteText }, 
      configurable: true 
    });

    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<AnalyticsPage />);

    await waitFor(() => {
      const shareButton = screen.getByRole('button', { name: /共有/i });
      fireEvent.click(shareButton);
    });

    expect(mockWriteText).toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith('統計情報をクリップボードにコピーしました');
    expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith('analytics_shared', { method: 'clipboard' });
    
    alertSpy.mockRestore();
  });

  it('should handle share error', async () => {
    const mockShare = jest.fn().mockRejectedValue(new Error('Share failed'));
    Object.defineProperty(navigator, 'share', { value: mockShare, configurable: true });

    render(<AnalyticsPage />);

    await waitFor(() => {
      const shareButton = screen.getByRole('button', { name: /共有/i });
      fireEvent.click(shareButton);
    });

    expect(mockShare).toHaveBeenCalled();
  });

  it('should show no data state when totalBeers is 0', async () => {
    mockAnalyticsService.getInsights.mockResolvedValue({
      ...mockInsights,
      totalBeers: 0
    });

    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText('まだ分析データがありません')).toBeInTheDocument();
    });
  });

  it('should show personality information', async () => {
    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText('あなたのビア・パーソナリティ')).toBeInTheDocument();
    });
  });
});