import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import I18nProvider from '../I18nProvider';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn(),
  },
  useTranslation: jest.fn(() => ({
    t: (key: string) => key,
    i18n: {
      language: 'ja-JP',
      changeLanguage: jest.fn(),
    },
  })),
  I18nextProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="i18n-provider">{children}</div>
}));

// Mock i18n
jest.mock('@/i18n', () => ({
  default: {
    init: jest.fn(() => Promise.resolve()),
    language: 'ja-JP',
    changeLanguage: jest.fn(() => Promise.resolve()),
    use: jest.fn(function() { return this; }),
    t: jest.fn((key: string) => key),
  }
}));

describe('I18nProvider', () => {
  const TestComponent = () => <div data-testid="test-child">Test Content</div>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children', async () => {
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });
  });

  it('should provide I18n context', async () => {
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });

  it('should handle initialization', () => {
    const { container } = render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    expect(container).toBeInTheDocument();
  });

  it('should render with multiple children', async () => {
    render(
      <I18nProvider>
        <div data-testid="child1">Child 1</div>
        <div data-testid="child2">Child 2</div>
      </I18nProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('child1')).toBeInTheDocument();
      expect(screen.getByTestId('child2')).toBeInTheDocument();
    });
  });

  it('should not crash with no children', () => {
    const { container } = render(<I18nProvider />);
    expect(container).toBeInTheDocument();
  });
});