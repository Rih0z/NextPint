import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {WelcomeScreen} from '../WelcomeScreen';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe('WelcomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render welcome content', () => {
    const {getByText} = render(
      <WelcomeScreen navigation={{navigate: mockNavigate} as any} />
    );

    expect(getByText('NextPint')).toBeTruthy();
    expect(getByText(/AI Beer Discovery/)).toBeTruthy();
    expect(getByText(/Prompt Provider/)).toBeTruthy();
    expect(getByText(/ビール探索の新しい形/)).toBeTruthy();
  });

  it('should navigate to Concept screen when button is pressed', () => {
    const {getByText} = render(
      <WelcomeScreen navigation={{navigate: mockNavigate} as any} />
    );

    const startButton = getByText('はじめる');
    fireEvent.press(startButton);

    expect(mockNavigate).toHaveBeenCalledWith('Concept');
  });

  it('should have proper styling', () => {
    const {getByText} = render(
      <WelcomeScreen navigation={{navigate: mockNavigate} as any} />
    );

    const title = getByText('NextPint');
    expect(title.props.style).toContainEqual(
      expect.objectContaining({
        color: '#D4A574', // primary color
      })
    );
  });
});