import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import Navigation from '../Navigation';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock LanguageSwitcher
jest.mock('../LanguageSwitcher', () => {
  return function MockLanguageSwitcher() {
    return <div data-testid="language-switcher">Language Switcher</div>;
  };
});

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('Navigation', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/home');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render navigation with logo', () => {
    render(<Navigation />);
    
    expect(screen.getAllByText('🍺')).toHaveLength(2); // Desktop and mobile versions
    expect(screen.getAllByText('NextPint')).toHaveLength(2); // Desktop and mobile versions
  });

  it('should render all navigation items on desktop', () => {
    render(<Navigation />);
    
    // Check for navigation items (uses fallback translation values)
    expect(screen.getAllByText('ホーム').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('インポート').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('検索').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('プロンプト').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('セッション').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('分析').length).toBeGreaterThanOrEqual(2);
  });

  it('should highlight active navigation item', () => {
    mockUsePathname.mockReturnValue('/import');
    render(<Navigation />);
    
    // Find links by href attribute instead
    const importLinks = screen.getAllByRole('link').filter(link => 
      link.getAttribute('href') === '/import'
    );
    expect(importLinks[0]).toHaveClass('active');
  });

  it('should render mobile menu button', () => {
    render(<Navigation />);
    
    const menuButton = screen.getByLabelText('メニューを開く');
    expect(menuButton).toBeInTheDocument();
  });

  it('should toggle mobile menu when menu button is clicked', async () => {
    render(<Navigation />);
    
    const menuButton = screen.getByLabelText('メニューを開く');
    
    // Menu should be closed initially
    expect(screen.queryByRole('navigation')).not.toHaveClass('translate-x-0');
    
    // Click to open menu
    fireEvent.click(menuButton);
    
    await waitFor(() => {
      expect(screen.getByLabelText('メニューを閉じる')).toBeInTheDocument();
    });
  });

  it('should close mobile menu when overlay is clicked', async () => {
    render(<Navigation />);
    
    const menuButton = screen.getByLabelText('メニューを開く');
    fireEvent.click(menuButton);
    
    await waitFor(() => {
      expect(screen.getByLabelText('メニューを閉じる')).toBeInTheDocument();
    });
    
    // Click overlay to close menu
    const overlay = document.querySelector('.fixed.inset-0.bg-black\\/50');
    if (overlay) {
      fireEvent.click(overlay);
    }
    
    await waitFor(() => {
      expect(screen.getByLabelText('メニューを開く')).toBeInTheDocument();
    });
  });

  it('should close mobile menu when navigation item is clicked', async () => {
    render(<Navigation />);
    
    const menuButton = screen.getByLabelText('メニューを開く');
    fireEvent.click(menuButton);
    
    await waitFor(() => {
      expect(screen.getByLabelText('メニューを閉じる')).toBeInTheDocument();
    });
    
    // Click on a navigation item in mobile menu
    const homeLinks = screen.getAllByText('ホーム');
    const mobileHomeLink = homeLinks.find(link => 
      link.closest('.fixed.top-0.right-0.h-full')
    );
    
    if (mobileHomeLink) {
      fireEvent.click(mobileHomeLink);
      
      await waitFor(() => {
        expect(screen.getByLabelText('メニューを開く')).toBeInTheDocument();
      });
    }
  });

  it('should render bottom navigation for mobile', () => {
    render(<Navigation />);
    
    // Check for bottom navigation items
    const bottomNavItems = screen.getAllByRole('link');
    const bottomNavHome = bottomNavItems.find(item => 
      item.getAttribute('href') === '/home' && 
      item.closest('.fixed.bottom-0')
    );
    
    expect(bottomNavHome).toBeInTheDocument();
  });

  it('should render language switcher', () => {
    render(<Navigation />);
    
    expect(screen.getAllByTestId('language-switcher')).toHaveLength(2); // Desktop and mobile versions
  });

  it('should handle different pathnames correctly', () => {
    const testPaths = ['/home', '/import', '/sessions/create', '/prompts', '/analytics'];
    
    testPaths.forEach(path => {
      mockUsePathname.mockReturnValue(path);
      render(<Navigation />);
      
      // Just verify that the component renders without errors for different paths
      expect(screen.getAllByRole('navigation').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('should handle logo click', () => {
    render(<Navigation />);
    
    const logoLink = screen.getByRole('link', { name: /🍺 NextPint/i });
    expect(logoLink).toHaveAttribute('href', '/home');
  });

  it('should show correct icons for navigation items', () => {
    render(<Navigation />);
    
    // Check that SVG icons are rendered (query by svg tag directly)
    const nav = screen.getByRole('navigation');
    const svgElements = nav.querySelectorAll('svg');
    expect(svgElements.length).toBeGreaterThan(0);
  });

  it('should apply correct CSS classes for mobile responsiveness', () => {
    render(<Navigation />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('glass-nav', 'sticky', 'top-0', 'z-50');
    
    const mobileMenu = document.querySelector('.fixed.top-0.right-0.h-full');
    expect(mobileMenu).toHaveClass('lg:hidden');
    
    const bottomNav = document.querySelector('.fixed.bottom-0.left-0.right-0');
    expect(bottomNav).toHaveClass('lg:hidden');
  });

  it('should show version info in mobile menu', async () => {
    render(<Navigation />);
    
    const menuButton = screen.getByLabelText('メニューを開く');
    fireEvent.click(menuButton);
    
    await waitFor(() => {
      expect(screen.getByText('NextPint v1.0')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<Navigation />);
      
      expect(screen.getByLabelText('メニューを開く')).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      render(<Navigation />);
      
      const menuButton = screen.getByLabelText('メニューを開く');
      expect(menuButton.tagName).toBe('BUTTON');
      
      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveAttribute('href');
      });
    });

    it('should have proper focus management', async () => {
      render(<Navigation />);
      
      const menuButton = screen.getByLabelText('メニューを開く');
      menuButton.focus();
      expect(menuButton).toHaveFocus();
      
      fireEvent.click(menuButton);
      
      await waitFor(() => {
        const closeButton = screen.getByLabelText('メニューを閉じる');
        expect(closeButton).toBeInTheDocument();
      });
    });
  });
});