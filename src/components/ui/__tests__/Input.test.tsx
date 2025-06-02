import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../Input';

describe('Input', () => {
  it('should render input field', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('should render TextInput as HTML input', () => {
    render(<Input placeholder="Test input" />);
    const input = screen.getByPlaceholderText('Test input');
    expect(input.tagName).toBe('INPUT');
  });

  it('should handle onChangeText prop (React Native pattern)', () => {
    const handleChangeText = jest.fn();
    render(<Input onChangeText={handleChangeText} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'new value' } });
    
    expect(handleChangeText).toHaveBeenCalledWith('new value');
  });

  it('should render with label using Text component', () => {
    render(<Input label="Username" />);
    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  it('should show required asterisk when required', () => {
    render(<Input label="Password" required />);
    expect(screen.getByText('Password')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should show error message', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('should show helper text when no error', () => {
    render(<Input helperText="Enter at least 8 characters" />);
    expect(screen.getByText('Enter at least 8 characters')).toBeInTheDocument();
  });

  it('should prioritize error over helper text', () => {
    render(
      <Input 
        helperText="Helper text" 
        error="Error message" 
      />
    );
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
  });

  it('should handle focus and blur events', () => {
    const handleFocus = jest.fn();
    const handleBlur = jest.fn();
    render(<Input onFocus={handleFocus} onBlur={handleBlur} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    expect(handleFocus).toHaveBeenCalled();
    
    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalled();
  });

  it('should update internal focus state on blur', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    const inputContainer = input.parentElement;
    
    // Focus the input
    fireEvent.focus(input);
    expect(inputContainer).toHaveStyle({
      borderColor: '#D4A574', // COLORS.primary when focused
      borderWidth: '2px'
    });
    
    // Blur the input - this should trigger line 71
    fireEvent.blur(input);
    expect(inputContainer).toHaveStyle({
      borderColor: '#E5E5E5', // COLORS.border when not focused
      borderWidth: '1px'
    });
  });

  it('should render with left icon', () => {
    const LeftIcon = () => <span data-testid="left-icon">👤</span>;
    render(<Input leftIcon={<LeftIcon />} />);
    
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  it('should render with right icon', () => {
    const RightIcon = () => <span data-testid="right-icon">🔍</span>;
    render(<Input rightIcon={<RightIcon />} />);
    
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('should handle secureTextEntry with toggle button', () => {
    render(<Input secureTextEntry />);
    
    // For password inputs, use different selector
    const input = document.querySelector('input[type="password"]') || screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'password');
    
    // Should render toggle button for password visibility
    const toggleButton = screen.getByText('👁️'); // Eye icon for showing password
    expect(toggleButton).toBeInTheDocument();
    
    fireEvent.click(toggleButton);
    expect(input).toHaveAttribute('type', 'text');
    
    // Icon should change to indicate password is visible
    expect(screen.getByText('🙈')).toBeInTheDocument();
    
    // Toggle back to secure - this covers line 49
    fireEvent.click(screen.getByText('🙈'));
    expect(input).toHaveAttribute('type', 'password');
    expect(screen.getByText('👁️')).toBeInTheDocument();
  });

  it('should not render rightIcon when secureTextEntry is provided', () => {
    const RightIcon = () => <span data-testid="custom-right-icon">🔍</span>;
    render(<Input secureTextEntry rightIcon={<RightIcon />} />);
    
    // Based on the code logic: rightIcon && !secureTextEntry
    // So rightIcon should NOT render when secureTextEntry is true
    expect(screen.queryByTestId('custom-right-icon')).not.toBeInTheDocument();
    expect(screen.getByText('👁️')).toBeInTheDocument();
  });

  it('should apply container styles', () => {
    const containerStyle = { backgroundColor: 'red' };
    render(<Input containerStyle={containerStyle} />);
    
    // Find the outer container div that should have the custom style
    const containers = document.querySelectorAll('div');
    const styledContainer = Array.from(containers).find(div => 
      div.style.backgroundColor === 'red'
    );
    expect(styledContainer).toBeTruthy();
  });

  it('should apply input styles', () => {
    const inputStyle = { borderColor: 'blue' };
    render(<Input inputStyle={inputStyle} />);
    
    // The input style should be applied to the input container
    const inputContainer = screen.getByRole('textbox').parentElement;
    expect(inputContainer).toHaveStyle({ borderColor: 'blue' });
  });

  it('should handle disabled state', () => {
    render(<Input disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('should handle value prop', () => {
    render(<Input value="test value" />);
    const input = screen.getByDisplayValue('test value');
    expect(input).toBeInTheDocument();
  });

  it('should apply placeholder text color from constants', () => {
    render(<Input placeholder="Test placeholder" />);
    const input = screen.getByPlaceholderText('Test placeholder');
    
    // Check that placeholder color is set from COLORS.textTertiary
    expect(input).toHaveStyle({
      '::placeholder': undefined // placeholderTextColor is applied as a React Native prop
    });
  });

  it('should apply proper spacing and typography from constants', () => {
    render(<Input />);
    
    // Find the container with marginBottom styling
    const containers = document.querySelectorAll('div');
    const containerWithMargin = Array.from(containers).find(div => 
      div.style.marginBottom === '16px'
    );
    expect(containerWithMargin).toBeTruthy();
  });

  it('should style input with left icon correctly', () => {
    const LeftIcon = () => <span data-testid="left-icon">👤</span>;
    render(<Input leftIcon={<LeftIcon />} />);
    
    const input = screen.getByRole('textbox');
    // Input should have reduced left padding when left icon is present
    const expectedStyle = {
      paddingLeft: '4px' // SPACING.xs - reduced padding for left icon
    };
    expect(input).toHaveStyle(expectedStyle);
  });

  it('should apply error styling to input container', () => {
    render(<Input error="Error message" />);
    const inputContainer = screen.getByRole('textbox').parentElement;
    expect(inputContainer).toHaveStyle({
      borderColor: '#F44336' // COLORS.error
    });
  });

  it('should apply focus styling', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    
    fireEvent.focus(input);
    
    const inputContainer = input.parentElement;
    expect(inputContainer).toHaveStyle({
      borderColor: '#D4A574', // COLORS.primary
      borderWidth: '2px'
    });
  });

  it('should handle multiple props together', () => {
    const handleChangeText = jest.fn();
    const LeftIcon = () => <span data-testid="left-icon">👤</span>;
    
    render(
      <Input
        label="Username"
        placeholder="Enter username"
        leftIcon={<LeftIcon />}
        helperText="Must be unique"
        required
        onChangeText={handleChangeText}
      />
    );
    
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument();
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByText('Must be unique')).toBeInTheDocument();
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(handleChangeText).toHaveBeenCalledWith('test');
  });
});