import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import ImportPage from '../page';
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

describe('ImportPage', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn()
  };
  const mockStorageService = {
    addImportedBeers: jest.fn()
  };
  const mockAnalyticsService = {
    trackEvent: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (ServiceFactory.getStorageService as jest.Mock).mockReturnValue(mockStorageService);
    (ServiceFactory.getAnalyticsService as jest.Mock).mockReturnValue(mockAnalyticsService);
    
    mockStorageService.addImportedBeers.mockResolvedValue([]);
  });

  it('should render without crashing', () => {
    render(<ImportPage />);
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
  });

  it('should display upload options', () => {
    render(<ImportPage />);
    
    expect(screen.getByText('import.uploadOptions.title')).toBeInTheDocument();
    expect(screen.getByText('import.uploadOptions.dragDrop')).toBeInTheDocument();
  });

  it('should handle file selection', () => {
    render(<ImportPage />);
    
    const fileInput = screen.getByTestId('file-input');
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    expect(screen.getByText('test.txt')).toBeInTheDocument();
  });

  it('should handle drag and drop', () => {
    render(<ImportPage />);
    
    const dropZone = screen.getByTestId('drop-zone');
    
    fireEvent.dragEnter(dropZone);
    expect(dropZone).toHaveClass('drag-active');
    
    fireEvent.dragLeave(dropZone);
    expect(dropZone).not.toHaveClass('drag-active');
  });

  it('should process files when upload button is clicked', async () => {
    render(<ImportPage />);
    
    const fileInput = screen.getByTestId('file-input');
    const file = new File(['test data'], 'test.csv', { type: 'text/csv' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    const uploadButton = screen.getByRole('button', { name: /upload/i });
    fireEvent.click(uploadButton);
    
    expect(screen.getByText('import.processing')).toBeInTheDocument();
  });

  it('should handle camera capture', () => {
    render(<ImportPage />);
    
    const cameraButton = screen.getByRole('button', { name: /camera/i });
    fireEvent.click(cameraButton);
    
    expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith('import_method_selected', { method: 'camera' });
  });

  it('should show error messages', async () => {
    render(<ImportPage />);
    
    const fileInput = screen.getByTestId('file-input');
    const file = new File(['invalid data'], 'test.txt', { type: 'text/plain' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    const uploadButton = screen.getByRole('button', { name: /upload/i });
    fireEvent.click(uploadButton);
    
    // Mock error scenario
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('should remove selected files', () => {
    render(<ImportPage />);
    
    const fileInput = screen.getByTestId('file-input');
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    const removeButton = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeButton);
    
    expect(screen.queryByText('test.txt')).not.toBeInTheDocument();
  });

  it('should show import results', async () => {
    mockStorageService.addImportedBeers.mockResolvedValue([
      { id: '1', name: 'Imported Beer 1' },
      { id: '2', name: 'Imported Beer 2' }
    ]);
    
    render(<ImportPage />);
    
    const fileInput = screen.getByTestId('file-input');
    const file = new File(['beer,brewery\nIPA,Test Brewery'], 'beers.csv', { type: 'text/csv' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    const uploadButton = screen.getByRole('button', { name: /upload/i });
    fireEvent.click(uploadButton);
    
    await waitFor(() => {
      expect(screen.getByText('import.results.success')).toBeInTheDocument();
    });
  });

  it('should navigate back', () => {
    render(<ImportPage />);
    
    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.click(backButton);
    
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('should handle multiple file types', () => {
    render(<ImportPage />);
    
    expect(screen.getByText('import.supportedFormats')).toBeInTheDocument();
    expect(screen.getByText(/csv/i)).toBeInTheDocument();
    expect(screen.getByText(/json/i)).toBeInTheDocument();
  });
});