'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  Upload, 
  Sparkles, 
  BarChart3, 
  Clock, 
  Star,
  TrendingUp,
  Target,
  ChevronRight
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import { ServiceFactory } from '@/application/factories/ServiceFactory';

export default function HomePage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalBeers: 0,
    totalSessions: 0,
    recentSessions: [] as any[],
    hasData: false
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const storageService = ServiceFactory.getStorageService();
      const [beers, sessions] = await Promise.all([
        storageService.getBeerHistory(),
        storageService.getSessions()
      ]);

      const recentSessions = sessions
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3);

      setStats({
        totalBeers: beers.length,
        totalSessions: sessions.length,
        recentSessions,
        hasData: beers.length > 0 || sessions.length > 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      title: t('home.quickActions.newSearch', 'ビール検索'),
      description: t('home.quickActions.newSearchDesc', '新しいビールを見つけよう'),
      icon: Search,
      href: '/sessions/create',
      color: 'bg-primary-500/20 text-primary-400 border-primary-500/30',
      gradient: 'from-primary-500 to-primary-600'
    },
    {
      title: t('home.quickActions.import', '履歴インポート'),
      description: t('home.quickActions.importDesc', 'ビール履歴を追加'),
      icon: Upload,
      href: '/import',
      color: 'bg-secondary-500/20 text-secondary-400 border-secondary-500/30',
      gradient: 'from-secondary-500 to-secondary-600'
    },
    {
      title: t('home.quickActions.prompts', 'プロンプト'),
      description: t('home.quickActions.promptsDesc', 'テンプレート集'),
      icon: Sparkles,
      href: '/prompts',
      color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      title: t('home.quickActions.analytics', '分析'),
      description: t('home.quickActions.analyticsDesc', '好みの傾向を見る'),
      icon: BarChart3,
      href: '/analytics',
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      gradient: 'from-blue-500 to-blue-600'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-dark">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center animate-fade-in">
            <div className="spinner mx-auto mb-6"></div>
            <p className="text-lg text-text-secondary">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Navigation />
      
      <main className="mobile-container mobile-section pb-24 lg:pb-8">
        {/* Welcome Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="text-6xl sm:text-7xl lg:text-8xl mb-4 animate-fade-in">🍺</div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 text-gradient animate-slide-up">
            {t('home.welcome', 'NextPintへようこそ')}
          </h1>
          <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto animate-slide-up">
            {t('home.subtitle', 'AIを活用してあなたにぴったりのビールを発見しましょう')}
          </p>
        </div>

        {/* Stats Cards - Mobile Optimized */}
        {stats.hasData && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 sm:mb-12">
            <div className="glass-card rounded-xl p-4 sm:p-6 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary-400 mb-1">
                {stats.totalBeers}
              </div>
              <div className="text-xs sm:text-sm text-text-secondary">
                ビール数
              </div>
            </div>
            
            <div className="glass-card rounded-xl p-4 sm:p-6 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-secondary-400 mb-1">
                {stats.totalSessions}
              </div>
              <div className="text-xs sm:text-sm text-text-secondary">
                セッション
              </div>
            </div>
            
            <div className="glass-card rounded-xl p-4 sm:p-6 text-center col-span-2 lg:col-span-1">
              <div className="text-2xl sm:text-3xl font-bold text-green-400 mb-1">
                {stats.recentSessions.filter(s => s.status === 'active').length}
              </div>
              <div className="text-xs sm:text-sm text-text-secondary">
                アクティブ
              </div>
            </div>
            
            <div className="glass-card rounded-xl p-4 sm:p-6 text-center col-span-2 lg:col-span-1">
              <div className="text-2xl sm:text-3xl font-bold text-blue-400 mb-1">
                {Math.round((stats.totalSessions / Math.max(stats.totalBeers, 1)) * 100)}%
              </div>
              <div className="text-xs sm:text-sm text-text-secondary">
                活用率
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions - Mobile Grid */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center lg:text-left">
            クイックアクション
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group block"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`
                    glass-card rounded-xl p-6 sm:p-8 border transition-all duration-300
                    hover:scale-105 active:scale-95 touch-action-manipulation
                    ${action.color}
                    group-hover:shadow-xl group-hover:shadow-primary-500/10
                  `}>
                    <div className="flex items-start gap-4">
                      <div className={`
                        w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${action.gradient}
                        flex items-center justify-center flex-shrink-0
                        group-hover:scale-110 transition-transform duration-300
                      `}>
                        <Icon size={24} className="text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg sm:text-xl text-text-primary">
                            {action.title}
                          </h3>
                          <ChevronRight 
                            size={20} 
                            className="text-text-tertiary group-hover:text-text-primary transition-colors flex-shrink-0" 
                          />
                        </div>
                        <p className="text-sm sm:text-base text-text-secondary line-clamp-2">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Sessions - Mobile Optimized */}
        {stats.recentSessions.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">最近のセッション</h2>
              <Link 
                href="/sessions" 
                className="text-primary-400 hover:text-primary-300 text-sm sm:text-base font-medium flex items-center gap-1"
              >
                すべて見る
                <ChevronRight size={16} />
              </Link>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              {stats.recentSessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/sessions/session-detail?id=${session.id}`}
                  className="block group"
                >
                  <div className="glass-card rounded-xl p-4 sm:p-6 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 touch-action-manipulation">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Target size={20} className="text-primary-400" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg line-clamp-2 mb-1 group-hover:text-primary-400 transition-colors">
                          {session.profile.sessionGoal}
                        </h3>
                        
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-text-secondary">
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>
                              {new Date(session.createdAt).toLocaleDateString('ja-JP')}
                            </span>
                          </div>
                          
                          {session.status && (
                            <div className={`
                              px-2 py-1 rounded-full text-xs font-medium
                              ${session.status === 'active' 
                                ? 'bg-green-500/20 text-green-400' 
                                : session.status === 'completed'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-gray-500/20 text-gray-400'
                              }
                            `}>
                              {session.status === 'active' ? 'アクティブ' : 
                               session.status === 'completed' ? '完了' : 'アーカイブ'}
                            </div>
                          )}
                        </div>
                        
                        {session.profile.searchKeywords && session.profile.searchKeywords.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {session.profile.searchKeywords.slice(0, 3).map((keyword: string, i: number) => (
                              <span 
                                key={i} 
                                className="px-2 py-1 bg-background-secondary rounded-full text-xs text-text-tertiary"
                              >
                                {keyword}
                              </span>
                            ))}
                            {session.profile.searchKeywords.length > 3 && (
                              <span className="px-2 py-1 bg-background-secondary rounded-full text-xs text-text-tertiary">
                                +{session.profile.searchKeywords.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <ChevronRight 
                        size={20} 
                        className="text-text-tertiary group-hover:text-text-primary transition-colors flex-shrink-0 mt-1" 
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Empty State for New Users */}
        {!stats.hasData && (
          <div className="text-center py-12 sm:py-16">
            <div className="text-5xl sm:text-6xl mb-6 opacity-50">🍺</div>
            <h3 className="text-xl sm:text-2xl font-semibold mb-3">
              NextPintをはじめましょう
            </h3>
            <p className="text-text-secondary mb-8 max-w-md mx-auto">
              ビール履歴をインポートするか、新しい検索セッションを作成してAIビール発見を体験してください。
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/import" className="btn-primary">
                <Upload size={20} className="mr-2" />
                履歴をインポート
              </Link>
              <Link href="/sessions/create" className="btn-secondary">
                <Search size={20} className="mr-2" />
                ビール検索を開始
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}