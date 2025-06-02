'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { 
  Home, 
  Upload, 
  Search, 
  History, 
  Settings, 
  Sparkles, 
  FolderOpen, 
  BarChart3,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navigation() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/home', label: t('navigation.home', 'ホーム'), icon: Home },
    { href: '/import', label: t('navigation.import', 'インポート'), icon: Upload },
    { href: '/sessions/create', label: t('navigation.search', '検索'), icon: Search },
    { href: '/sessions', label: t('navigation.sessions', 'セッション'), icon: FolderOpen },
    { href: '/prompts', label: t('navigation.prompts', 'プロンプト'), icon: Sparkles },
    { href: '/analytics', label: t('navigation.analytics', '分析'), icon: BarChart3 },
    { href: '/history', label: t('navigation.history', '履歴'), icon: History },
    { href: '/settings', label: t('navigation.settings', '設定'), icon: Settings },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Navigation */}
      <nav className="glass-nav sticky top-0 z-50 border-b border-gray-800 safe-area-top">
        <div className="mobile-container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              href="/home" 
              className="flex items-center gap-2 touch-action-manipulation"
              onClick={closeMobileMenu}
            >
              <span className="text-2xl">🍺</span>
              <span className="text-xl font-bold text-gradient">{t('app.name', 'NextPint')}</span>
            </Link>
            
            {/* Desktop Navigation Items */}
            <div className="hidden lg:flex items-center gap-2">
              {navItems.slice(0, 6).map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={20} />
                    <span className="hidden xl:inline">{item.label}</span>
                  </Link>
                );
              })}
              
              {/* Language Switcher */}
              <div className="ml-4">
                <LanguageSwitcher />
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden btn-secondary-small"
              aria-label="メニューを開く"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={closeMobileMenu}
          />
        )}

        {/* Mobile Menu Panel */}
        <div className={`
          fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-background-primary border-l border-gray-800 z-50
          transform transition-transform duration-300 ease-in-out lg:hidden safe-area-top safe-area-bottom
          ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <div className="flex flex-col h-full">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🍺</span>
                <span className="text-lg font-bold text-gradient">NextPint</span>
              </div>
              <button
                onClick={closeMobileMenu}
                className="btn-secondary-small"
                aria-label="メニューを閉じる"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile Menu Items */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <div className="p-4 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobileMenu}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                        ${isActive 
                          ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' 
                          : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary'
                        }
                        active:scale-95 touch-action-manipulation
                      `}
                    >
                      <Icon size={22} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Mobile Menu Footer */}
            <div className="p-4 border-t border-gray-800">
              <div className="mb-4">
                <LanguageSwitcher />
              </div>
              <div className="text-xs text-text-tertiary text-center">
                NextPint v1.0
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom Navigation for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden glass-nav border-t border-gray-800 safe-area-bottom z-40">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all duration-200
                  min-w-[60px] touch-action-manipulation active:scale-95
                  ${isActive 
                    ? 'text-primary-400' 
                    : 'text-text-tertiary hover:text-text-primary'
                  }
                `}
              >
                <Icon size={20} />
                <span className="text-xs font-medium line-clamp-1">
                  {item.label.split(' ')[0]}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom padding for mobile bottom nav */}
      <div className="h-20 lg:hidden" />
    </>
  );
}