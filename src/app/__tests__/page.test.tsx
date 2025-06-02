import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import HomePage from '../page';
import { ServiceFactory } from '@/application/factories/ServiceFactory';

// Mock Next.js Link
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
    getAnalyticsService: jest.fn(),
    getStorageService: jest.fn()
  }
}));

describe('HomePage', () => {
  const mockT = jest.fn((key: string) => key);
  const mockAnalyticsService = {
    trackEvent: jest.fn()
  };
  const mockStorageService = {
    getBeerHistory: jest.fn(),
    getSessions: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTranslation as jest.Mock).mockReturnValue({ t: mockT });
    (ServiceFactory.getAnalyticsService as jest.Mock).mockReturnValue(mockAnalyticsService);
    (ServiceFactory.getStorageService as jest.Mock).mockReturnValue(mockStorageService);
    
    // Default empty data
    mockStorageService.getBeerHistory.mockResolvedValue([]);
    mockStorageService.getSessions.mockResolvedValue([]);
  });

  it('should render without crashing', () => {
    render(<HomePage />);
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
  });

  it('should track page view on mount', () => {
    render(<HomePage />);
    expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith('page_view', { page: 'home' });
  });

  it('should load and display stats', async () => {
    const mockBeers = [
      { id: '1', name: 'Test Beer 1' },
      { id: '2', name: 'Test Beer 2' }
    ];
    const mockSessions = [
      { id: 'session1', name: 'Test Session', createdAt: new Date().toISOString() }
    ];

    mockStorageService.getBeerHistory.mockResolvedValue(mockBeers);
    mockStorageService.getSessions.mockResolvedValue(mockSessions);

    render(<HomePage />);

    await waitFor(() => {
      expect(mockStorageService.getBeerHistory).toHaveBeenCalled();
      expect(mockStorageService.getSessions).toHaveBeenCalled();
    });
  });

  it('should handle empty data state', async () => {
    mockStorageService.getBeerHistory.mockResolvedValue([]);
    mockStorageService.getSessions.mockResolvedValue([]);

    render(<HomePage />);

    await waitFor(() => {
      expect(mockStorageService.getBeerHistory).toHaveBeenCalled();
    });
  });

  it('should handle loading errors gracefully', async () => {
    mockStorageService.getBeerHistory.mockRejectedValue(new Error('Failed to load'));
    mockStorageService.getSessions.mockRejectedValue(new Error('Failed to load'));

    render(<HomePage />);

    await waitFor(() => {
      expect(mockStorageService.getBeerHistory).toHaveBeenCalled();
    });
  });

  it('should render action links', () => {
    render(<HomePage />);
    
    // Check for essential navigation links
    expect(screen.getByRole('link', { name: /sessions/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /import/i })).toBeInTheDocument();
  });

  it('should display welcome content for new users', async () => {
    mockStorageService.getBeerHistory.mockResolvedValue([]);
    mockStorageService.getSessions.mockResolvedValue([]);

    render(<HomePage />);

    await waitFor(() => {
      // Should show onboarding/welcome content when no data
      expect(screen.getByText('home.welcome.title')).toBeInTheDocument();
    });
  });

  it('should display stats for existing users', async () => {
    const mockBeers = [{ id: '1', name: 'Test Beer' }];
    const mockSessions = [{ 
      id: 'session1', 
      name: 'Test Session', 
      createdAt: new Date().toISOString() 
    }];

    mockStorageService.getBeerHistory.mockResolvedValue(mockBeers);
    mockStorageService.getSessions.mockResolvedValue(mockSessions);

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('stats.beers')).toBeInTheDocument();
      expect(screen.getByText('stats.sessions')).toBeInTheDocument();
    });
  });
});