import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {Button} from '../Button';

describe('Button', () => {
  it('should render with title', () => {
    const {getByText} = render(
      <Button title="Test Button" onPress={() => {}} />
    );

    expect(getByText('Test Button')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const {getByText} = render(
      <Button title="Test Button" onPress={onPress} />
    );

    fireEvent.press(getByText('Test Button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should not call onPress when disabled', () => {
    const onPress = jest.fn();
    const {getByText} = render(
      <Button title="Test Button" onPress={onPress} disabled />
    );

    fireEvent.press(getByText('Test Button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('should show loading indicator when loading', () => {
    const {getByTestId, queryByText} = render(
      <Button title="Test Button" onPress={() => {}} loading testID="button" />
    );

    const button = getByTestId('button');
    expect(button).toBeTruthy();
    expect(queryByText('Test Button')).toBeNull();
  });

  describe('variants', () => {
    it('should render primary variant by default', () => {
      const {getByText} = render(
        <Button title="Primary" onPress={() => {}} />
      );

      const button = getByText('Primary').parent;
      expect(button?.props.style).toContainEqual(
        expect.objectContaining({
          backgroundColor: '#D4A574',
        })
      );
    });

    it('should render secondary variant', () => {
      const {getByText} = render(
        <Button title="Secondary" onPress={() => {}} variant="secondary" />
      );

      const button = getByText('Secondary').parent;
      expect(button?.props.style).toContainEqual(
        expect.objectContaining({
          backgroundColor: '#8B4513',
        })
      );
    });

    it('should render outline variant', () => {
      const {getByText} = render(
        <Button title="Outline" onPress={() => {}} variant="outline" />
      );

      const button = getByText('Outline').parent;
      expect(button?.props.style).toContainEqual(
        expect.objectContaining({
          backgroundColor: 'transparent',
          borderWidth: 1,
        })
      );
    });
  });

  describe('sizes', () => {
    it('should render medium size by default', () => {
      const {getByText} = render(
        <Button title="Medium" onPress={() => {}} />
      );

      const button = getByText('Medium').parent;
      expect(button?.props.style).toContainEqual(
        expect.objectContaining({
          height: 44,
        })
      );
    });

    it('should render small size', () => {
      const {getByText} = render(
        <Button title="Small" onPress={() => {}} size="small" />
      );

      const button = getByText('Small').parent;
      expect(button?.props.style).toContainEqual(
        expect.objectContaining({
          height: 36,
        })
      );
    });

    it('should render large size', () => {
      const {getByText} = render(
        <Button title="Large" onPress={() => {}} size="large" />
      );

      const button = getByText('Large').parent;
      expect(button?.props.style).toContainEqual(
        expect.objectContaining({
          height: 52,
        })
      );
    });
  });

  it('should apply custom styles', () => {
    const customStyle = {marginTop: 20};
    const {getByText} = render(
      <Button title="Custom" onPress={() => {}} style={customStyle} />
    );

    const button = getByText('Custom').parent;
    expect(button?.props.style).toContainEqual(customStyle);
  });
});