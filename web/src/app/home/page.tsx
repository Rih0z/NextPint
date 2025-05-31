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
        console.log('Loading templates from API...');
        
        // まずヘルスチェック
        try {
          const health = await apiService.getHealth();
          console.log('API Health Check:', health);
        } catch (healthErr) {
          console.error('API Health Check failed:', healthErr);
        }
        
        const response = await apiService.getTemplates({ locale: 'ja-JP' });
        console.log('Templates loaded:', response);
        setTemplates(response.data.templates);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(`プロンプトテンプレートの読み込みに失敗しました: ${errorMessage}`);
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
      <div className="min-h-screen bg-[var(--color-background-primary)] flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="spinner mx-auto mb-6"></div>
          <p className="text-lg text-[var(--color-text-secondary)]">プロンプトを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background-primary)]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-background-secondary)] via-[var(--color-background-primary)] to-[var(--color-background-primary)]"></div>
        
        {/* Content */}
        <div className="relative container mx-auto px-6 py-16">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-6xl font-bold mb-6">
              <span className="gradient-text">🍺 NextPint</span>
            </h1>
            <p className="text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto leading-relaxed">
              AI を活用したビール発見プロンプト提供サービス
            </p>
            <div className="mt-8 flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-pulse"></div>
              <span className="text-sm text-[var(--color-text-tertiary)]">
                プロンプトテンプレート {templates.length} 件利用可能
              </span>
            </div>
          </div>

          {/* Quick Actions - Netflix Style Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <Link
              href="/import"
              className="card-modern p-8 group hover:scale-105 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-3xl">📥</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[var(--color-primary)] transition-colors">
                  インポート
                </h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  ビール履歴を取り込む
                </p>
              </div>
            </Link>

            <Link
              href="/sessions/create"
              className="card-modern p-8 group hover:scale-105 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[var(--color-primary)] transition-colors">
                  新しいセッション
                </h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  ビール検索を開始
                </p>
              </div>
            </Link>

            <Link
              href="/history"
              className="card-modern p-8 group hover:scale-105 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-[var(--color-info)] to-[var(--color-primary)] rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-3xl">📖</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[var(--color-info)] transition-colors">
                  履歴
                </h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  過去のセッションを確認
                </p>
              </div>
            </Link>

            <Link
              href="/settings"
              className="card-modern p-8 group hover:scale-105 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: '0.4s' }}
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-[var(--color-text-tertiary)] to-[var(--color-text-secondary)] rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-3xl">⚙️</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[var(--color-text-secondary)] transition-colors">
                  設定
                </h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  アプリの設定を変更
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Templates Section */}
      <div className="container mx-auto px-6 pb-16">
        <div className="card-modern overflow-hidden">
          <div className="p-8 border-b border-[var(--color-border)]">
            <h2 className="text-3xl font-bold text-white mb-2">
              利用可能なプロンプトテンプレート
            </h2>
            <p className="text-[var(--color-text-secondary)]">
              AIチャットボットで使用できる高品質なプロンプトテンプレート
            </p>
          </div>

          {error ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-[var(--color-error)] rounded-full flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <p className="text-[var(--color-error)] mb-6 text-lg">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="button-primary"
              >
                再試行
              </button>
            </div>
          ) : templates.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-[var(--color-background-tertiary)] rounded-full flex items-center justify-center">
                <span className="text-4xl">📝</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                プロンプトテンプレートがありません
              </h3>
              <p className="text-[var(--color-text-secondary)]">
                API接続を確認してください
              </p>
            </div>
          ) : (
            <div className="p-8">
              <div className="grid gap-6">
                {templates.map((template, index) => (
                  <div
                    key={template.id}
                    className="bg-[var(--color-background-tertiary)] border border-[var(--color-border)] rounded-xl p-6 hover:bg-[var(--color-border)] transition-all duration-300 group animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start space-x-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">
                          {categoryIcons[template.category] || '📄'}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-xl font-bold text-white group-hover:text-[var(--color-primary)] transition-colors">
                            {template.name}
                          </h3>
                          <span className="px-3 py-1 bg-[var(--color-primary)] text-white text-xs font-medium rounded-full">
                            {getCategoryName(template.category)}
                          </span>
                        </div>
                        
                        <p className="text-[var(--color-text-secondary)] mb-4 leading-relaxed">
                          {template.description}
                        </p>
                        
                        <div className="flex items-center space-x-6 text-sm text-[var(--color-text-tertiary)]">
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-[var(--color-success)] rounded-full"></span>
                            <span>バージョン {template.version}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-[var(--color-info)] rounded-full"></span>
                            <span>変数 {template.variables.length}個</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-[var(--color-warning)] rounded-full"></span>
                            <span>難易度 {template.metadata.difficulty}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}