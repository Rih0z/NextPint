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

describe('HomePage (home route)', () => {
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
    
    mockStorageService.getBeerHistory.mockResolvedValue([]);
    mockStorageService.getSessions.mockResolvedValue([]);
  });

  it('should render navigation', () => {
    render(<HomePage />);
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
  });

  it('should track page view', () => {
    render(<HomePage />);
    expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith('page_view', { page: 'home' });
  });

  it('should load stats on mount', async () => {
    render(<HomePage />);

    await waitFor(() => {
      expect(mockStorageService.getBeerHistory).toHaveBeenCalled();
      expect(mockStorageService.getSessions).toHaveBeenCalled();
    });
  });

  it('should handle stats loading errors', async () => {
    mockStorageService.getBeerHistory.mockRejectedValue(new Error('Failed'));
    
    render(<HomePage />);

    await waitFor(() => {
      expect(mockStorageService.getBeerHistory).toHaveBeenCalled();
    });
  });

  it('should display action buttons', () => {
    render(<HomePage />);
    
    expect(screen.getByText('home.actions.newSession')).toBeInTheDocument();
    expect(screen.getByText('home.actions.importBeers')).toBeInTheDocument();
    expect(screen.getByText('home.actions.viewAnalytics')).toBeInTheDocument();
  });

  it('should show recent sessions when available', async () => {
    const mockSessions = [
      { 
        id: 'session1', 
        name: 'Recent Session', 
        createdAt: new Date().toISOString(),
        status: 'active'
      }
    ];
    
    mockStorageService.getSessions.mockResolvedValue(mockSessions);
    
    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('home.recentSessions.title')).toBeInTheDocument();
    });
  });

  it('should display stats when data exists', async () => {
    const mockBeers = [{ id: '1', name: 'Test Beer' }];
    const mockSessions = [{ id: 'session1', name: 'Test Session', createdAt: new Date().toISOString() }];

    mockStorageService.getBeerHistory.mockResolvedValue(mockBeers);
    mockStorageService.getSessions.mockResolvedValue(mockSessions);

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument(); // beer count
    });
  });
});