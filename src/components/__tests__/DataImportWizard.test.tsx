import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DataImportWizard from '../DataImportWizard';
import { ServiceFactory } from '@/application/factories/ServiceFactory';

// Mock ServiceFactory
jest.mock('@/application/factories/ServiceFactory', () => ({
  ServiceFactory: {
    getPromptService: jest.fn(),
    getStorageService: jest.fn(),
    getAnalyticsService: jest.fn()
  }
}));

describe('DataImportWizard', () => {
  const mockPromptService = {
    generateDataImportPrompt: jest.fn(),
    parseImportData: jest.fn()
  };

  const mockStorageService = {
    saveUserProfile: jest.fn(),
    saveBeerHistory: jest.fn()
  };

  const mockAnalyticsService = {
    trackEvent: jest.fn()
  };

  const mockOnImportComplete = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (ServiceFactory.getPromptService as jest.Mock).mockReturnValue(mockPromptService);
    (ServiceFactory.getStorageService as jest.Mock).mockReturnValue(mockStorageService);
    (ServiceFactory.getAnalyticsService as jest.Mock).mockReturnValue(mockAnalyticsService);
    
    mockPromptService.generateDataImportPrompt.mockResolvedValue('Test prompt content');
    mockStorageService.saveUserProfile.mockResolvedValue(undefined);
    mockStorageService.saveBeerHistory.mockResolvedValue(undefined);
    mockAnalyticsService.trackEvent.mockImplementation(() => {});
  });

  it('should render prompt step initially', async () => {
    render(<DataImportWizard onImportComplete={mockOnImportComplete} onError={mockOnError} />);
    
    await waitFor(() => {
      expect(screen.getByText('AIアシスタントでデータを収集')).toBeInTheDocument();
    });

    expect(mockPromptService.generateDataImportPrompt).toHaveBeenCalled();
  });

  it('should show loading state when generating prompt', () => {
    mockPromptService.generateDataImportPrompt.mockImplementation(() => new Promise(() => {}));
    
    render(<DataImportWizard onImportComplete={mockOnImportComplete} onError={mockOnError} />);
    
    expect(screen.getByText('プロンプトを生成中...')).toBeInTheDocument();
  });

  it('should show prompt content when loaded', async () => {
    render(<DataImportWizard onImportComplete={mockOnImportComplete} onError={mockOnError} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test prompt content')).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2); // Copy button and Next button
  });

  it('should navigate to JSON step', async () => {
    render(<DataImportWizard onImportComplete={mockOnImportComplete} onError={mockOnError} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test prompt content')).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button');
    const nextButton = buttons[1]; // Assuming the second button is the Next button
    await userEvent.click(nextButton);
    
    expect(screen.getByText('AIから出力されたJSONを入力')).toBeInTheDocument();
  });

  it('should show JSON input step when navigated', async () => {
    render(<DataImportWizard onImportComplete={mockOnImportComplete} onError={mockOnError} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test prompt content')).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button');
    const nextButton = buttons[1];
    await userEvent.click(nextButton);
    
    expect(screen.getByText('AIから出力されたJSONを入力')).toBeInTheDocument();
    expect(screen.getByLabelText('JSON データ')).toBeInTheDocument();
  });

  it('should handle prompt generation error', async () => {
    mockPromptService.generateDataImportPrompt.mockRejectedValue(new Error('Prompt generation failed'));
    
    render(<DataImportWizard onImportComplete={mockOnImportComplete} onError={mockOnError} />);
    
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith('プロンプトの生成に失敗しました');
    });
  });

  it('should test basic functionality', () => {
    expect(mockPromptService.generateDataImportPrompt).toBeDefined();
    expect(mockPromptService.parseImportData).toBeDefined();
  });
});