'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, ExternalLink, Star, Calendar } from 'lucide-react';
import { storageService } from '@/services/storage';
import { BeerSearchSession, ImportedBeer } from '@/types/simple';
import Navigation from '@/components/Navigation';

export default function HistoryPage() {
  const [sessions, setSessions] = useState<BeerSearchSession[]>([]);
  const [beers, setBeers] = useState<ImportedBeer[]>([]);
  const [activeTab, setActiveTab] = useState<'sessions' | 'beers'>('sessions');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const [loadedSessions, loadedBeers] = await Promise.all([
          storageService.getSessions(),
          storageService.getBeerHistory(),
        ]);
        setSessions(loadedSessions);
        setBeers(loadedBeers);
      } catch (error) {
        console.error('Error loading history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="spinner mx-auto mb-6"></div>
          <p className="text-lg text-text-secondary">履歴を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gradient">履歴</h1>
          <p className="text-text-secondary">
            過去のセッションとビール履歴を確認できます
          </p>
        </div>

        {/* Tabs */}
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="flex border-b border-gray-800">
            <button
              onClick={() => setActiveTab('sessions')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'sessions'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              🎯 セッション履歴 ({sessions.length})
            </button>
            <button
              onClick={() => setActiveTab('beers')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'beers'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              🍺 ビール履歴 ({beers.length})
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'sessions' ? (
              <div>
                {sessions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">📝</div>
                    <h3 className="text-lg font-medium text-white mb-2">
                      セッション履歴がありません
                    </h3>
                    <p className="text-text-secondary mb-6">
                      新しいセッションを作成してビール検索を始めましょう
                    </p>
                    <Link
                      href="/sessions/create"
                      className="btn-primary"
                    >
                      新しいセッション
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessions.map((session) => (
                      <div
                        key={session.sessionId}
                        className="bg-background-secondary border border-gray-700 rounded-lg p-4 hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-white mb-1">
                              {session.profile.sessionGoal}
                            </h3>
                            <p className="text-sm text-text-secondary mb-2">
                              気分: {session.profile.mood === 'adventurous' ? '冒険的' : session.profile.mood === 'stable' ? '安定志向' : 'リラックス'} | 
                              味: {session.profile.tastePreference.primary === 'hoppy' ? 'ホッピー' : session.profile.tastePreference.primary === 'malty' ? 'モルティ' : 'バランス'}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-text-tertiary">
                              <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {formatDate(session.createdAt)}
                              </span>
                              {session.results?.copiedAt && (
                                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                                  コピー済み
                                </span>
                              )}
                            </div>
                          </div>
                          <Link
                            href={`/sessions/session-detail?id=${session.sessionId}`}
                            className="px-3 py-1 text-sm bg-primary-500/20 text-primary-400 rounded hover:bg-primary-500/30 transition-colors flex items-center gap-1"
                          >
                            詳細
                            <ExternalLink size={12} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                {beers.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">🍺</div>
                    <h3 className="text-lg font-medium text-white mb-2">
                      ビール履歴がありません
                    </h3>
                    <p className="text-text-secondary mb-6">
                      ビール情報をインポートすると、ここに履歴が表示されます
                    </p>
                    <Link
                      href="/import"
                      className="btn-primary"
                    >
                      ビールをインポート
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {beers.map((beer) => (
                      <div
                        key={beer.id}
                        className="bg-background-secondary border border-gray-700 rounded-lg p-4 hover:bg-gray-800/50 transition-colors"
                      >
                        <h3 className="font-medium text-white mb-1">
                          {beer.name}
                        </h3>
                        <p className="text-sm text-text-secondary mb-2">
                          {beer.brewery}
                        </p>
                        <div className="flex items-center justify-between text-xs text-text-tertiary mb-2">
                          <span className="px-2 py-1 bg-primary-500/20 rounded-full">{beer.style}</span>
                          <span className="flex items-center gap-1">
                            <Star size={12} className="text-yellow-400" />
                            {beer.rating}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-text-tertiary">
                          <span className="px-2 py-1 bg-gray-700 rounded-full">{beer.source}</span>
                          {beer.date && (
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {new Date(beer.date).toLocaleDateString('ja-JP')}
                            </span>
                          )}
                        </div>
                        {beer.notes && (
                          <p className="text-xs text-text-secondary mt-2 line-clamp-2">
                            {beer.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}