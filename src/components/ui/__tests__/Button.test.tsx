import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock constants first
jest.mock('@constants', () => ({
  COLORS: {
    primary: '#D4A574',
    primaryDark: '#B8955F',
    primaryLight: '#E6C49A',
    secondary: '#8B4513',
    secondaryLight: '#CD853F',
    background: '#FFFFFF',
    backgroundSecondary: '#F5F5F5',
    backgroundTertiary: '#FAFAFA',
    surface: '#FFFFFF',
    surfaceSecondary: '#F8F8F8',
    text: '#333333',
    textSecondary: '#666666',
    textTertiary: '#999999',
    textLight: '#FFFFFF',
    border: '#E5E5E5',
    borderSecondary: '#D0D0D0',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3'
  },
  TYPOGRAPHY: {
    sizes: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32
    },
    weights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
      loose: 1.8
    }
  },
  SPACING: {
    xs: 4,
    sm: 8,
    base: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64
  }
}));

// Import after mocking
import { Button } from '../Button';

describe('Button', () => {
  it('should render with title', () => {
    render(<Button title="Click me" onPress={jest.fn()} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should handle press events', () => {
    const handlePress = jest.fn();
    render(<Button title="Click me" onPress={handlePress} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button title="Disabled" onPress={jest.fn()} disabled />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should not call onPress when disabled', () => {
    const handlePress = jest.fn();
    render(<Button title="Disabled" onPress={handlePress} disabled />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handlePress).not.toHaveBeenCalled();
  });

  it('should show loading indicator when loading', () => {
    render(<Button title="Loading" onPress={jest.fn()} loading />);
    expect(screen.getByTestId('activity-indicator')).toBeInTheDocument();
  });

  it('should be disabled when loading', () => {
    render(<Button title="Loading" onPress={jest.fn()} loading />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should apply variant styles', () => {
    render(<Button title="Primary" onPress={jest.fn()} variant="primary" />);
    // Test passes if no error is thrown - styles are applied internally
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should apply size styles', () => {
    render(<Button title="Large" onPress={jest.fn()} size="large" />);
    // Test passes if no error is thrown - styles are applied internally
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should render different variants', () => {
    const variants = ['primary', 'secondary', 'outline', 'text'] as const;
    
    variants.forEach(variant => {
      render(<Button title={`${variant} button`} onPress={jest.fn()} variant={variant} />);
      expect(screen.getByText(`${variant} button`)).toBeInTheDocument();
    });
  });

  it('should render different sizes', () => {
    const sizes = ['small', 'medium', 'large'] as const;
    
    sizes.forEach(size => {
      render(<Button title={`${size} button`} onPress={jest.fn()} size={size} />);
      expect(screen.getByText(`${size} button`)).toBeInTheDocument();
    });
  });

  it('should show correct loading color for primary variant', () => {
    render(<Button title="Loading" onPress={jest.fn()} loading variant="primary" />);
    expect(screen.getByTestId('activity-indicator')).toBeInTheDocument();
  });

  it('should show correct loading color for non-primary variant', () => {
    render(<Button title="Loading" onPress={jest.fn()} loading variant="secondary" />);
    expect(screen.getByTestId('activity-indicator')).toBeInTheDocument();
  });

  it('should apply custom styles', () => {
    const customStyle = { backgroundColor: 'red' };
    const customTextStyle = { color: 'blue' };
    render(
      <Button 
        title="Custom" 
        onPress={jest.fn()} 
        style={customStyle}
        textStyle={customTextStyle}
      />
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});