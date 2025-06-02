import React from 'react';
import { render, screen } from '@testing-library/react';
import { Text } from '../Text';

describe('Text', () => {
  it('should render text content', () => {
    render(<Text>Hello World</Text>);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('should render as React Native Text (span element)', () => {
    render(<Text>Test Text</Text>);
    const text = screen.getByText('Test Text');
    expect(text.tagName).toBe('SPAN'); // Our mocked RN Text renders as span
  });

  it('should apply default variant (body) styles', () => {
    render(<Text>Body Text</Text>);
    const text = screen.getByText('Body Text');
    expect(text).toHaveStyle({
      fontSize: '16px', // TYPOGRAPHY.sizes.base
      color: '#333333' // COLORS.text
    });
  });

  it('should apply variant styles correctly', () => {
    render(<Text variant="h1">Heading Text</Text>);
    const text = screen.getByText('Heading Text');
    expect(text).toHaveStyle({
      fontSize: '32px', // TYPOGRAPHY.sizes.xxxl
      fontWeight: '700' // TYPOGRAPHY.weights.bold
    });
  });

  it('should apply caption variant styles', () => {
    render(<Text variant="caption">Caption Text</Text>);
    const text = screen.getByText('Caption Text');
    expect(text).toHaveStyle({
      fontSize: '14px', // TYPOGRAPHY.sizes.sm
      color: '#666666' // COLORS.textSecondary
    });
  });

  it('should apply label variant styles', () => {
    render(<Text variant="label">Label Text</Text>);
    const text = screen.getByText('Label Text');
    expect(text).toHaveStyle({
      fontSize: '14px', // TYPOGRAPHY.sizes.sm
      fontWeight: '500' // TYPOGRAPHY.weights.medium
    });
  });

  it('should override size when provided', () => {
    render(<Text variant="h1" size="sm">Small Heading</Text>);
    const text = screen.getByText('Small Heading');
    expect(text).toHaveStyle({
      fontSize: '14px' // TYPOGRAPHY.sizes.sm overrides variant size
    });
  });

  it('should override weight when provided', () => {
    render(<Text variant="body" weight="bold">Bold Body</Text>);
    const text = screen.getByText('Bold Body');
    expect(text).toHaveStyle({
      fontWeight: '700' // TYPOGRAPHY.weights.bold
    });
  });

  it('should override color when provided', () => {
    render(<Text color="#FF0000">Red Text</Text>);
    const text = screen.getByText('Red Text');
    expect(text).toHaveStyle({
      color: '#FF0000'
    });
  });

  it('should apply text alignment', () => {
    render(<Text align="center">Centered Text</Text>);
    const text = screen.getByText('Centered Text');
    expect(text).toHaveStyle({
      textAlign: 'center'
    });
  });

  it('should handle numberOfLines prop', () => {
    render(<Text numberOfLines={1}>Very long text that should be truncated</Text>);
    const text = screen.getByText('Very long text that should be truncated');
    expect(text).toHaveStyle({
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    });
  });

  it('should apply custom styles', () => {
    const customStyle = { letterSpacing: '2px' };
    render(<Text style={customStyle}>Custom Styled Text</Text>);
    const text = screen.getByText('Custom Styled Text');
    expect(text).toHaveStyle({
      letterSpacing: '2px'
    });
  });

  it('should apply all variant styles together', () => {
    render(<Text variant="h2">H2 Text</Text>);
    const text = screen.getByText('H2 Text');
    expect(text).toHaveStyle({
      fontSize: '24px', // TYPOGRAPHY.sizes.xxl
      fontWeight: '600' // TYPOGRAPHY.weights.semibold
    });
  });

  it('should handle different size options', () => {
    const sizes = ['xs', 'sm', 'base', 'lg', 'xl', 'xxl', 'xxxl'] as const;
    const expectedSizes = [12, 14, 16, 18, 20, 24, 32]; // From TYPOGRAPHY.sizes
    
    sizes.forEach((size, index) => {
      render(<Text size={size}>{size} size text</Text>);
      const text = screen.getByText(`${size} size text`);
      expect(text).toHaveStyle({ fontSize: `${expectedSizes[index]}px` });
    });
  });

  it('should handle different weight options', () => {
    const weights = ['normal', 'medium', 'semibold', 'bold'] as const;
    const expectedWeights = ['400', '500', '600', '700']; // From TYPOGRAPHY.weights
    
    weights.forEach((weight, index) => {
      render(<Text weight={weight}>{weight} weight text</Text>);
      const text = screen.getByText(`${weight} weight text`);
      expect(text).toHaveStyle({ fontWeight: expectedWeights[index] });
    });
  });

  it('should handle different alignment options', () => {
    const alignments = ['left', 'center', 'right'] as const;
    
    alignments.forEach((align) => {
      render(<Text align={align}>{align} aligned text</Text>);
      const text = screen.getByText(`${align} aligned text`);
      expect(text).toHaveStyle({ textAlign: align });
    });
  });

  it('should combine multiple style props correctly', () => {
    render(
      <Text 
        variant="body" 
        size="lg" 
        weight="bold" 
        color="#FF0000" 
        align="center"
        style={{ textDecoration: 'underline' }}
      >
        Complex Styled Text
      </Text>
    );
    
    const text = screen.getByText('Complex Styled Text');
    expect(text).toHaveStyle({
      fontSize: '18px', // size overrides variant
      fontWeight: '700', // weight overrides variant
      color: '#FF0000', // custom color
      textAlign: 'center',
      textDecoration: 'underline' // custom style
    });
  });

  it('should apply h3 variant styles correctly', () => {
    render(<Text variant="h3">H3 Heading</Text>);
    const text = screen.getByText('H3 Heading');
    expect(text).toHaveStyle({
      fontSize: '20px', // TYPOGRAPHY.sizes.xl
      fontWeight: '600' // TYPOGRAPHY.weights.semibold
    });
  });

  it('should not apply numberOfLines styles when not provided', () => {
    render(<Text>Normal text without line limits</Text>);
    const text = screen.getByText('Normal text without line limits');
    expect(text).not.toHaveStyle({
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    });
  });
});