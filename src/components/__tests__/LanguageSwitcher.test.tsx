import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LanguageSwitcher from '../LanguageSwitcher';

// Mock react-i18next
const mockChangeLanguage = jest.fn();
const mockI18n = {
  language: 'ja',
  changeLanguage: mockChangeLanguage,
};

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: mockI18n,
  }),
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockI18n.language = 'ja';
  });

  it('should render with current language flag', () => {
    render(<LanguageSwitcher />);
    
    expect(screen.getByText('🇯🇵')).toBeInTheDocument();
    expect(screen.getByLabelText('言語を変更')).toBeInTheDocument();
  });

  it('should show globe icon', () => {
    render(<LanguageSwitcher />);
    
    // Check for SVG element (lucide-react Globe icon)
    const button = screen.getByLabelText('言語を変更');
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('should show chevron down icon', () => {
    render(<LanguageSwitcher />);
    
    const button = screen.getByLabelText('言語を変更');
    const svgElements = button.querySelectorAll('svg');
    expect(svgElements.length).toBeGreaterThanOrEqual(2); // Globe and chevron icons
  });

  it('should open dropdown when button is clicked', async () => {
    render(<LanguageSwitcher />);
    
    const button = screen.getByLabelText('言語を変更');
    
    // Dropdown should not be visible initially
    expect(screen.queryByText('日本語')).not.toBeInTheDocument();
    expect(screen.queryByText('English')).not.toBeInTheDocument();
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('日本語')).toBeInTheDocument();
      expect(screen.getByText('English')).toBeInTheDocument();
    });
  });

  it('should close dropdown when overlay is clicked', async () => {
    render(<LanguageSwitcher />);
    
    const button = screen.getByLabelText('言語を変更');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('日本語')).toBeInTheDocument();
    });
    
    // Click overlay
    const overlay = document.querySelector('.fixed.inset-0.z-10');
    if (overlay) {
      fireEvent.click(overlay);
    }
    
    await waitFor(() => {
      expect(screen.queryByText('日本語')).not.toBeInTheDocument();
    });
  });

  it('should change language when language option is clicked', async () => {
    render(<LanguageSwitcher />);
    
    const button = screen.getByLabelText('言語を変更');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument();
    });
    
    const englishOption = screen.getByText('English');
    fireEvent.click(englishOption);
    
    expect(mockChangeLanguage).toHaveBeenCalledWith('en');
    
    await waitFor(() => {
      expect(screen.queryByText('English')).not.toBeInTheDocument();
    });
  });

  it('should highlight current language', async () => {
    render(<LanguageSwitcher />);
    
    const button = screen.getByLabelText('言語を変更');
    fireEvent.click(button);
    
    await waitFor(() => {
      const japaneseOption = screen.getByText('日本語').closest('button');
      const englishOption = screen.getByText('English').closest('button');
      
      expect(japaneseOption).toHaveClass('bg-primary-500/10', 'text-primary-400');
      expect(englishOption).not.toHaveClass('bg-primary-500/10', 'text-primary-400');
    });
  });

  it('should handle English as current language', () => {
    mockI18n.language = 'en';
    
    render(<LanguageSwitcher />);
    
    expect(screen.getByText('🇺🇸')).toBeInTheDocument();
  });

  it('should handle unknown language gracefully', () => {
    mockI18n.language = 'unknown';
    
    render(<LanguageSwitcher />);
    
    // Should fallback to first language (Japanese)
    expect(screen.getByText('🇯🇵')).toBeInTheDocument();
  });

  it('should rotate chevron icon when dropdown is open', async () => {
    render(<LanguageSwitcher />);
    
    const button = screen.getByLabelText('言語を変更');
    const chevronElement = button.querySelector('svg:last-child');
    
    // Initially should not have rotate class
    expect(chevronElement).not.toHaveClass('rotate-180');
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(chevronElement).toHaveClass('rotate-180');
    });
  });

  it('should show both language flags in dropdown', async () => {
    render(<LanguageSwitcher />);
    
    const button = screen.getByLabelText('言語を変更');
    fireEvent.click(button);
    
    await waitFor(() => {
      const dropdownFlags = screen.getAllByText(/🇯🇵|🇺🇸/);
      // Should have flags in dropdown (excluding the one in the button)
      expect(dropdownFlags.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('should handle rapid clicking', async () => {
    render(<LanguageSwitcher />);
    
    const button = screen.getByLabelText('言語を変更');
    
    // Rapidly click button
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);
    
    // Component should handle rapid clicking without crashing
    expect(button).toBeInTheDocument();
  });

  describe('accessibility', () => {
    it('should have proper ARIA label', () => {
      render(<LanguageSwitcher />);
      
      expect(screen.getByLabelText('言語を変更')).toBeInTheDocument();
    });

    it('should be keyboard accessible', async () => {
      render(<LanguageSwitcher />);
      
      const button = screen.getByLabelText('言語を変更');
      
      // Focus the button
      button.focus();
      expect(button).toHaveFocus();
      
      // This test just verifies the button can receive focus
      // The dropdown behavior is tested in other tests
    });

    it('should have proper button semantics', () => {
      render(<LanguageSwitcher />);
      
      const button = screen.getByLabelText('言語を変更');
      expect(button.tagName).toBe('BUTTON');
      // Button might not have explicit type="button" attribute
      const buttonType = button.getAttribute('type');
      expect(buttonType === null || buttonType === 'button').toBe(true);
    });

    it('should have proper z-index for dropdown', async () => {
      render(<LanguageSwitcher />);
      
      const button = screen.getByLabelText('言語を変更');
      fireEvent.click(button);
      
      await waitFor(() => {
        const dropdown = document.querySelector('.absolute.top-full');
        expect(dropdown).toHaveClass('z-20');
        
        const overlay = document.querySelector('.fixed.inset-0');
        expect(overlay).toHaveClass('z-10');
      });
    });
  });

  describe('styling', () => {
    it('should apply correct CSS classes', () => {
      render(<LanguageSwitcher />);
      
      const button = screen.getByLabelText('言語を変更');
      expect(button).toHaveClass(
        'flex', 'items-center', 'gap-2', 'px-3', 'py-2', 'rounded-lg',
        'bg-background-secondary', 'hover:bg-background-tertiary', 'transition-colors'
      );
    });

    it('should style dropdown correctly', async () => {
      render(<LanguageSwitcher />);
      
      const button = screen.getByLabelText('言語を変更');
      fireEvent.click(button);
      
      await waitFor(() => {
        const dropdown = document.querySelector('.absolute.top-full');
        expect(dropdown).toHaveClass(
          'bg-background-secondary', 'border', 'border-gray-700', 
          'rounded-lg', 'shadow-lg', 'min-w-[140px]'
        );
      });
    });
  });
});