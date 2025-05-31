'use client';

import { useState, useEffect } from 'react';
import { User, Database, Download, Trash2, Shield, Info } from 'lucide-react';
import { storageService } from '@/services/storage';
import type { UserProfile, ImportedBeer, BeerSearchSession } from '@/types/simple';
import Navigation from '@/components/Navigation';

export default function SettingsPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [beerHistory, setBeerHistory] = useState<ImportedBeer[]>([]);
  const [sessions, setSessions] = useState<BeerSearchSession[]>([]);
  const [isClearing, setIsClearing] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profile, beers, sessionData] = await Promise.all([
          storageService.getUserProfile(),
          storageService.getBeerHistory(),
          storageService.getSessions()
        ]);
        setUserProfile(profile);
        setBeerHistory(beers);
        setSessions(sessionData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleClearData = async () => {
    if (!confirm('すべてのデータを削除します。この操作は取り消せません。続行しますか？')) {
      return;
    }

    setIsClearing(true);
    try {
      await storageService.clearAllData();
      setClearSuccess(true);
      setTimeout(() => {
        window.location.href = '/onboarding';
      }, 2000);
    } catch (error) {
      console.error('Error clearing data:', error);
      alert('データの削除に失敗しました');
    } finally {
      setIsClearing(false);
    }
  };

  const handleExportData = async () => {
    try {
      const exportData = {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        userProfile,
        sessions,
        beers: beerHistory,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nextpint-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('データのエクスポートに失敗しました');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="spinner mx-auto mb-6"></div>
          <p className="text-lg text-text-secondary">設定読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gradient">設定</h1>
          <p className="text-text-secondary">
            プロフィールとデータ管理
          </p>
        </div>

        <div className="space-y-8">
          {/* User Profile */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <User size={24} className="text-primary-400" />
              ユーザープロフィール
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-400 mb-2">
                  {userProfile?.totalBeers || 0}
                </div>
                <div className="text-sm text-text-secondary">インポートしたビール</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-400 mb-2">
                  {sessions.length}
                </div>
                <div className="text-sm text-text-secondary">作成したセッション</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-400 mb-2">
                  {userProfile?.favoriteStyles.length || 0}
                </div>
                <div className="text-sm text-text-secondary">好きなスタイル</div>
              </div>
            </div>
            
            {userProfile?.favoriteStyles && userProfile.favoriteStyles.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-text-secondary mb-3">好きなビールスタイル</h3>
                <div className="flex flex-wrap gap-2">
                  {userProfile.favoriteStyles.map((style, i) => (
                    <span key={i} className="px-3 py-1 bg-primary-500/20 rounded-full text-sm">
                      {style}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Data Statistics */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Database size={24} className="text-primary-400" />
              データ統計
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-background-secondary rounded-lg p-4">
                <div className="text-2xl font-bold text-white mb-1">{beerHistory.length}</div>
                <div className="text-sm text-text-secondary">ビール履歴</div>
              </div>
              <div className="bg-background-secondary rounded-lg p-4">
                <div className="text-2xl font-bold text-white mb-1">{sessions.length}</div>
                <div className="text-sm text-text-secondary">セッション</div>
              </div>
              <div className="bg-background-secondary rounded-lg p-4">
                <div className="text-2xl font-bold text-white mb-1">
                  {sessions.filter(s => s.results?.copiedAt).length}
                </div>
                <div className="text-sm text-text-secondary">使用したプロンプト</div>
              </div>
              <div className="bg-background-secondary rounded-lg p-4">
                <div className="text-2xl font-bold text-white mb-1">
                  {new Set(beerHistory.map(b => b.source)).size}
                </div>
                <div className="text-sm text-text-secondary">データソース</div>
              </div>
            </div>
          </div>

          {/* Privacy & Security */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Shield size={24} className="text-primary-400" />
              プライバシー・セキュリティ
            </h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🔒</span>
                </div>
                <div>
                  <h3 className="font-medium text-white">ローカルストレージ</h3>
                  <p className="text-sm text-text-secondary">
                    すべてのデータはお使いのデバイス内に保存されます
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🚫</span>
                </div>
                <div>
                  <h3 className="font-medium text-white">外部送信なし</h3>
                  <p className="text-sm text-text-secondary">
                    個人データは外部サーバーに送信されません
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🛡️</span>
                </div>
                <div>
                  <h3 className="font-medium text-white">AI中立</h3>
                  <p className="text-sm text-text-secondary">
                    特定のAIサービスに依存しない設計
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Database size={24} className="text-primary-400" />
              データ管理
            </h2>
            <div className="space-y-4">
              <button
                onClick={handleExportData}
                className="w-full btn-secondary flex items-center justify-center gap-2"
              >
                <Download size={20} />
                データをエクスポート
              </button>
              
              <div className="border-t border-gray-700 pt-4">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
                  <h3 className="font-medium text-red-400 mb-2 flex items-center gap-2">
                    <span>⚠️</span>
                    危険な操作
                  </h3>
                  <p className="text-sm text-red-300">
                    以下の操作を実行すると、すべてのデータが削除されます。この操作は取り消せません。
                  </p>
                </div>
                
                <button
                  onClick={handleClearData}
                  disabled={isClearing}
                  className="w-full px-4 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isClearing ? (
                    <>
                      <div className="spinner scale-75" />
                      <span>削除中...</span>
                    </>
                  ) : clearSuccess ? (
                    <>
                      <span>✓</span>
                      <span>削除完了</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={20} />
                      <span>すべてのデータを削除</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Info size={24} className="text-primary-400" />
              NextPint について
            </h2>
            <p className="text-text-secondary leading-relaxed mb-6">
              NextPint は AI を活用したビール発見プロンプト提供アプリです。
              あなたの好みや場面に最適なビールを見つけるためのプロンプトを生成し、
              AI チャットボットでの検索をサポートします。
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-background-secondary rounded-lg p-4">
                <h3 className="font-medium text-white mb-2">アプリバージョン</h3>
                <p className="text-text-secondary">1.0.0 (Web版)</p>
              </div>
              <div className="bg-background-secondary rounded-lg p-4">
                <h3 className="font-medium text-white mb-2">最終更新</h3>
                <p className="text-text-secondary">
                  {userProfile?.lastUpdated ? new Date(userProfile.lastUpdated).toLocaleDateString('ja-JP') : '未設定'}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-primary-500/20 text-primary-400 text-sm rounded-full">
                プライバシー重視
              </span>
              <span className="px-3 py-1 bg-primary-500/20 text-primary-400 text-sm rounded-full">
                AI中立
              </span>
              <span className="px-3 py-1 bg-primary-500/20 text-primary-400 text-sm rounded-full">
                無料
              </span>
              <span className="px-3 py-1 bg-primary-500/20 text-primary-400 text-sm rounded-full">
                オープンソース
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}