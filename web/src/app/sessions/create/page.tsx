'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { storageService } from '@/services/storage';
import type { BeerSearchSession } from '@/types/simple';

export default function CreateSessionPage() {
  const router = useRouter();
  const [sessionGoal, setSessionGoal] = useState('');
  const [mood, setMood] = useState<'adventurous' | 'stable' | 'relaxed'>('stable');
  const [primary, setPrimary] = useState<'hoppy' | 'malty' | 'balanced'>('balanced');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [searchKeywords, setSearchKeywords] = useState('');
  const [avoidList, setAvoidList] = useState('');
  const [otherConstraints, setOtherConstraints] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const session: BeerSearchSession = {
        sessionId: Date.now().toString(),
        createdAt: new Date().toISOString(),
        profile: {
          sessionGoal,
          mood,
          tastePreference: {
            primary,
            avoid: avoidList.split(',').map(s => s.trim()).filter(Boolean)
          },
          constraints: {
            location,
            budget,
            other: otherConstraints.split(',').map(s => s.trim()).filter(Boolean)
          },
          searchKeywords: searchKeywords.split(',').map(s => s.trim()).filter(Boolean)
        }
      };

      await storageService.saveSession(session);
      router.push(`/sessions/session-detail?id=${session.sessionId}`);
    } catch (error) {
      console.error('Error creating session:', error);
      alert('セッションの作成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const budgetOptions = [
    { value: '', label: '選択してください' },
    { value: '〜500円', label: '〜500円' },
    { value: '500〜1000円', label: '500〜1000円' },
    { value: '1000円〜', label: '1000円〜' },
    { value: '価格は気にしない', label: '価格は気にしない' },
  ];

  const moodOptions = [
    { value: 'adventurous', label: '冒険的', description: '新しいスタイルに挑戦したい' },
    { value: 'stable', label: '安定志向', description: '好みに近いものを探したい' },
    { value: 'relaxed', label: 'リラックス', description: 'のんびり楽しみたい' },
  ];

  const tasteOptions = [
    { value: 'hoppy', label: 'ホッピー', description: 'ホップの香りと苦味' },
    { value: 'malty', label: 'モルティ', description: '麦芽の甘みとコク' },
    { value: 'balanced', label: 'バランス', description: '調和のとれた味わい' },
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
                placeholder="例: 新しいスタイルを試したい、友人とのパーティー用"
                className="w-full px-6 py-4 bg-[var(--color-background-tertiary)] border border-[var(--color-border)] rounded-xl text-white placeholder-[var(--color-text-tertiary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20 transition-all"
                required
              />
            </div>

            {/* Mood */}
            <div className="mb-8">
              <label className="block text-lg font-semibold text-white mb-4">
                今の気分 *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {moodOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setMood(option.value as 'adventurous' | 'stable' | 'relaxed')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      mood === option.value
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/20'
                        : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
                    }`}
                  >
                    <div className="text-lg font-semibold mb-1">{option.label}</div>
                    <div className="text-sm text-[var(--color-text-secondary)]">{option.description}</div>
                  </button>
                ))}
              </div>
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
              <label className="block text-lg font-semibold text-white mb-4">
                味の好み *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tasteOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPrimary(option.value as 'hoppy' | 'malty' | 'balanced')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      primary === option.value
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/20'
                        : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
                    }`}
                  >
                    <div className="text-lg font-semibold mb-1">{option.label}</div>
                    <div className="text-sm text-[var(--color-text-secondary)]">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Search Keywords */}
            <div className="mb-8">
              <label htmlFor="searchKeywords" className="block text-lg font-semibold text-white mb-4">
                検索キーワード
              </label>
              <input
                type="text"
                id="searchKeywords"
                value={searchKeywords}
                onChange={(e) => setSearchKeywords(e.target.value)}
                placeholder="例: IPA, 地元産, 限定, クラフト（カンマ区切り）"
                className="w-full px-6 py-4 bg-[var(--color-background-tertiary)] border border-[var(--color-border)] rounded-xl text-white placeholder-[var(--color-text-tertiary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20 transition-all"
              />
            </div>

            {/* Avoid List */}
            <div className="mb-8">
              <label htmlFor="avoidList" className="block text-lg font-semibold text-white mb-4">
                避けたい要素
              </label>
              <input
                type="text"
                id="avoidList"
                value={avoidList}
                onChange={(e) => setAvoidList(e.target.value)}
                placeholder="例: 酸味, スモーキー, 高アルコール（カンマ区切り）"
                className="w-full px-6 py-4 bg-[var(--color-background-tertiary)] border border-[var(--color-border)] rounded-xl text-white placeholder-[var(--color-text-tertiary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20 transition-all"
              />
            </div>

            {/* Other Constraints */}
            <div>
              <label htmlFor="otherConstraints" className="block text-lg font-semibold text-white mb-4">
                その他の制約
              </label>
              <input
                type="text"
                id="otherConstraints"
                value={otherConstraints}
                onChange={(e) => setOtherConstraints(e.target.value)}
                placeholder="例: 飛行機持ち込み可能, 缶ビールのみ（カンマ区切り）"
                className="w-full px-6 py-4 bg-[var(--color-background-tertiary)] border border-[var(--color-border)] rounded-xl text-white placeholder-[var(--color-text-tertiary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20 transition-all"
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
              disabled={!sessionGoal || isLoading}
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
                <span className="w-2 h-2 rounded-full bg-[var(--color-success)]"></span>
                <span>気分と味の好みの選択（必須）</span>
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