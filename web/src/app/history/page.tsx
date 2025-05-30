'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { storageService } from '@/services/storage';
import { BeerSearchSession, ImportedBeer } from '@/types';

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

  const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-amber-800">履歴を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link 
            href="/home" 
            className="inline-flex items-center text-amber-700 hover:text-amber-900 mb-4"
          >
            ← ホームに戻る
          </Link>
          <h1 className="text-3xl font-bold text-amber-900 mb-2">履歴</h1>
          <p className="text-amber-700">
            過去のセッションとビール履歴を確認できます
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg border border-amber-200 overflow-hidden">
          <div className="flex border-b border-amber-100">
            <button
              onClick={() => setActiveTab('sessions')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'sessions'
                  ? 'bg-amber-500 text-white'
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              🎯 セッション履歴 ({sessions.length})
            </button>
            <button
              onClick={() => setActiveTab('beers')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'beers'
                  ? 'bg-amber-500 text-white'
                  : 'text-amber-700 hover:bg-amber-50'
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
                    <h3 className="text-lg font-medium text-amber-900 mb-2">
                      セッション履歴がありません
                    </h3>
                    <p className="text-amber-600 mb-6">
                      新しいセッションを作成してビール検索を始めましょう
                    </p>
                    <Link
                      href="/sessions/create"
                      className="inline-block px-6 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
                    >
                      新しいセッション
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessions.map((session) => (
                      <div
                        key={session.sessionId}
                        className="border border-amber-100 rounded-lg p-4 hover:bg-amber-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-amber-900 mb-1">
                              {session.name || session.profile.sessionGoal}
                            </h3>
                            <p className="text-sm text-amber-600 mb-2">
                              {session.profile.sessionGoal}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-amber-500">
                              <span>{formatDate(session.createdAt)}</span>
                              <span className={`px-2 py-1 rounded-full ${
                                session.status === 'completed' 
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {session.status === 'completed' ? '完了' : 'アクティブ'}
                              </span>
                            </div>
                          </div>
                          <Link
                            href="/sessions/session-detail"
                            className="px-3 py-1 text-sm bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition-colors"
                          >
                            詳細
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
                    <h3 className="text-lg font-medium text-amber-900 mb-2">
                      ビール履歴がありません
                    </h3>
                    <p className="text-amber-600 mb-6">
                      ビール情報をインポートすると、ここに履歴が表示されます
                    </p>
                    <button
                      className="inline-block px-6 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
                      onClick={() => alert('インポート機能は今後実装予定です')}
                    >
                      ビールをインポート
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {beers.map((beer) => (
                      <div
                        key={beer.id}
                        className="border border-amber-100 rounded-lg p-4 hover:bg-amber-50 transition-colors"
                      >
                        <h3 className="font-medium text-amber-900 mb-1">
                          {beer.name}
                        </h3>
                        <p className="text-sm text-amber-600 mb-2">
                          {beer.brewery}
                        </p>
                        <div className="flex items-center justify-between text-xs text-amber-500">
                          <span>{beer.style}</span>
                          <span>⭐ {beer.rating}</span>
                        </div>
                        {beer.checkinDate && (
                          <p className="text-xs text-amber-400 mt-1">
                            {formatDate(beer.checkinDate)}
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
      </div>
    </div>
  );
}