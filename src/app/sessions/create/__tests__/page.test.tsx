import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import CreateSessionPage from '../page';
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

describe('CreateSessionPage', () => {
  const mockT = jest.fn((key: string) => key);
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn()
  };
  const mockStorageService = {
    createSession: jest.fn(),
    getUserProfile: jest.fn()
  };
  const mockAnalyticsService = {
    trackEvent: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTranslation as jest.Mock).mockReturnValue({ t: mockT });
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (ServiceFactory.getStorageService as jest.Mock).mockReturnValue(mockStorageService);
    (ServiceFactory.getAnalyticsService as jest.Mock).mockReturnValue(mockAnalyticsService);
    
    mockStorageService.createSession.mockResolvedValue({ sessionId: 'new-session-123' });
    mockStorageService.getUserProfile.mockResolvedValue({
      preferences: {
        favoriteStyles: ['IPA'],
        flavorProfile: { hoppy: 4, malty: 3 }
      }
    });
  });

  it('should render without crashing', () => {
    render(<CreateSessionPage />);
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
  });

  it('should track page view on mount', () => {
    render(<CreateSessionPage />);
    expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith('page_view', { page: 'sessions_create' });
  });

  it('should display session creation form', () => {
    render(<CreateSessionPage />);
    
    expect(screen.getByText('session.create.title')).toBeInTheDocument();
    expect(screen.getByLabelText('session.create.form.name')).toBeInTheDocument();
    expect(screen.getByLabelText('session.create.form.goal')).toBeInTheDocument();
  });

  it('should handle form input changes', () => {
    render(<CreateSessionPage />);
    
    const nameInput = screen.getByLabelText('session.create.form.name');
    fireEvent.change(nameInput, { target: { value: 'My New Session' } });
    
    expect(nameInput).toHaveValue('My New Session');
  });

  it('should validate required fields', async () => {
    render(<CreateSessionPage />);
    
    const createButton = screen.getByRole('button', { name: /create/i });
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(screen.getByText('session.create.validation.nameRequired')).toBeInTheDocument();
    });
  });

  it('should create session with valid data', async () => {
    render(<CreateSessionPage />);
    
    // Fill form
    const nameInput = screen.getByLabelText('session.create.form.name');
    const goalInput = screen.getByLabelText('session.create.form.goal');
    
    fireEvent.change(nameInput, { target: { value: 'Test Session' } });
    fireEvent.change(goalInput, { target: { value: 'Find new IPAs' } });
    
    // Select mood
    const adventurousMood = screen.getByRole('button', { name: /adventurous/i });
    fireEvent.click(adventurousMood);
    
    // Create session
    const createButton = screen.getByRole('button', { name: /create/i });
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(mockStorageService.createSession).toHaveBeenCalledWith({
        name: 'Test Session',
        profile: expect.objectContaining({
          sessionGoal: 'Find new IPAs',
          mood: 'adventurous'
        }),
        status: 'active'
      });
    });
    
    expect(mockRouter.push).toHaveBeenCalledWith('/sessions/new-session-123');
  });

  it('should load user preferences', async () => {
    render(<CreateSessionPage />);
    
    await waitFor(() => {
      expect(mockStorageService.getUserProfile).toHaveBeenCalled();
    });
  });

  it('should handle mood selection', () => {
    render(<CreateSessionPage />);
    
    const moodOptions = screen.getAllByRole('button', { name: /mood/i });
    expect(moodOptions.length).toBeGreaterThan(0);
    
    fireEvent.click(moodOptions[0]);
    expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith('session_create_mood_selected');
  });

  it('should handle taste preference selection', () => {
    render(<CreateSessionPage />);
    
    const tasteSelect = screen.getByLabelText('session.create.form.primaryTaste');
    fireEvent.change(tasteSelect, { target: { value: 'hoppy' } });
    
    expect(tasteSelect).toHaveValue('hoppy');
  });

  it('should add and remove constraints', () => {
    render(<CreateSessionPage />);
    
    const addConstraintButton = screen.getByRole('button', { name: /add.constraint/i });
    fireEvent.click(addConstraintButton);
    
    expect(screen.getByText('session.create.constraints.title')).toBeInTheDocument();
  });

  it('should handle session creation errors', async () => {
    mockStorageService.createSession.mockRejectedValue(new Error('Creation failed'));
    
    render(<CreateSessionPage />);
    
    // Fill minimal form
    const nameInput = screen.getByLabelText('session.create.form.name');
    fireEvent.change(nameInput, { target: { value: 'Test Session' } });
    
    const createButton = screen.getByRole('button', { name: /create/i });
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(screen.getByText('session.create.error.failed')).toBeInTheDocument();
    });
  });

  it('should navigate back', () => {
    render(<CreateSessionPage />);
    
    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.click(backButton);
    
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('should show loading state during creation', async () => {
    render(<CreateSessionPage />);
    
    const nameInput = screen.getByLabelText('session.create.form.name');
    fireEvent.change(nameInput, { target: { value: 'Test Session' } });
    
    const createButton = screen.getByRole('button', { name: /create/i });
    fireEvent.click(createButton);
    
    expect(screen.getByText('common.creating')).toBeInTheDocument();
  });

  it('should suggest keywords based on session goal', () => {
    render(<CreateSessionPage />);
    
    const goalInput = screen.getByLabelText('session.create.form.goal');
    fireEvent.change(goalInput, { target: { value: 'Find hoppy beers' } });
    
    expect(screen.getByText('session.create.suggestions.keywords')).toBeInTheDocument();
  });

  it('should validate session goal length', async () => {
    render(<CreateSessionPage />);
    
    const goalInput = screen.getByLabelText('session.create.form.goal');
    fireEvent.change(goalInput, { target: { value: 'ab' } }); // Too short
    
    const createButton = screen.getByRole('button', { name: /create/i });
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(screen.getByText('session.create.validation.goalTooShort')).toBeInTheDocument();
    });
  });
});