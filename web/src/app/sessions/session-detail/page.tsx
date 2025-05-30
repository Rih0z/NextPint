'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { apiService } from '@/services/api';
import { PromptTemplate } from '@/types';

export default function SessionDetailPage() {
  const sessionId = 'session-123';
  
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const getBudgetText = useCallback((budget: string): string => {
    const budgetMap: Record<string, string> = {
      low: '〜500円',
      medium: '500〜1000円',
      high: '1000円〜',
      premium: '価格は気にしない',
    };
    return budgetMap[budget] || '指定なし';
  }, []);

  // セッション情報（実際はstorageから取得）
  const sessionData = useMemo(() => ({
    id: sessionId,
    goal: '友人とのパーティー用のビールを探したい',
    location: '東京都内',
    budget: 'medium',
    tastePreferences: 'ホップの効いたIPA、フルーティーな味わい',
    avoidList: '強い苦味',
  }), [sessionId]);

  useEffect(() => {
    const generatePrompt = (template: PromptTemplate) => {
      setIsGenerating(true);
      
      // テンプレート変数を実際の値で置換
      let prompt = template.template;
      
      const variables = {
        session_goal: sessionData.goal,
        location: sessionData.location || '指定なし',
        budget: getBudgetText(sessionData.budget),
        taste_preferences: sessionData.tastePreferences,
        avoid_list: sessionData.avoidList || 'なし',
        user_history_summary: '初回利用のため履歴なし',
      };

      // 変数を置換
      Object.entries(variables).forEach(([key, value]) => {
        prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });

      setGeneratedPrompt(prompt);
      setIsGenerating(false);
    };

    const loadTemplate = async () => {
      try {
        // 基本検索テンプレートを使用
        const response = await apiService.getTemplate('search-basic-v1');
        generatePrompt(response.data.template);
      } catch (err) {
        setError('プロンプトテンプレートの読み込みに失敗しました');
        console.error('Error loading template:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplate();
  }, [sessionId, sessionData, getBudgetText]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-amber-800">プロンプトを生成中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <Link
            href="/home"
            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            ホームに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/home" 
            className="inline-flex items-center text-amber-700 hover:text-amber-900 mb-4"
          >
            ← ホームに戻る
          </Link>
          <h1 className="text-3xl font-bold text-amber-900 mb-2">
            セッション詳細
          </h1>
          <p className="text-amber-700">
            {sessionData.goal}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Session Info */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-amber-200">
            <h2 className="text-xl font-semibold text-amber-900 mb-4">セッション情報</h2>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-amber-800">目的:</span>
                <p className="text-amber-700 mt-1">{sessionData.goal}</p>
              </div>
              <div>
                <span className="font-medium text-amber-800">場所:</span>
                <p className="text-amber-700 mt-1">{sessionData.location || '指定なし'}</p>
              </div>
              <div>
                <span className="font-medium text-amber-800">予算:</span>
                <p className="text-amber-700 mt-1">{getBudgetText(sessionData.budget)}</p>
              </div>
              <div>
                <span className="font-medium text-amber-800">味の好み:</span>
                <p className="text-amber-700 mt-1">{sessionData.tastePreferences}</p>
              </div>
              {sessionData.avoidList && (
                <div>
                  <span className="font-medium text-amber-800">避けたい要素:</span>
                  <p className="text-amber-700 mt-1">{sessionData.avoidList}</p>
                </div>
              )}
            </div>
          </div>

          {/* Generated Prompt */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-amber-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-amber-900">生成されたプロンプト</h2>
              <button
                onClick={copyToClipboard}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  copySuccess
                    ? 'bg-green-500 text-white'
                    : 'bg-amber-500 text-white hover:bg-amber-600'
                }`}
              >
                {copySuccess ? '✓ コピー済み' : '📋 コピー'}
              </button>
            </div>
            
            {isGenerating ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 border">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                  {generatedPrompt}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-amber-200">
          <h2 className="text-xl font-semibold text-amber-900 mb-4">使い方</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="font-medium text-amber-900 mb-2">1. コピー</h3>
              <p className="text-sm text-amber-700">
                上のプロンプトをコピーボタンでクリップボードにコピー
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="font-medium text-amber-900 mb-2">2. AI に質問</h3>
              <p className="text-sm text-amber-700">
                ChatGPT、Claude、Gemini などの AI にプロンプトを入力
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🍺</span>
              </div>
              <h3 className="font-medium text-amber-900 mb-2">3. ビール発見</h3>
              <p className="text-sm text-amber-700">
                AI からの提案を参考にお気に入りのビールを見つけよう
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}