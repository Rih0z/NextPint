import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import SessionDetailPage from '../page';
import { ServiceFactory } from '@/application/factories/ServiceFactory';

// Mock Next.js
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn()
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
    getPromptService: jest.fn(),
    getAnalyticsService: jest.fn()
  }
}));

describe('SessionDetailPage', () => {
  const mockT = jest.fn((key: string) => key);
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn()
  };
  const mockStorageService = {
    getSession: jest.fn(),
    updateSession: jest.fn(),
    deleteSession: jest.fn()
  };
  const mockPromptService = {
    generateSessionPrompt: jest.fn()
  };
  const mockAnalyticsService = {
    trackEvent: jest.fn()
  };

  const mockSession = {
    sessionId: 'session-123',
    name: 'IPA Discovery Session',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    profile: {
      sessionGoal: 'Find hoppy IPAs for weekend tasting',
      mood: 'adventurous',
      tastePreference: {
        primary: 'hoppy',
        avoid: ['sweet'],
        intensity: 4
      },
      constraints: {
        maxABV: 8,
        priceRange: { min: 5, max: 15, currency: 'USD' },
        other: ['local brewery preferred']
      },
      searchKeywords: ['IPA', 'hoppy', 'local']
    },
    generatedPrompts: [
      {
        id: 'prompt-1',
        content: 'Find me hoppy IPAs...',
        generatedAt: new Date().toISOString(),
        copiedCount: 2
      }
    ],
    results: [
      {
        id: 'result-1',
        type: 'beer_recommendation',
        content: 'I recommend Stone IPA...',
        addedAt: new Date().toISOString()
      }
    ],
    notes: 'Great session for finding new local IPAs'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTranslation as jest.Mock).mockReturnValue({ t: mockT });
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useParams as jest.Mock).mockReturnValue({ id: 'session-123' });
    (ServiceFactory.getStorageService as jest.Mock).mockReturnValue(mockStorageService);
    (ServiceFactory.getPromptService as jest.Mock).mockReturnValue(mockPromptService);
    (ServiceFactory.getAnalyticsService as jest.Mock).mockReturnValue(mockAnalyticsService);
    
    mockStorageService.getSession.mockResolvedValue(mockSession);
    mockStorageService.updateSession.mockResolvedValue(undefined);
    mockStorageService.deleteSession.mockResolvedValue(undefined);
    mockPromptService.generateSessionPrompt.mockResolvedValue('Generated prompt content...');
  });

  it('should render without crashing', () => {
    render(<SessionDetailPage />);
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
  });

  it('should load session data on mount', async () => {
    render(<SessionDetailPage />);
    
    await waitFor(() => {
      expect(mockStorageService.getSession).toHaveBeenCalledWith('session-123');
    });
  });

  it('should display session details', async () => {
    render(<SessionDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('IPA Discovery Session')).toBeInTheDocument();
      expect(screen.getByText('Find hoppy IPAs for weekend tasting')).toBeInTheDocument();
      expect(screen.getByText('adventurous')).toBeInTheDocument();
    });
  });

  it('should show session status', async () => {
    render(<SessionDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('active')).toBeInTheDocument();
    });
  });

  it('should display generated prompts', async () => {
    render(<SessionDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Find me hoppy IPAs...')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument(); // copied count
    });
  });

  it('should copy prompt to clipboard', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined)
      }
    });
    
    render(<SessionDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Find me hoppy IPAs...')).toBeInTheDocument();
    });
    
    const copyButton = screen.getByRole('button', { name: /copy/i });
    fireEvent.click(copyButton);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Find me hoppy IPAs...');
    expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith('prompt_copied', { 
      sessionId: 'session-123',
      promptId: 'prompt-1'
    });
  });

  it('should generate new prompt', async () => {
    render(<SessionDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('IPA Discovery Session')).toBeInTheDocument();
    });
    
    const generateButton = screen.getByRole('button', { name: /generate/i });
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      expect(mockPromptService.generateSessionPrompt).toHaveBeenCalledWith(mockSession.profile);
    });
    
    expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith('prompt_generated', { 
      sessionId: 'session-123'
    });
  });

  it('should edit session notes', async () => {
    render(<SessionDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Great session for finding new local IPAs')).toBeInTheDocument();
    });
    
    const editButton = screen.getByRole('button', { name: /edit.notes/i });
    fireEvent.click(editButton);
    
    const notesInput = screen.getByDisplayValue('Great session for finding new local IPAs');
    fireEvent.change(notesInput, { target: { value: 'Updated notes about IPA discoveries' } });
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockStorageService.updateSession).toHaveBeenCalledWith('session-123', {
        notes: 'Updated notes about IPA discoveries'
      });
    });
  });

  it('should delete session', async () => {
    render(<SessionDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('IPA Discovery Session')).toBeInTheDocument();
    });
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    
    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(mockStorageService.deleteSession).toHaveBeenCalledWith('session-123');
    });
    
    expect(mockRouter.push).toHaveBeenCalledWith('/sessions');
  });

  it('should toggle session status', async () => {
    render(<SessionDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('active')).toBeInTheDocument();
    });
    
    const statusToggle = screen.getByRole('button', { name: /complete/i });
    fireEvent.click(statusToggle);
    
    await waitFor(() => {
      expect(mockStorageService.updateSession).toHaveBeenCalledWith('session-123', {
        status: 'completed'
      });
    });
  });

  it('should display session results', async () => {
    render(<SessionDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('I recommend Stone IPA...')).toBeInTheDocument();
    });
  });

  it('should add new result', async () => {
    render(<SessionDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('IPA Discovery Session')).toBeInTheDocument();
    });
    
    const addResultButton = screen.getByRole('button', { name: /add.result/i });
    fireEvent.click(addResultButton);
    
    const resultInput = screen.getByPlaceholderText('session.results.add.placeholder');
    fireEvent.change(resultInput, { target: { value: 'Found great IPA at Local Brewery' } });
    
    const saveResultButton = screen.getByRole('button', { name: /save.result/i });
    fireEvent.click(saveResultButton);
    
    expect(mockStorageService.updateSession).toHaveBeenCalledWith('session-123', {
      results: expect.arrayContaining([
        expect.objectContaining({
          content: 'Found great IPA at Local Brewery'
        })
      ])
    });
  });

  it('should handle session not found', async () => {
    mockStorageService.getSession.mockResolvedValue(null);
    
    render(<SessionDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('session.error.notFound')).toBeInTheDocument();
    });
  });

  it('should track page view', () => {
    render(<SessionDetailPage />);
    expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith('page_view', { 
      page: 'session_detail',
      sessionId: 'session-123'
    });
  });

  it('should navigate back to sessions', () => {
    render(<SessionDetailPage />);
    
    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.click(backButton);
    
    expect(mockRouter.push).toHaveBeenCalledWith('/sessions');
  });

  it('should show session timeline', async () => {
    render(<SessionDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('session.timeline.title')).toBeInTheDocument();
    });
  });
});