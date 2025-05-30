'use client';

import { useState } from 'react';
import Link from 'next/link';
import { storageService } from '@/services/storage';

export default function SettingsPage() {
  const [isClearing, setIsClearing] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);

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
      const [userProfile, sessions, beers, appSettings] = await Promise.all([
        storageService.getUserProfile(),
        storageService.getSessions(),
        storageService.getBeerHistory(),
        storageService.getAppSettings(),
      ]);

      const exportData = {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        userProfile,
        sessions,
        beers,
        appSettings,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link 
            href="/home" 
            className="inline-flex items-center text-amber-700 hover:text-amber-900 mb-4"
          >
            ← ホームに戻る
          </Link>
          <h1 className="text-3xl font-bold text-amber-900 mb-2">設定</h1>
          <p className="text-amber-700">
            アプリの設定とデータ管理
          </p>
        </div>

        <div className="space-y-6">
          {/* App Info */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-amber-200">
            <h2 className="text-xl font-semibold text-amber-900 mb-4">アプリ情報</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-amber-700">アプリ名</span>
                <span className="font-medium">NextPint</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-700">バージョン</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-700">プラットフォーム</span>
                <span className="font-medium">Web版</span>
              </div>
            </div>
          </div>

          {/* Privacy & Data */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-amber-200">
            <h2 className="text-xl font-semibold text-amber-900 mb-4">プライバシー・データ</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🔒</span>
                </div>
                <div>
                  <h3 className="font-medium text-amber-900">ローカルストレージ</h3>
                  <p className="text-sm text-amber-600">
                    すべてのデータはお使いのデバイス内に保存されます
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🚫</span>
                </div>
                <div>
                  <h3 className="font-medium text-amber-900">外部送信なし</h3>
                  <p className="text-sm text-amber-600">
                    個人データは外部サーバーに送信されません
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-amber-200">
            <h2 className="text-xl font-semibold text-amber-900 mb-4">データ管理</h2>
            <div className="space-y-4">
              <button
                onClick={handleExportData}
                className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
              >
                <span>📥</span>
                <span>データをエクスポート</span>
              </button>
              
              <div className="border-t border-amber-100 pt-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <h3 className="font-medium text-red-900 mb-2">⚠️ 危険な操作</h3>
                  <p className="text-sm text-red-700">
                    以下の操作を実行すると、すべてのデータが削除されます。この操作は取り消せません。
                  </p>
                </div>
                
                <button
                  onClick={handleClearData}
                  disabled={isClearing}
                  className="w-full px-4 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isClearing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>削除中...</span>
                    </>
                  ) : clearSuccess ? (
                    <>
                      <span>✓</span>
                      <span>削除完了</span>
                    </>
                  ) : (
                    <>
                      <span>🗑️</span>
                      <span>すべてのデータを削除</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* API Information */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-amber-200">
            <h2 className="text-xl font-semibold text-amber-900 mb-4">API情報</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-amber-700">API エンドポイント</span>
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                  nextpint-api.riho-dare.workers.dev
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-700">プロンプトテンプレート</span>
                <span className="text-green-600 font-medium">利用可能</span>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-amber-200">
            <h2 className="text-xl font-semibold text-amber-900 mb-4">NextPint について</h2>
            <p className="text-amber-700 leading-relaxed mb-4">
              NextPint は AI を活用したビール発見プロンプト提供アプリです。
              あなたの好みや場面に最適なビールを見つけるためのプロンプトを生成し、
              AI チャットボットでの検索をサポートします。
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm rounded-full">
                プライバシー重視
              </span>
              <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm rounded-full">
                オープンソース
              </span>
              <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm rounded-full">
                無料
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}