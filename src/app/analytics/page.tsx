'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Star,
  Calendar,
  Clock,
  Users,
  Award,
  Lightbulb,
  RefreshCw,
  Download,
  Share2,
  Eye,
  Coffee,
  MapPin
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import { ServiceFactory } from '@/application/factories/ServiceFactory';
import { UserInsights } from '@/services/analytics/AnalyticsService';

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const [insights, setInsights] = useState<UserInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');

  useEffect(() => {
    loadInsights();
    // Track page view
    ServiceFactory.getAnalyticsService().trackEvent('page_view', { page: 'analytics' });
  }, []);

  const loadInsights = async () => {
    try {
      const analyticsService = ServiceFactory.getAnalyticsService();
      const insightsData = await analyticsService.getInsights();
      setInsights(insightsData);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshInsights = async () => {
    setIsRefreshing(true);
    await loadInsights();
    setIsRefreshing(false);
    
    ServiceFactory.getAnalyticsService().trackEvent('analytics_refresh');
  };

  const exportData = () => {
    try {
      const analyticsService = ServiceFactory.getAnalyticsService();
      const data = analyticsService.exportData();
      
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nextpint-analytics-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      ServiceFactory.getAnalyticsService().trackEvent('analytics_export');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('データのエクスポートに失敗しました');
    }
  };

  const shareInsights = async () => {
    if (!insights) return;

    const shareText = `NextPint Analytics 📊

🍺 ビール数: ${insights.totalBeers}
🎯 セッション数: ${insights.totalSessions}
📈 パーソナリティ: ${insights.recommendations.personalityType}

#NextPint #ビール発見 #AI`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'NextPint Analytics',
          text: shareText,
          url: window.location.href
        });
        ServiceFactory.getAnalyticsService().trackEvent('analytics_shared', { method: 'native' });
      } else {
        await navigator.clipboard.writeText(shareText);
        alert('統計情報をクリップボードにコピーしました');
        ServiceFactory.getAnalyticsService().trackEvent('analytics_shared', { method: 'clipboard' });
      }
    } catch (error) {
      console.error('Error sharing insights:', error);
    }
  };

  const getPersonalityColor = (personalityType: string) => {
    if (personalityType.includes('Explorer')) return 'text-green-400 bg-green-500/20';
    if (personalityType.includes('Balanced')) return 'text-blue-400 bg-blue-500/20';
    if (personalityType.includes('Loyalist')) return 'text-purple-400 bg-purple-500/20';
    return 'text-primary-400 bg-primary-500/20';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getSeasonEmoji = (season: string) => {
    const seasonMap: Record<string, string> = {
      Spring: '🌸',
      Summer: '☀️',
      Fall: '🍂',
      Winter: '❄️'
    };
    return seasonMap[season] || '🍺';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-dark">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center animate-fade-in">
            <div className="spinner mx-auto mb-6"></div>
            <p className="text-lg text-text-secondary">分析中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!insights || insights.totalBeers === 0) {
    return (
      <div className="min-h-screen bg-gradient-dark">
        <Navigation />
        <main className="mobile-container mobile-section pb-24 lg:pb-8">
          <div className="text-center py-16">
            <div className="text-6xl mb-6">📊</div>
            <h2 className="text-2xl font-bold mb-4">まだ分析データがありません</h2>
            <p className="text-text-secondary mb-8 max-w-md mx-auto">
              ビールを数本追加してセッションを作成すると、あなたの好みの傾向や発見パターンを分析できるようになります。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.href = '/import'}
                className="btn-primary"
              >
                ビール履歴をインポート
              </button>
              <button
                onClick={() => window.location.href = '/sessions/create'}
                className="btn-secondary"
              >
                セッションを作成
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Navigation />
      
      <main className="mobile-container mobile-section pb-24 lg:pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-2">ビール分析ダッシュボード</h1>
            <p className="text-text-secondary">あなたのビール発見パターンと好みの分析</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={refreshInsights}
              disabled={isRefreshing}
              className="btn-secondary flex items-center gap-2"
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              更新
            </button>
            <button
              onClick={shareInsights}
              className="btn-secondary flex items-center gap-2"
            >
              <Share2 size={16} />
              共有
            </button>
            <button
              onClick={exportData}
              className="btn-secondary flex items-center gap-2"
            >
              <Download size={16} />
              エクスポート
            </button>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-card rounded-xl p-4 sm:p-6 text-center">
            <div className="text-3xl sm:text-4xl font-bold text-primary-400 mb-2">
              {insights.totalBeers}
            </div>
            <div className="text-sm text-text-secondary">
              試したビール数
            </div>
          </div>
          
          <div className="glass-card rounded-xl p-4 sm:p-6 text-center">
            <div className="text-3xl sm:text-4xl font-bold text-secondary-400 mb-2">
              {insights.totalSessions}
            </div>
            <div className="text-sm text-text-secondary">
              発見セッション数
            </div>
          </div>
          
          <div className="glass-card rounded-xl p-4 sm:p-6 text-center">
            <div className={`text-3xl sm:text-4xl font-bold mb-2 ${getScoreColor(insights.discoveryMetrics.adventurousnessScore)}`}>
              {insights.discoveryMetrics.adventurousnessScore}
            </div>
            <div className="text-sm text-text-secondary">
              冒険度スコア
            </div>
          </div>
          
          <div className="glass-card rounded-xl p-4 sm:p-6 text-center">
            <div className="text-3xl sm:text-4xl font-bold text-green-400 mb-2">
              {insights.discoveryMetrics.newStylesThisMonth}
            </div>
            <div className="text-sm text-text-secondary">
              今月の新スタイル
            </div>
          </div>
        </div>

        {/* Personality & Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Personality Type */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Users size={24} className="text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold text-xl">あなたのビア・パーソナリティ</h3>
                <p className="text-text-secondary text-sm">飲酒パターンから判定</p>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${getPersonalityColor(insights.recommendations.personalityType)} mb-4`}>
              <div className="font-semibold text-lg mb-2">
                {insights.recommendations.personalityType}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">冒険度</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-background-secondary rounded-full">
                    <div 
                      className={`h-2 rounded-full ${getScoreColor(insights.discoveryMetrics.adventurousnessScore)} bg-current`}
                      style={{ width: `${insights.discoveryMetrics.adventurousnessScore}%` }}
                    />
                  </div>
                  <span className={`text-sm font-medium ${getScoreColor(insights.discoveryMetrics.adventurousnessScore)}`}>
                    {insights.discoveryMetrics.adventurousnessScore}%
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">一貫性</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-background-secondary rounded-full">
                    <div 
                      className={`h-2 rounded-full ${getScoreColor(insights.discoveryMetrics.consistencyScore)} bg-current`}
                      style={{ width: `${insights.discoveryMetrics.consistencyScore}%` }}
                    />
                  </div>
                  <span className={`text-sm font-medium ${getScoreColor(insights.discoveryMetrics.consistencyScore)}`}>
                    {insights.discoveryMetrics.consistencyScore}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Lightbulb size={24} className="text-yellow-400" />
              </div>
              <div>
                <h3 className="font-bold text-xl">おすすめ発見</h3>
                <p className="text-text-secondary text-sm">次に試すべきもの</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">次に試すべきスタイル</h4>
                <div className="flex flex-wrap gap-2">
                  {insights.recommendations.nextStyles.map((style) => (
                    <span key={style} className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm">
                      {style}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">探求すべきブルワリー</h4>
                <div className="space-y-2">
                  {insights.recommendations.breweriesToExplore.map((brewery) => (
                    <div key={brewery} className="flex items-center gap-2">
                      <Target size={14} className="text-text-secondary" />
                      <span className="text-sm">{brewery}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences & Patterns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Favorite Styles */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Star size={24} className="text-green-400" />
              </div>
              <div>
                <h3 className="font-bold text-xl">お気に入りスタイル</h3>
                <p className="text-text-secondary text-sm">よく飲むビールタイプ</p>
              </div>
            </div>

            <div className="space-y-3">
              {insights.favoriteStyles.slice(0, 5).map((style, index) => (
                <div key={style} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold
                      ${index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                        index === 1 ? 'bg-gray-400/20 text-gray-400' :
                        index === 2 ? 'bg-orange-500/20 text-orange-400' :
                        'bg-background-secondary text-text-secondary'}`}
                    >
                      #{index + 1}
                    </div>
                    <span>{style}</span>
                  </div>
                  {index === 0 && <Award size={16} className="text-yellow-400" />}
                </div>
              ))}
            </div>
          </div>

          {/* Drinking Patterns */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Calendar size={24} className="text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-xl">飲酒パターン</h3>
                <p className="text-text-secondary text-sm">いつ、どのように飲むか</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={16} className="text-text-secondary" />
                  <span className="text-sm text-text-secondary">最もアクティブな曜日</span>
                </div>
                <div className="text-lg font-semibold">{insights.tastingPatterns.mostActiveDay}</div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={16} className="text-text-secondary" />
                  <span className="text-sm text-text-secondary">よく飲む時間</span>
                </div>
                <div className="text-lg font-semibold">{insights.tastingPatterns.preferredTime}</div>
              </div>

              {Object.keys(insights.tastingPatterns.seasonalTrends).length > 0 && (
                <div>
                  <div className="text-sm text-text-secondary mb-2">季節の傾向</div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(insights.tastingPatterns.seasonalTrends).map(([season, count]) => (
                      <div key={season} className="flex items-center gap-2">
                        <span className="text-lg">{getSeasonEmoji(season)}</span>
                        <span className="text-sm">{season}: {count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Brewery Preferences */}
        {insights.breweryPreferences.length > 0 && (
          <div className="glass-card rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <MapPin size={24} className="text-orange-400" />
              </div>
              <div>
                <h3 className="font-bold text-xl">お気に入りブルワリー</h3>
                <p className="text-text-secondary text-sm">よく選ぶブルワリー</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {insights.breweryPreferences.slice(0, 6).map((brewery, index) => (
                <div key={brewery} className="flex items-center gap-3 p-3 bg-background-secondary rounded-lg">
                  <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold
                    ${index < 3 ? 'bg-primary-500/20 text-primary-400' : 'bg-background-tertiary text-text-secondary'}`}
                  >
                    {index + 1}
                  </div>
                  <span className="text-sm">{brewery}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insights & Tips */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Eye size={24} className="text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-xl">インサイト & ヒント</h3>
              <p className="text-text-secondary text-sm">データから読み取れること</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={16} className="text-green-400" />
                  <span className="font-medium text-green-400">強み</span>
                </div>
                <ul className="text-sm text-text-secondary space-y-1">
                  {insights.discoveryMetrics.adventurousnessScore > 70 && (
                    <li>• 新しいスタイルに積極的に挑戦している</li>
                  )}
                  {insights.discoveryMetrics.newStylesThisMonth > 2 && (
                    <li>• 今月は新しい発見が多い月</li>
                  )}
                  {insights.favoriteStyles.length > 3 && (
                    <li>• 幅広いスタイルを楽しんでいる</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb size={16} className="text-blue-400" />
                  <span className="font-medium text-blue-400">提案</span>
                </div>
                <ul className="text-sm text-text-secondary space-y-1">
                  {insights.discoveryMetrics.adventurousnessScore < 50 && (
                    <li>• 新しいスタイルにもっと挑戦してみては？</li>
                  )}
                  {insights.totalSessions < 5 && (
                    <li>• AIセッションをもっと活用してみましょう</li>
                  )}
                  <li>• 季節に合わせたビール選びを試してみては？</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}