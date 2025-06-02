'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { 
  Plus,
  Search,
  Filter,
  Target,
  Clock,
  ChevronRight,
  Calendar,
  MoreVertical,
  Edit3,
  Trash2,
  Archive,
  CheckCircle,
  Circle,
  ArrowUpDown
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

type SortBy = 'newest' | 'oldest' | 'name' | 'status';
type FilterBy = 'all' | 'active' | 'completed' | 'archived';

export default function SessionsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    loadSessions();
    // Track page view
    ServiceFactory.getAnalyticsService().trackEvent('page_view', { page: 'sessions_list' });
  }, []);

  const loadSessions = async () => {
    try {
      const storageService = ServiceFactory.getStorageService();
      const sessionsData = await storageService.getSessions();
      setSessions(sessionsData);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAndSortedSessions = sessions
    .filter(session => {
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          session.profile.sessionGoal.toLowerCase().includes(searchLower) ||
          session.profile.mood.toLowerCase().includes(searchLower) ||
          session.profile.searchKeywords.some(k => k.toLowerCase().includes(searchLower))
        );
      }
      return true;
    })
    .filter(session => {
      // Filter by status
      if (filterBy === 'all') return true;
      return session.status === filterBy;
    })
    .sort((a, b) => {
      // Sort sessions
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'name':
          return a.profile.sessionGoal.localeCompare(b.profile.sessionGoal);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const handleSessionClick = (sessionId: string) => {
    ServiceFactory.getAnalyticsService().trackEvent('session_click', { sessionId });
    router.push(`/sessions/${sessionId}`);
  };

  const handleCreateSession = () => {
    ServiceFactory.getAnalyticsService().trackEvent('session_create_click', { source: 'sessions_page' });
    router.push('/sessions/create');
  };

  const updateSessionStatus = async (sessionId: string, newStatus: string) => {
    try {
      const storageService = ServiceFactory.getStorageService();
      const updatedSessions = sessions.map(session => 
        session.id === sessionId 
          ? { ...session, status: newStatus, updatedAt: new Date().toISOString() }
          : session
      );
      
      await storageService.saveSessions(updatedSessions);
      setSessions(updatedSessions);

      ServiceFactory.getAnalyticsService().trackEvent('session_status_updated', { 
        sessionId, 
        newStatus,
        oldStatus: sessions.find(s => s.id === sessionId)?.status
      });
    } catch (error) {
      console.error('Error updating session status:', error);
      alert('セッションステータスの更新に失敗しました');
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!confirm('このセッションを削除しますか？この操作は取り消せません。')) {
      return;
    }

    try {
      const storageService = ServiceFactory.getStorageService();
      const filteredSessions = sessions.filter(s => s.id !== sessionId);
      await storageService.saveSessions(filteredSessions);
      setSessions(filteredSessions);

      ServiceFactory.getAnalyticsService().trackEvent('session_deleted', { sessionId });
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('セッション削除に失敗しました');
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedSessions.length === 0) return;

    try {
      const storageService = ServiceFactory.getStorageService();
      let updatedSessions = sessions;

      switch (action) {
        case 'archive':
          updatedSessions = sessions.map(session => 
            selectedSessions.includes(session.id)
              ? { ...session, status: 'archived', updatedAt: new Date().toISOString() }
              : session
          );
          break;
        case 'complete':
          updatedSessions = sessions.map(session => 
            selectedSessions.includes(session.id)
              ? { ...session, status: 'completed', updatedAt: new Date().toISOString() }
              : session
          );
          break;
        case 'delete':
          if (confirm(`${selectedSessions.length}個のセッションを削除しますか？`)) {
            updatedSessions = sessions.filter(s => !selectedSessions.includes(s.id));
          } else {
            return;
          }
          break;
      }

      await storageService.saveSessions(updatedSessions);
      setSessions(updatedSessions);
      setSelectedSessions([]);
      setShowBulkActions(false);

      ServiceFactory.getAnalyticsService().trackEvent('bulk_action', { 
        action, 
        sessionCount: selectedSessions.length 
      });
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('一括操作に失敗しました');
    }
  };

  const toggleSessionSelection = (sessionId: string) => {
    setSelectedSessions(prev => 
      prev.includes(sessionId)
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
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

  const getStatusCounts = () => {
    return {
      all: sessions.length,
      active: sessions.filter(s => s.status === 'active').length,
      completed: sessions.filter(s => s.status === 'completed').length,
      archived: sessions.filter(s => s.status === 'archived').length
    };
  };

  const statusCounts = getStatusCounts();

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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">ビール発見セッション</h1>
            <p className="text-text-secondary">
              {sessions.length > 0 
                ? `${sessions.length}個のセッション`
                : 'セッションがありません'
              }
            </p>
          </div>
          
          <button
            onClick={handleCreateSession}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            新しいセッション
          </button>
        </div>

        {/* Filters and Search */}
        <div className="glass-card rounded-xl p-4 mb-6">
          {/* Search Bar */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="セッションを検索..."
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-background-secondary border border-gray-700 focus:border-primary-500 focus:outline-none"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary flex items-center gap-2 ${showFilters ? 'bg-primary-500/20 text-primary-400' : ''}`}
            >
              <Filter size={20} />
              フィルター
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="border-t border-gray-700 pt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">ステータス</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'all', label: `すべて (${statusCounts.all})` },
                    { value: 'active', label: `アクティブ (${statusCounts.active})` },
                    { value: 'completed', label: `完了 (${statusCounts.completed})` },
                    { value: 'archived', label: `アーカイブ (${statusCounts.archived})` }
                  ].map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => setFilterBy(filter.value as FilterBy)}
                      className={`
                        px-3 py-2 rounded-lg text-sm transition-all
                        ${filterBy === filter.value
                          ? 'bg-primary-500/20 text-primary-400'
                          : 'bg-background-secondary text-text-secondary hover:text-text-primary'
                        }
                      `}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">並び順</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'newest', label: '新しい順' },
                    { value: 'oldest', label: '古い順' },
                    { value: 'name', label: '名前順' },
                    { value: 'status', label: 'ステータス順' }
                  ].map((sort) => (
                    <button
                      key={sort.value}
                      onClick={() => setSortBy(sort.value as SortBy)}
                      className={`
                        px-3 py-2 rounded-lg text-sm flex items-center gap-1 transition-all
                        ${sortBy === sort.value
                          ? 'bg-primary-500/20 text-primary-400'
                          : 'bg-background-secondary text-text-secondary hover:text-text-primary'
                        }
                      `}
                    >
                      <ArrowUpDown size={14} />
                      {sort.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedSessions.length > 0 && (
          <div className="glass-card rounded-xl p-4 mb-6 border-primary-500/20">
            <div className="flex items-center justify-between">
              <span className="text-primary-400 font-medium">
                {selectedSessions.length}個のセッションを選択中
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('complete')}
                  className="btn-secondary-small"
                >
                  <CheckCircle size={16} />
                  完了にする
                </button>
                <button
                  onClick={() => handleBulkAction('archive')}
                  className="btn-secondary-small"
                >
                  <Archive size={16} />
                  アーカイブ
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="btn-secondary-small text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 size={16} />
                  削除
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sessions List */}
        {filteredAndSortedSessions.length === 0 ? (
          <div className="text-center py-16">
            {searchTerm || filterBy !== 'all' ? (
              <>
                <div className="text-5xl mb-6 opacity-50">🔍</div>
                <h3 className="text-xl font-semibold mb-3">
                  条件に一致するセッションが見つかりません
                </h3>
                <p className="text-text-secondary mb-6">
                  検索条件やフィルターを変更してみてください
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterBy('all');
                  }}
                  className="btn-secondary"
                >
                  条件をクリア
                </button>
              </>
            ) : (
              <>
                <div className="text-5xl mb-6 opacity-50">🎯</div>
                <h3 className="text-xl font-semibold mb-3">
                  最初のビール発見セッションを作成しましょう
                </h3>
                <p className="text-text-secondary mb-6">
                  AIを使ってあなたにぴったりのビールを見つけてみませんか？
                </p>
                <button onClick={handleCreateSession} className="btn-primary">
                  <Plus size={20} className="mr-2" />
                  セッション作成
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedSessions.map((session) => (
              <div
                key={session.id}
                className="glass-card rounded-xl p-4 sm:p-6 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Selection Checkbox */}
                  <button
                    onClick={() => toggleSessionSelection(session.id)}
                    className={`
                      mt-1 p-1 rounded transition-colors
                      ${selectedSessions.includes(session.id)
                        ? 'text-primary-400'
                        : 'text-text-tertiary hover:text-text-secondary'
                      }
                    `}
                  >
                    {selectedSessions.includes(session.id) ? (
                      <CheckCircle size={20} />
                    ) : (
                      <Circle size={20} />
                    )}
                  </button>

                  {/* Session Icon */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target size={20} className="text-primary-400" />
                  </div>
                  
                  {/* Session Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <button
                        onClick={() => handleSessionClick(session.id)}
                        className="text-left group flex-1"
                      >
                        <h3 className="font-semibold text-base sm:text-lg line-clamp-2 group-hover:text-primary-400 transition-colors">
                          {session.profile.sessionGoal}
                        </h3>
                      </button>
                      
                      <div className="flex items-center gap-2 ml-2">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                          {getStatusLabel(session.status)}
                        </div>
                        
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Toggle menu for this session
                            }}
                            className="p-1 text-text-tertiary hover:text-text-primary transition-colors"
                          >
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-text-secondary mb-3">
                      <div className="flex items-center gap-1">
                        <span>{getMoodEmoji(session.profile.mood)}</span>
                        <span>{session.profile.mood}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{new Date(session.createdAt).toLocaleDateString('ja-JP')}</span>
                      </div>
                      
                      <span className="text-text-tertiary">
                        プロンプト: {session.generatedPrompts.length}個
                      </span>
                    </div>
                    
                    {session.profile.searchKeywords.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {session.profile.searchKeywords.slice(0, 3).map((keyword, i) => (
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
                  
                  <button
                    onClick={() => handleSessionClick(session.id)}
                    className="mt-1 text-text-tertiary hover:text-text-primary transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}