import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Card } from '../Card';

describe('Card', () => {
  it('should render with children', () => {
    render(
      <Card>
        <span>Card content</span>
      </Card>
    );
    
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('should render as View by default', () => {
    render(
      <Card>
        <span>Static Card</span>
      </Card>
    );
    
    const cardContent = screen.getByText('Static Card');
    const cardContainer = cardContent.parentElement;
    expect(cardContainer?.tagName).toBe('DIV'); // Our mocked View renders as div
  });

  it('should render as TouchableOpacity when onPress is provided', () => {
    const handlePress = jest.fn();
    render(
      <Card onPress={handlePress}>
        <span>Clickable Card</span>
      </Card>
    );
    
    const cardContent = screen.getByText('Clickable Card');
    const cardContainer = cardContent.parentElement;
    expect(cardContainer?.tagName).toBe('BUTTON'); // Our mocked TouchableOpacity renders as button
  });

  it('should handle press events', () => {
    const handlePress = jest.fn();
    render(
      <Card onPress={handlePress}>
        <span>Clickable Card</span>
      </Card>
    );
    
    const button = screen.getByText('Clickable Card').parentElement;
    fireEvent.click(button!);
    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it('should not handle press when disabled', () => {
    const handlePress = jest.fn();
    render(
      <Card onPress={handlePress} disabled>
        <span>Disabled Card</span>
      </Card>
    );
    
    const button = screen.getByText('Disabled Card').parentElement;
    expect(button).toBeDisabled();
    
    fireEvent.click(button!);
    expect(handlePress).not.toHaveBeenCalled();
  });

  it('should apply padding from spacing constants', () => {
    render(
      <Card padding="lg">
        <span>Padded Card</span>
      </Card>
    );
    
    const cardContainer = screen.getByText('Padded Card').parentElement;
    expect(cardContainer).toHaveStyle({ padding: '24px' }); // SPACING.lg = 24
  });

  it('should apply margin from spacing constants', () => {
    render(
      <Card margin="sm">
        <span>Margin Card</span>
      </Card>
    );
    
    const cardContainer = screen.getByText('Margin Card').parentElement;
    expect(cardContainer).toHaveStyle({ margin: '8px' }); // SPACING.sm = 8
  });

  it('should apply default padding and margin', () => {
    render(
      <Card>
        <span>Default Card</span>
      </Card>
    );
    
    const cardContainer = screen.getByText('Default Card').parentElement;
    expect(cardContainer).toHaveStyle({ 
      padding: '16px', // SPACING.base = 16
      margin: '16px'   // SPACING.base = 16
    });
  });

  it('should apply custom styles', () => {
    const customStyle = { backgroundColor: 'red' };
    render(
      <Card style={customStyle}>
        <span>Custom Styled Card</span>
      </Card>
    );
    
    const cardContainer = screen.getByText('Custom Styled Card').parentElement;
    expect(cardContainer).toHaveStyle({ backgroundColor: 'red' });
  });

  it('should show disabled opacity when disabled', () => {
    render(
      <Card disabled>
        <span>Disabled Card</span>
      </Card>
    );
    
    const cardContainer = screen.getByText('Disabled Card').parentElement;
    expect(cardContainer).toHaveStyle({ opacity: '0.5' });
  });

  it('should apply proper styles from constants', () => {
    render(
      <Card>
        <span>Styled Card</span>
      </Card>
    );
    
    const cardContainer = screen.getByText('Styled Card').parentElement;
    // Check for some of the key styles from the component
    const computedStyle = window.getComputedStyle(cardContainer!);
    expect(cardContainer).toHaveStyle({
      backgroundColor: '#FFFFFF', // COLORS.surface
      borderRadius: '12px',
      borderWidth: '1px',
      borderColor: '#E5E5E5' // COLORS.border
    });
  });

  it('should handle different padding values', () => {
    const paddingValues = ['xs', 'sm', 'base', 'lg', 'xl'] as const;
    const expectedValues = [4, 8, 16, 24, 32]; // From SPACING constants
    
    paddingValues.forEach((padding, index) => {
      render(
        <Card padding={padding}>
          <span>{padding} padding</span>
        </Card>
      );
      
      const cardContainer = screen.getByText(`${padding} padding`).parentElement;
      expect(cardContainer).toHaveStyle({ padding: `${expectedValues[index]}px` });
    });
  });

  it('should handle different margin values', () => {
    const marginValues = ['xs', 'sm', 'base', 'lg', 'xl'] as const;
    const expectedValues = [4, 8, 16, 24, 32]; // From SPACING constants
    
    marginValues.forEach((margin, index) => {
      render(
        <Card margin={margin}>
          <span>{margin} margin</span>
        </Card>
      );
      
      const cardContainer = screen.getByText(`${margin} margin`).parentElement;
      expect(cardContainer).toHaveStyle({ margin: `${expectedValues[index]}px` });
    });
  });
});