'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Upload, Search, History, Settings } from 'lucide-react';

const navItems = [
  { href: '/home', label: 'ホーム', icon: Home },
  { href: '/import', label: 'インポート', icon: Upload },
  { href: '/sessions/create', label: '検索', icon: Search },
  { href: '/history', label: '履歴', icon: History },
  { href: '/settings', label: '設定', icon: Settings },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="glass-nav sticky top-0 z-50 border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/home" className="flex items-center gap-2">
            <span className="text-2xl">🍺</span>
            <span className="text-xl font-bold text-gradient">NextPint</span>
          </Link>
          
          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <Icon size={20} />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}