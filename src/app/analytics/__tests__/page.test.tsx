import React from 'react';
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

  it('should render without crashing', () => {
    render(<AnalyticsPage />);
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
  });

  it('should track page view on mount', () => {
    render(<AnalyticsPage />);
    expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith('page_view', { page: 'analytics' });
  });

  it('should load and display insights', async () => {
    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(mockAnalyticsService.getInsights).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('analytics.insights.totalBeers')).toBeInTheDocument();
      expect(screen.getByText('analytics.insights.totalSessions')).toBeInTheDocument();
    });
  });

  it('should handle loading errors gracefully', async () => {
    mockAnalyticsService.getInsights.mockRejectedValue(new Error('Failed to load insights'));

    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(mockAnalyticsService.getInsights).toHaveBeenCalled();
    });
  });

  it('should display loading state initially', () => {
    render(<AnalyticsPage />);
    expect(screen.getByText('common.loading')).toBeInTheDocument();
  });

  it('should show refresh functionality', async () => {
    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(mockAnalyticsService.getInsights).toHaveBeenCalled();
    });

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith('analytics_refresh');
  });

  it('should handle export functionality', async () => {
    render(<AnalyticsPage />);

    await waitFor(() => {
      const exportButton = screen.getByRole('button', { name: /export/i });
      expect(exportButton).toBeInTheDocument();
    });
  });

  it('should display insights data when loaded', async () => {
    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText('50')).toBeInTheDocument(); // totalBeers
      expect(screen.getByText('10')).toBeInTheDocument(); // totalSessions
    });
  });

  it('should show timeframe selector', async () => {
    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText('analytics.timeframe.all')).toBeInTheDocument();
    });
  });

  it('should display personality type', async () => {
    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Explorer/)).toBeInTheDocument();
    });
  });

  it('should show favorite styles', async () => {
    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText('IPA')).toBeInTheDocument();
      expect(screen.getByText('Stout')).toBeInTheDocument();
    });
  });

  it('should display discovery metrics', async () => {
    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText('75')).toBeInTheDocument(); // adventurousnessScore
      expect(screen.getByText('3')).toBeInTheDocument(); // newStylesThisMonth
    });
  });
});