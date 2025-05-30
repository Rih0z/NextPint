'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateSessionPage() {
  const router = useRouter();
  const [sessionGoal, setSessionGoal] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [tastePreferences, setTastePreferences] = useState('');
  const [avoidList, setAvoidList] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // セッション作成のロジック（今後実装）
      console.log('Session created:', {
        sessionGoal,
        location,
        budget,
        tastePreferences,
        avoidList,
      });

      // 仮のセッションIDで次のページに遷移
      router.push('/sessions/session-detail');
    } catch (error) {
      console.error('Error creating session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const budgetOptions = [
    { value: '', label: '選択してください' },
    { value: 'low', label: '〜500円' },
    { value: 'medium', label: '500〜1000円' },
    { value: 'high', label: '1000円〜' },
    { value: 'premium', label: '価格は気にしない' },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-background-primary)]">
      <div className="container mx-auto px-6 py-8 max-w-3xl">
        {/* Header */}
        <div className="mb-12 animate-fade-in">
          <Link 
            href="/home" 
            className="inline-flex items-center text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] mb-6 transition-colors group"
          >
            <span className="mr-2 transform group-hover:-translate-x-1 transition-transform">←</span>
            ホームに戻る
          </Link>
          <h1 className="text-4xl font-bold text-white mb-4">
            新しいセッション
          </h1>
          <p className="text-xl text-[var(--color-text-secondary)] leading-relaxed">
            ビール発見の目的や好みを教えてください
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="card-modern p-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {/* Session Goal */}
            <div className="mb-8">
              <label htmlFor="sessionGoal" className="block text-lg font-semibold text-white mb-4">
                今回の目的 *
              </label>
              <input
                type="text"
                id="sessionGoal"
                value={sessionGoal}
                onChange={(e) => setSessionGoal(e.target.value)}
                placeholder="例: 友人とのパーティー用のビールを探したい"
                className="w-full px-6 py-4 bg-[var(--color-background-tertiary)] border border-[var(--color-border)] rounded-xl text-white placeholder-[var(--color-text-tertiary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20 transition-all"
                required
              />
            </div>

            {/* Location */}
            <div className="mb-8">
              <label htmlFor="location" className="block text-lg font-semibold text-white mb-4">
                場所・地域
              </label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="例: 東京都内、関西地方"
                className="w-full px-6 py-4 bg-[var(--color-background-tertiary)] border border-[var(--color-border)] rounded-xl text-white placeholder-[var(--color-text-tertiary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20 transition-all"
              />
            </div>

            {/* Budget */}
            <div className="mb-8">
              <label htmlFor="budget" className="block text-lg font-semibold text-white mb-4">
                予算
              </label>
              <select
                id="budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-6 py-4 bg-[var(--color-background-tertiary)] border border-[var(--color-border)] rounded-xl text-white focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20 transition-all"
              >
                {budgetOptions.map((option) => (
                  <option 
                    key={option.value} 
                    value={option.value}
                    className="bg-[var(--color-background-tertiary)] text-white"
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Taste Preferences */}
            <div className="mb-8">
              <label htmlFor="tastePreferences" className="block text-lg font-semibold text-white mb-4">
                味の好み *
              </label>
              <textarea
                id="tastePreferences"
                value={tastePreferences}
                onChange={(e) => setTastePreferences(e.target.value)}
                placeholder="例: ホップの効いたIPA、フルーティーな味わい、苦味が少ない"
                rows={4}
                className="w-full px-6 py-4 bg-[var(--color-background-tertiary)] border border-[var(--color-border)] rounded-xl text-white placeholder-[var(--color-text-tertiary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20 transition-all resize-none"
                required
              />
            </div>

            {/* Avoid List */}
            <div>
              <label htmlFor="avoidList" className="block text-lg font-semibold text-white mb-4">
                避けたい要素
              </label>
              <textarea
                id="avoidList"
                value={avoidList}
                onChange={(e) => setAvoidList(e.target.value)}
                placeholder="例: 強い苦味、酸味、高アルコール度数"
                rows={3}
                className="w-full px-6 py-4 bg-[var(--color-background-tertiary)] border border-[var(--color-border)] rounded-xl text-white placeholder-[var(--color-text-tertiary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20 transition-all resize-none"
              />
            </div>
          </div>

          {/* Submit Section */}
          <div className="flex space-x-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Link
              href="/home"
              className="button-secondary flex-1 text-center"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              disabled={!sessionGoal || !tastePreferences || isLoading}
              className="button-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
            >
              {isLoading && <div className="spinner scale-75" />}
              <span>プロンプト生成</span>
              <span className="text-xl">→</span>
            </button>
          </div>

          {/* Requirements */}
          <div className="bg-[var(--color-background-secondary)] border border-[var(--color-border)] rounded-xl p-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-3 uppercase tracking-wide">
              入力要件
            </h3>
            <div className="space-y-2 text-sm text-[var(--color-text-tertiary)]">
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${sessionGoal ? 'bg-[var(--color-success)]' : 'bg-[var(--color-border)]'}`}></span>
                <span>目的の入力（必須）</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${tastePreferences ? 'bg-[var(--color-success)]' : 'bg-[var(--color-border)]'}`}></span>
                <span>味の好みの入力（必須）</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[var(--color-info)]"></span>
                <span>場所・予算・避けたい要素（任意）</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}