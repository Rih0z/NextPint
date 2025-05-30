import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {Input} from '../Input';

describe('Input', () => {
  it('should render with placeholder', () => {
    const {getByPlaceholderText} = render(
      <Input placeholder="Enter text" />
    );

    expect(getByPlaceholderText('Enter text')).toBeTruthy();
  });

  it('should render with label', () => {
    const {getByText} = render(
      <Input label="Email" placeholder="Enter email" />
    );

    expect(getByText('Email')).toBeTruthy();
  });

  it('should show required indicator when required', () => {
    const {getByText} = render(
      <Input label="Email" required />
    );

    expect(getByText('*')).toBeTruthy();
  });

  it('should call onChangeText when text changes', () => {
    const onChangeText = jest.fn();
    const {getByPlaceholderText} = render(
      <Input placeholder="Enter text" onChangeText={onChangeText} />
    );

    const input = getByPlaceholderText('Enter text');
    fireEvent.changeText(input, 'New text');

    expect(onChangeText).toHaveBeenCalledWith('New text');
  });

  it('should show error message', () => {
    const {getByText} = render(
      <Input error="Invalid input" />
    );

    const errorText = getByText('Invalid input');
    expect(errorText).toBeTruthy();
    expect(errorText.props.style).toContainEqual(
      expect.objectContaining({
        color: '#F44336', // error color
      })
    );
  });

  it('should show helper text when no error', () => {
    const {getByText} = render(
      <Input helperText="Enter valid email" />
    );

    expect(getByText('Enter valid email')).toBeTruthy();
  });

  it('should toggle password visibility', () => {
    const {getByText, getByPlaceholderText} = render(
      <Input placeholder="Password" secureTextEntry />
    );

    const input = getByPlaceholderText('Password');
    expect(input.props.secureTextEntry).toBe(true);

    // Toggle visibility
    fireEvent.press(getByText('👁️'));
    expect(input.props.secureTextEntry).toBe(false);

    // Toggle back
    fireEvent.press(getByText('🙈'));
    expect(input.props.secureTextEntry).toBe(true);
  });

  it('should handle focus and blur events', () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    const {getByPlaceholderText} = render(
      <Input placeholder="Enter text" onFocus={onFocus} onBlur={onBlur} />
    );

    const input = getByPlaceholderText('Enter text');
    
    fireEvent(input, 'focus');
    expect(onFocus).toHaveBeenCalled();

    fireEvent(input, 'blur');
    expect(onBlur).toHaveBeenCalled();
  });

  it('should render with left icon', () => {
    const {getByText, getByPlaceholderText} = render(
      <Input placeholder="Search" leftIcon={<span>🔍</span>} />
    );

    expect(getByText('🔍')).toBeTruthy();
    expect(getByPlaceholderText('Search')).toBeTruthy();
  });

  it('should render with right icon', () => {
    const {getByText, getByPlaceholderText} = render(
      <Input placeholder="Email" rightIcon={<span>✓</span>} />
    );

    expect(getByText('✓')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
  });

  it('should apply custom container style', () => {
    const customStyle = {marginBottom: 20};
    const {getByTestId} = render(
      <Input testID="input-container" containerStyle={customStyle} />
    );

    const container = getByTestId('input-container');
    expect(container.props.style).toContainEqual(customStyle);
  });
});