import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render ActivityIndicator with proper role', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should render ActivityIndicator as our mocked div', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner.tagName).toBe('DIV');
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
  });

  it('should apply default size (large)', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveStyle({
      width: '40px',  // large size in our mock
      height: '40px'
    });
  });

  it('should apply small size', () => {
    render(<LoadingSpinner size="small" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveStyle({
      width: '20px',  // small size in our mock
      height: '20px'
    });
  });

  it('should apply default color from constants', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveStyle({
      border: '2px solid #D4A574' // COLORS.primary
    });
  });

  it('should apply custom color', () => {
    render(<LoadingSpinner color="#FF0000" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveStyle({
      border: '2px solid #FF0000'
    });
  });

  it('should render with message using Text component', () => {
    render(<LoadingSpinner message="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
    
    // Message should be rendered as a span (our mocked Text component)
    const message = screen.getByText('Loading data...');
    expect(message.tagName).toBe('SPAN');
  });

  it('should render without message when not provided', () => {
    render(<LoadingSpinner />);
    // Only the ActivityIndicator should be present
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText(/Loading/)).not.toBeInTheDocument();
  });

  it('should apply container styles with proper spacing', () => {
    render(<LoadingSpinner />);
    const container = screen.getByRole('status').parentElement;
    expect(container).toHaveStyle({
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px' // SPACING.lg
    });
  });

  it('should apply overlay styles when overlay is true', () => {
    render(<LoadingSpinner overlay />);
    const container = screen.getByRole('status').parentElement;
    expect(container).toHaveStyle({
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      zIndex: '999'
    });
  });

  it('should not apply overlay styles when overlay is false', () => {
    render(<LoadingSpinner overlay={false} />);
    const container = screen.getByRole('status').parentElement;
    expect(container).not.toHaveStyle({
      position: 'absolute'
    });
  });

  it('should apply custom container styles', () => {
    const customStyle = { backgroundColor: 'red' };
    render(<LoadingSpinner style={customStyle} />);
    const container = screen.getByRole('status').parentElement;
    expect(container).toHaveStyle({ backgroundColor: 'red' });
  });

  it('should render message with proper styles', () => {
    render(<LoadingSpinner message="Loading..." />);
    const message = screen.getByText('Loading...');
    expect(message).toBeInTheDocument();
  });

  it('should combine all props correctly', () => {
    render(
      <LoadingSpinner 
        size="small" 
        color="#00FF00" 
        message="Please wait..." 
        overlay 
        style={{ borderRadius: '10px' }}
      />
    );
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveStyle({
      width: '20px',
      height: '20px',
      border: '2px solid #00FF00'
    });
    
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
    
    const container = spinner.parentElement;
    expect(container).toHaveStyle({
      position: 'absolute',
      borderRadius: '10px'
    });
  });

  it('should apply proper accessibility attributes', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
  });

  it('should style ActivityIndicator with border animation', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveStyle({
      borderRadius: '50%',
      borderTopColor: 'transparent',
      animation: 'spin 1s linear infinite'
    });
  });

  it('should handle different size and color combinations', () => {
    render(<LoadingSpinner size="small" color="#800080" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveStyle({
      width: '20px',
      height: '20px',
      border: '2px solid #800080'
    });
  });

  it('should render message with proper Text component variant', () => {
    render(<LoadingSpinner message="Loading beers..." />);
    const message = screen.getByText('Loading beers...');
    
    // Should use body variant by default and center alignment
    expect(message).toHaveStyle({
      textAlign: 'center',
      color: '#666666' // COLORS.textSecondary
    });
  });

  it('should maintain container structure', () => {
    render(<LoadingSpinner message="Loading..." />);
    
    const spinner = screen.getByRole('status');
    const message = screen.getByText('Loading...');
    const container = spinner.parentElement;
    
    // Both spinner and message should be in the same container
    expect(container).toContainElement(spinner);
    expect(container).toContainElement(message.parentElement);
  });
});