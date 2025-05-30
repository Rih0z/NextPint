'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiService } from '@/services/api';
import { PromptTemplate } from '@/types';

export default function HomePage() {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await apiService.getTemplates({ locale: 'ja-JP' });
        setTemplates(response.data.templates);
      } catch (err) {
        setError('プロンプトテンプレートの読み込みに失敗しました');
        console.error('Error loading templates:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, []);

  const categoryIcons: Record<string, string> = {
    search: '🔍',
    analysis: '📊',
    import: '📥',
    export: '📤',
  };

  const getCategoryName = (category: string): string => {
    const names: Record<string, string> = {
      search: '検索',
      analysis: '分析',
      import: 'インポート',
      export: 'エクスポート',
    };
    return names[category] || category;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-amber-800">プロンプトを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-2">
            🍺 NextPint
          </h1>
          <p className="text-amber-700 text-lg">
            AI ビール発見プロンプト提供サービス
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/sessions/create"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-amber-200"
          >
            <div className="text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-xl font-semibold text-amber-900 mb-2">
                新しいセッション
              </h3>
              <p className="text-amber-600">
                目的に応じたビール検索を開始
              </p>
            </div>
          </Link>

          <Link
            href="/history"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-amber-200"
          >
            <div className="text-center">
              <div className="text-4xl mb-3">📖</div>
              <h3 className="text-xl font-semibold text-amber-900 mb-2">
                履歴
              </h3>
              <p className="text-amber-600">
                過去のセッションを確認
              </p>
            </div>
          </Link>

          <Link
            href="/settings"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-amber-200"
          >
            <div className="text-center">
              <div className="text-4xl mb-3">⚙️</div>
              <h3 className="text-xl font-semibold text-amber-900 mb-2">
                設定
              </h3>
              <p className="text-amber-600">
                アプリの設定を変更
              </p>
            </div>
          </Link>
        </div>

        {/* Available Templates */}
        <div className="bg-white rounded-xl shadow-lg border border-amber-200">
          <div className="p-6 border-b border-amber-100">
            <h2 className="text-2xl font-semibold text-amber-900">
              利用可能なプロンプトテンプレート
            </h2>
          </div>

          {error ? (
            <div className="p-6 text-center">
              <div className="text-red-500 mb-4">
                <div className="text-4xl mb-2">⚠️</div>
                <p>{error}</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
              >
                再試行
              </button>
            </div>
          ) : templates.length === 0 ? (
            <div className="p-6 text-center text-amber-600">
              <div className="text-4xl mb-2">📝</div>
              <p>プロンプトテンプレートがありません</p>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="border border-amber-100 rounded-lg p-4 hover:bg-amber-50 transition-colors"
                >
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">
                      {categoryIcons[template.category] || '📄'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-amber-900">
                          {template.name}
                        </h3>
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                          {getCategoryName(template.category)}
                        </span>
                      </div>
                      <p className="text-amber-600 mb-3">
                        {template.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-amber-500">
                        <span>バージョン: {template.version}</span>
                        <span>変数: {template.variables.length}個</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}