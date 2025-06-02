import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import PromptsPage from '../page';
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
    getPromptService: jest.fn(),
    getAnalyticsService: jest.fn()
  }
}));

describe('PromptsPage', () => {
  const mockT = jest.fn((key: string) => key);
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn()
  };
  const mockPromptService = {
    getTemplates: jest.fn()
  };
  const mockAnalyticsService = {
    trackEvent: jest.fn()
  };

  const mockTemplates = [
    {
      id: 'beer-discovery',
      name: 'Beer Discovery',
      description: 'Find new beers',
      category: 'discovery',
      template: 'Find me beers that {{preference}}',
      variables: [{ name: 'preference', type: 'string', required: true, description: 'Your preference' }],
      metadata: {
        supportedAI: ['chatgpt', 'claude'],
        estimatedTokens: 500,
        difficulty: 'easy',
        tags: ['discovery'],
        author: 'NextPint',
        language: 'English'
      },
      version: '1.0.0',
      locale: 'en-US',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'taste-analysis',
      name: 'Taste Analysis',
      description: 'Analyze your taste',
      category: 'analysis',
      template: 'Analyze my taste profile {{profile}}',
      variables: [{ name: 'profile', type: 'string', required: true, description: 'Taste profile' }],
      metadata: {
        supportedAI: ['chatgpt', 'claude'],
        estimatedTokens: 600,
        difficulty: 'medium',
        tags: ['analysis'],
        author: 'NextPint',
        language: 'English'
      },
      version: '1.0.0',
      locale: 'en-US',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useTranslation as jest.Mock).mockReturnValue({ t: mockT });
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (ServiceFactory.getPromptService as jest.Mock).mockReturnValue(mockPromptService);
    (ServiceFactory.getAnalyticsService as jest.Mock).mockReturnValue(mockAnalyticsService);
    
    mockPromptService.getTemplates.mockResolvedValue(mockTemplates);
  });

  it('should render without crashing', () => {
    render(<PromptsPage />);
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
  });

  it('should load templates on mount', async () => {
    render(<PromptsPage />);
    
    await waitFor(() => {
      expect(mockPromptService.getTemplates).toHaveBeenCalled();
    });
  });

  it('should display templates', async () => {
    render(<PromptsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Beer Discovery')).toBeInTheDocument();
      expect(screen.getByText('Taste Analysis')).toBeInTheDocument();
    });
  });

  it('should filter templates by category', async () => {
    render(<PromptsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Beer Discovery')).toBeInTheDocument();
    });
    
    const analysisFilter = screen.getByRole('button', { name: /analysis/i });
    fireEvent.click(analysisFilter);
    
    expect(screen.getByText('Taste Analysis')).toBeInTheDocument();
  });

  it('should search templates', async () => {
    render(<PromptsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Beer Discovery')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText('prompts.search.placeholder');
    fireEvent.change(searchInput, { target: { value: 'discovery' } });
    
    expect(screen.getByText('Beer Discovery')).toBeInTheDocument();
  });

  it('should copy template text', async () => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined)
      }
    });
    
    render(<PromptsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Beer Discovery')).toBeInTheDocument();
    });
    
    const copyButton = screen.getAllByRole('button', { name: /copy/i })[0];
    fireEvent.click(copyButton);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Find me beers that {{preference}}');
    expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith('prompt_copied', { templateId: 'beer-discovery' });
  });

  it('should handle template loading errors', async () => {
    mockPromptService.getTemplates.mockRejectedValue(new Error('Failed to load'));
    
    render(<PromptsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('prompts.error.loadFailed')).toBeInTheDocument();
    });
  });

  it('should show template details', async () => {
    render(<PromptsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Beer Discovery')).toBeInTheDocument();
    });
    
    const template = screen.getByText('Beer Discovery');
    fireEvent.click(template);
    
    expect(screen.getByText('Find new beers')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    render(<PromptsPage />);
    expect(screen.getByText('common.loading')).toBeInTheDocument();
  });

  it('should display category filters', () => {
    render(<PromptsPage />);
    
    expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /discovery/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /analysis/i })).toBeInTheDocument();
  });

  it('should show template metadata', async () => {
    render(<PromptsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('easy')).toBeInTheDocument();
      expect(screen.getByText('medium')).toBeInTheDocument();
    });
  });

  it('should track page view', () => {
    render(<PromptsPage />);
    expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith('page_view', { page: 'prompts' });
  });
});