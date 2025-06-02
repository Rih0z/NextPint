import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import SessionsPage from '../page';
import { ServiceFactory } from '@/application/factories/ServiceFactory';

// Mock Next.js
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

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
    getStorageService: jest.fn(),
    getAnalyticsService: jest.fn()
  }
}));

describe('SessionsPage', () => {
  const mockT = jest.fn((key: string) => key);
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn()
  };
  const mockStorageService = {
    getSessions: jest.fn(),
    deleteSession: jest.fn(),
    updateSession: jest.fn(),
    getSessionStats: jest.fn()
  };
  const mockAnalyticsService = {
    trackEvent: jest.fn()
  };

  const mockSessions = [
    {
      id: 'session1',
      sessionId: 'session1',
      name: 'IPA Discovery',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profile: {
        sessionGoal: 'Find hoppy IPAs',
        mood: 'adventurous'
      },
      generatedPrompts: ['prompt1', 'prompt2'],
      results: []
    },
    {
      id: 'session2',
      sessionId: 'session2',
      name: 'Stout Exploration',
      status: 'completed',
      createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      profile: {
        sessionGoal: 'Explore dark stouts',
        mood: 'contemplative'
      },
      generatedPrompts: ['prompt3'],
      results: ['result1']
    }
  ];

  const mockStats = {
    totalCount: 2,
    activeCount: 1,
    completedCount: 1,
    averagePromptsPerSession: 1.5
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTranslation as jest.Mock).mockReturnValue({ t: mockT });
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (ServiceFactory.getStorageService as jest.Mock).mockReturnValue(mockStorageService);
    (ServiceFactory.getAnalyticsService as jest.Mock).mockReturnValue(mockAnalyticsService);
    
    mockStorageService.getSessions.mockResolvedValue(mockSessions);
    mockStorageService.getSessionStats.mockResolvedValue(mockStats);
    mockStorageService.deleteSession.mockResolvedValue(undefined);
    mockStorageService.updateSession.mockResolvedValue(undefined);
  });

  it('should render without crashing', () => {
    render(<SessionsPage />);
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
  });

  it('should load sessions on mount', async () => {
    render(<SessionsPage />);
    
    await waitFor(() => {
      expect(mockStorageService.getSessions).toHaveBeenCalled();
      expect(mockStorageService.getSessionStats).toHaveBeenCalled();
    });
  });

  it('should display sessions', async () => {
    render(<SessionsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('IPA Discovery')).toBeInTheDocument();
      expect(screen.getByText('Stout Exploration')).toBeInTheDocument();
    });
  });

  it('should display session stats', async () => {
    render(<SessionsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // totalCount
      expect(screen.getByText('1')).toBeInTheDocument(); // activeCount
    });
  });

  it('should filter sessions by status', async () => {
    render(<SessionsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('IPA Discovery')).toBeInTheDocument();
    });
    
    const activeFilter = screen.getByRole('button', { name: /active/i });
    fireEvent.click(activeFilter);
    
    expect(screen.getByText('IPA Discovery')).toBeInTheDocument();
  });

  it('should search sessions', async () => {
    render(<SessionsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('IPA Discovery')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText('sessions.search.placeholder');
    fireEvent.change(searchInput, { target: { value: 'IPA' } });
    
    expect(screen.getByText('IPA Discovery')).toBeInTheDocument();
  });

  it('should navigate to session details', async () => {
    render(<SessionsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('IPA Discovery')).toBeInTheDocument();
    });
    
    const sessionLink = screen.getByText('IPA Discovery');
    fireEvent.click(sessionLink);
    
    expect(mockRouter.push).toHaveBeenCalledWith('/sessions/session1');
  });

  it('should delete a session', async () => {
    render(<SessionsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('IPA Discovery')).toBeInTheDocument();
    });
    
    const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0];
    fireEvent.click(deleteButton);
    
    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);
    
    expect(mockStorageService.deleteSession).toHaveBeenCalledWith('session1');
    expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith('session_deleted', { sessionId: 'session1' });
  });

  it('should sort sessions', async () => {
    render(<SessionsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('IPA Discovery')).toBeInTheDocument();
    });
    
    const sortButton = screen.getByRole('button', { name: /sort/i });
    fireEvent.click(sortButton);
    
    expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith('sessions_sorted');
  });

  it('should handle empty sessions state', async () => {
    mockStorageService.getSessions.mockResolvedValue([]);
    mockStorageService.getSessionStats.mockResolvedValue({
      totalCount: 0,
      activeCount: 0,
      completedCount: 0,
      averagePromptsPerSession: 0
    });
    
    render(<SessionsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('sessions.empty.title')).toBeInTheDocument();
    });
  });

  it('should handle loading errors', async () => {
    mockStorageService.getSessions.mockRejectedValue(new Error('Failed to load'));
    
    render(<SessionsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('sessions.error.loadFailed')).toBeInTheDocument();
    });
  });

  it('should show create session button', () => {
    render(<SessionsPage />);
    
    expect(screen.getByRole('link', { name: /create/i })).toBeInTheDocument();
  });

  it('should track page view', () => {
    render(<SessionsPage />);
    expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith('page_view', { page: 'sessions' });
  });

  it('should display session status badges', async () => {
    render(<SessionsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('active')).toBeInTheDocument();
      expect(screen.getByText('completed')).toBeInTheDocument();
    });
  });

  it('should show session actions menu', async () => {
    render(<SessionsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('IPA Discovery')).toBeInTheDocument();
    });
    
    const menuButton = screen.getAllByRole('button', { name: /menu/i })[0];
    fireEvent.click(menuButton);
    
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /archive/i })).toBeInTheDocument();
  });
});