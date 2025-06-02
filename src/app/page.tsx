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
  ChevronRight,
  ArrowRight,
  Zap,
  Users,
  Shield
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
    // Track page view
    ServiceFactory.getAnalyticsService().trackEvent('page_view', { page: 'home' });
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

  const handleQuickActionClick = (action: string) => {
    ServiceFactory.getAnalyticsService().trackEvent('quick_action_click', { action });
  };

  const features = [
    {
      icon: Zap,
      title: 'AI-Powered Discovery',
      description: 'Get personalized beer recommendations using advanced AI prompts tailored to your taste preferences.'
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'All your data stays on your device. We never share your beer preferences or drinking history.'
    },
    {
      icon: Users,
      title: 'AI-Neutral',
      description: 'Works with ChatGPT, Claude, Gemini, and any AI service. Get optimized prompts for any platform.'
    }
  ];

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
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="text-6xl sm:text-7xl lg:text-8xl mb-6 animate-fade-in">🍺</div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 text-gradient animate-slide-up">
            NextPint
          </h1>
          <p className="text-xl sm:text-2xl text-text-secondary mb-6 max-w-3xl mx-auto animate-slide-up">
            AIビール発見のためのプロンプトプロバイダー
          </p>
          <p className="text-base sm:text-lg text-text-tertiary max-w-2xl mx-auto mb-8 animate-slide-up">
            あなたの好みを理解し、最適なAIプロンプトを生成してパーフェクトなビール体験を提供します
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Link 
              href="/sessions/create" 
              className="btn-primary text-lg px-8 py-4"
              onClick={() => handleQuickActionClick('hero_start_discovery')}
            >
              <Search size={24} className="mr-2" />
              ビール発見を開始
            </Link>
            <Link 
              href="/import" 
              className="btn-secondary text-lg px-8 py-4"
              onClick={() => handleQuickActionClick('hero_import')}
            >
              <Upload size={24} className="mr-2" />
              履歴をインポート
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
            なぜNextPintなのか？
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={feature.title}
                  className="glass-card rounded-xl p-6 text-center animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-16 h-16 bg-primary-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon size={32} className="text-primary-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-text-primary">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats Cards - Only show if user has data */}
        {stats.hasData && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
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
            
            <div className="glass-card rounded-xl p-4 sm:p-6 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-green-400 mb-1">
                {stats.recentSessions.filter(s => s.status === 'active').length}
              </div>
              <div className="text-xs sm:text-sm text-text-secondary">
                アクティブ
              </div>
            </div>
            
            <div className="glass-card rounded-xl p-4 sm:p-6 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-400 mb-1">
                {Math.round((stats.totalSessions / Math.max(stats.totalBeers, 1)) * 100)}%
              </div>
              <div className="text-xs sm:text-sm text-text-secondary">
                活用率
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center lg:text-left">
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
                  onClick={() => handleQuickActionClick(action.href)}
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

        {/* Recent Sessions - Only show if user has data */}
        {stats.recentSessions.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">最近のセッション</h2>
              <Link 
                href="/sessions" 
                className="text-primary-400 hover:text-primary-300 text-sm sm:text-base font-medium flex items-center gap-1"
                onClick={() => handleQuickActionClick('view_all_sessions')}
              >
                すべて見る
                <ChevronRight size={16} />
              </Link>
            </div>
            
            <div className="space-y-4">
              {stats.recentSessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/sessions/${session.id}`}
                  className="block group"
                  onClick={() => handleQuickActionClick('recent_session_click')}
                >
                  <div className="glass-card rounded-xl p-4 sm:p-6 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 touch-action-manipulation">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Target size={20} className="text-primary-400" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg line-clamp-2 mb-1 group-hover:text-primary-400 transition-colors">
                          {session.profile?.sessionGoal || 'ビール発見セッション'}
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
                        
                        {session.profile?.searchKeywords && session.profile.searchKeywords.length > 0 && (
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
          <div className="text-center py-16">
            <div className="text-5xl sm:text-6xl mb-6 opacity-70">🎯</div>
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">
              パーフェクトなビール体験を始めましょう
            </h3>
            <p className="text-text-secondary mb-8 max-w-lg mx-auto text-lg">
              AIの力を借りて、あなたの好みにぴったりのビールを発見。まずは簡単な設定から始めてみませんか？
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/sessions/create" 
                className="btn-primary text-lg px-8 py-4"
                onClick={() => handleQuickActionClick('empty_state_start')}
              >
                <Search size={24} className="mr-2" />
                ビール発見を開始
              </Link>
              <Link 
                href="/import" 
                className="btn-secondary text-lg px-8 py-4"
                onClick={() => handleQuickActionClick('empty_state_import')}
              >
                <Upload size={24} className="mr-2" />
                履歴をインポート
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}