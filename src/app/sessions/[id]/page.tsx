'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft,
  Target, 
  Heart, 
  MapPin, 
  DollarSign, 
  Clock,
  Copy,
  Check,
  Edit3,
  Trash2,
  MoreVertical,
  Sparkles,
  RefreshCw,
  Share2
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import { ServiceFactory } from '@/application/factories/ServiceFactory';

interface SessionData {
  id: string;
  sessionId: string;
  userId?: string;
  createdAt: string;
  updatedAt?: string;
  profile: {
    sessionGoal: string;
    mood: string;
    tastePreference: {
      primary: string;
      avoid: string[];
    };
    constraints: {
      location?: string;
      budget?: string;
      other?: string[];
    };
    searchKeywords: string[];
  };
  generatedPrompts: string[];
  results?: any;
  status: string;
  notes?: string;
}

export default function SessionDetailPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [activePromptIndex, setActivePromptIndex] = useState(0);

  useEffect(() => {
    loadSession();
    // Track page view
    ServiceFactory.getAnalyticsService().trackEvent('page_view', { 
      page: 'session_detail',
      sessionId 
    });
  }, [sessionId]);

  const loadSession = async () => {
    try {
      const storageService = ServiceFactory.getStorageService();
      const sessions = await storageService.getSessions();
      const foundSession = sessions.find(s => s.id === sessionId || s.sessionId === sessionId);
      
      if (foundSession) {
        setSession(foundSession);
      } else {
        router.push('/sessions');
      }
    } catch (error) {
      console.error('Error loading session:', error);
      router.push('/sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      ServiceFactory.getAnalyticsService().trackEvent('prompt_copied', { sessionId });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const regeneratePrompt = async () => {
    if (!session) return;

    setIsRegenerating(true);
    
    try {
      ServiceFactory.getAnalyticsService().trackEvent('prompt_regenerate_start', { sessionId });

      const promptService = ServiceFactory.getPromptService();
      const newPrompt = await promptService.generateSessionPrompt(session.profile);
      
      const updatedSession = {
        ...session,
        generatedPrompts: [...session.generatedPrompts, newPrompt],
        updatedAt: new Date().toISOString()
      };

      // Update in storage
      const storageService = ServiceFactory.getStorageService();
      const sessions = await storageService.getSessions();
      const updatedSessions = sessions.map(s => 
        s.id === sessionId ? updatedSession : s
      );
      await storageService.saveSessions(updatedSessions);

      setSession(updatedSession);
      setActivePromptIndex(updatedSession.generatedPrompts.length - 1);

      ServiceFactory.getAnalyticsService().trackEvent('prompt_regenerated', { 
        sessionId,
        promptCount: updatedSession.generatedPrompts.length
      });
    } catch (error) {
      console.error('Error regenerating prompt:', error);
      ServiceFactory.getAnalyticsService().trackEvent('prompt_regenerate_error', { 
        sessionId, 
        error: error instanceof Error ? error.message : String(error)
      });
      alert('プロンプト再生成中にエラーが発生しました');
    } finally {
      setIsRegenerating(false);
    }
  };

  const deleteSession = async () => {
    if (!session || !confirm('このセッションを削除しますか？この操作は取り消せません。')) {
      return;
    }

    try {
      ServiceFactory.getAnalyticsService().trackEvent('session_delete', { sessionId });

      const storageService = ServiceFactory.getStorageService();
      const sessions = await storageService.getSessions();
      const filteredSessions = sessions.filter(s => s.id !== sessionId);
      await storageService.saveSessions(filteredSessions);

      router.push('/sessions');
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('セッション削除中にエラーが発生しました');
    }
  };

  const shareSession = async () => {
    if (!session) return;

    const shareData = {
      title: `NextPint: ${session.profile.sessionGoal}`,
      text: `ビール発見セッション: ${session.profile.sessionGoal}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        ServiceFactory.getAnalyticsService().trackEvent('session_shared', { sessionId, method: 'native' });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('URLをクリップボードにコピーしました');
        ServiceFactory.getAnalyticsService().trackEvent('session_shared', { sessionId, method: 'clipboard' });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const getMoodEmoji = (mood: string) => {
    const moodMap: Record<string, string> = {
      adventurous: '🚀',
      relaxed: '😌',
      celebratory: '🎉',
      contemplative: '🤔',
      social: '👥',
      nostalgic: '💭'
    };
    return moodMap[mood] || '🍺';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'completed': return 'bg-blue-500/20 text-blue-400';
      case 'archived': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'アクティブ';
      case 'completed': return '完了';
      case 'archived': return 'アーカイブ';
      default: return '不明';
    }
  };

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

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-dark">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-bold mb-2">セッションが見つかりません</h2>
            <p className="text-text-secondary mb-6">指定されたセッションは存在しないか削除されています</p>
            <button onClick={() => router.push('/sessions')} className="btn-primary">
              セッション一覧に戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Navigation />
      
      <main className="mobile-container mobile-section pb-24 lg:pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/sessions')}
              className="btn-secondary-small"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold">セッション詳細</h1>
              <p className="text-text-secondary">
                {new Date(session.createdAt).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="btn-secondary-small"
            >
              <MoreVertical size={20} />
            </button>
            
            {showMenu && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-background-secondary border border-gray-700 rounded-lg shadow-xl z-10">
                <button
                  onClick={() => {
                    shareSession();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-background-tertiary transition-colors"
                >
                  <Share2 size={16} />
                  共有
                </button>
                <button
                  onClick={() => {
                    router.push(`/sessions/${sessionId}/edit`);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-background-tertiary transition-colors"
                >
                  <Edit3 size={16} />
                  編集
                </button>
                <button
                  onClick={() => {
                    deleteSession();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={16} />
                  削除
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Session Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Goal & Status */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
                  <Target size={24} className="text-primary-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">セッション目標</h3>
                  <p className="text-text-secondary">{session.profile.sessionGoal}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(session.status)}`}>
                  {getStatusLabel(session.status)}
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Heart size={20} className="text-primary-400" />
                味の好み
              </h3>
              
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-text-secondary">気分: </span>
                  <span className="inline-flex items-center gap-2">
                    {getMoodEmoji(session.profile.mood)}
                    {session.profile.mood}
                  </span>
                </div>
                
                <div>
                  <span className="text-sm text-text-secondary">好みの味わい: </span>
                  <span className="font-medium">{session.profile.tastePreference.primary}</span>
                </div>
                
                {session.profile.tastePreference.avoid.length > 0 && (
                  <div>
                    <span className="text-sm text-text-secondary">避けたい味: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {session.profile.tastePreference.avoid.map((taste) => (
                        <span key={taste} className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-sm">
                          {taste}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Constraints */}
            {(session.profile.constraints.location || session.profile.constraints.budget || session.profile.constraints.other?.length) && (
              <div className="glass-card rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-4">制約・条件</h3>
                
                <div className="space-y-3">
                  {session.profile.constraints.location && (
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-text-secondary" />
                      <span>{session.profile.constraints.location}</span>
                    </div>
                  )}
                  
                  {session.profile.constraints.budget && (
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} className="text-text-secondary" />
                      <span>{session.profile.constraints.budget}</span>
                    </div>
                  )}
                  
                  {session.profile.constraints.other?.map((constraint) => (
                    <div key={constraint} className="px-3 py-1 bg-background-secondary rounded text-sm">
                      {constraint}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Keywords */}
            {session.profile.searchKeywords.length > 0 && (
              <div className="glass-card rounded-xl p-6">
                <h3 className="font-semibold mb-3">キーワード</h3>
                <div className="flex flex-wrap gap-2">
                  {session.profile.searchKeywords.map((keyword) => (
                    <span key={keyword} className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Session Meta */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold mb-3">セッション情報</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-text-secondary" />
                  <div>
                    <div>作成: {new Date(session.createdAt).toLocaleDateString('ja-JP')}</div>
                    {session.updatedAt && (
                      <div className="text-text-secondary">更新: {new Date(session.updatedAt).toLocaleDateString('ja-JP')}</div>
                    )}
                  </div>
                </div>
                
                <div>
                  <span className="text-text-secondary">プロンプト数: </span>
                  <span className="font-medium">{session.generatedPrompts.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Generated Prompts */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-xl flex items-center gap-2">
              <Sparkles size={24} className="text-primary-400" />
              生成されたプロンプト
            </h3>
            <button
              onClick={regeneratePrompt}
              disabled={isRegenerating}
              className="btn-secondary flex items-center gap-2"
            >
              <RefreshCw size={16} className={isRegenerating ? 'animate-spin' : ''} />
              {isRegenerating ? '生成中...' : '再生成'}
            </button>
          </div>

          {/* Prompt Tabs */}
          {session.generatedPrompts.length > 1 && (
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {session.generatedPrompts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActivePromptIndex(index)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap
                    ${activePromptIndex === index
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'bg-background-secondary text-text-secondary hover:text-text-primary'
                    }
                  `}
                >
                  プロンプト {index + 1}
                  {index === session.generatedPrompts.length - 1 && (
                    <span className="ml-1 text-xs">(最新)</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Active Prompt */}
          <div className="bg-background-secondary rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-text-secondary">
                プロンプト {activePromptIndex + 1} / {session.generatedPrompts.length}
              </span>
              <button
                onClick={() => copyToClipboard(session.generatedPrompts[activePromptIndex])}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                  ${isCopied 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-primary-500/20 text-primary-400 hover:bg-primary-500/30'
                  }
                `}
              >
                {isCopied ? <Check size={16} /> : <Copy size={16} />}
                {isCopied ? 'コピー済み' : 'コピー'}
              </button>
            </div>
            
            <div className="bg-background-primary rounded p-4 text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
              {session.generatedPrompts[activePromptIndex]}
            </div>
          </div>

          {/* Usage Instructions */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-4">
            <h4 className="font-medium text-blue-400 mb-2">💡 使用方法</h4>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>• 上のプロンプトをコピーしてください</li>
              <li>• ChatGPT、Claude、Geminiなどのお好みのAIサービスに貼り付けてください</li>
              <li>• AIからの回答を待って、おすすめビールを楽しんでください！</li>
              <li>• より良いプロンプトが必要な場合は「再生成」ボタンをお試しください</li>
            </ul>
          </div>
        </div>

        {/* Notes Section */}
        {session.notes && (
          <div className="glass-card rounded-xl p-6 mt-6">
            <h3 className="font-semibold mb-3">メモ</h3>
            <p className="text-text-secondary whitespace-pre-wrap">{session.notes}</p>
          </div>
        )}
      </main>

      {/* Click outside to close menu */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}