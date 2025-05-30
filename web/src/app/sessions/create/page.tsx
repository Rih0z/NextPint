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
          <h1 className="text-3xl font-bold text-amber-900 mb-2">
            新しいセッション
          </h1>
          <p className="text-amber-700">
            ビール発見の目的や好みを教えてください
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 border border-amber-200">
          <div className="space-y-6">
            {/* Session Goal */}
            <div>
              <label htmlFor="sessionGoal" className="block text-sm font-medium text-amber-900 mb-2">
                今回の目的 *
              </label>
              <input
                type="text"
                id="sessionGoal"
                value={sessionGoal}
                onChange={(e) => setSessionGoal(e.target.value)}
                placeholder="例: 友人とのパーティー用のビールを探したい"
                className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-amber-900 mb-2">
                場所・地域
              </label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="例: 東京都内、関西地方"
                className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* Budget */}
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-amber-900 mb-2">
                予算
              </label>
              <select
                id="budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">選択してください</option>
                <option value="low">〜500円</option>
                <option value="medium">500〜1000円</option>
                <option value="high">1000円〜</option>
                <option value="premium">価格は気にしない</option>
              </select>
            </div>

            {/* Taste Preferences */}
            <div>
              <label htmlFor="tastePreferences" className="block text-sm font-medium text-amber-900 mb-2">
                味の好み *
              </label>
              <textarea
                id="tastePreferences"
                value={tastePreferences}
                onChange={(e) => setTastePreferences(e.target.value)}
                placeholder="例: ホップの効いたIPA、フルーティーな味わい、苦味が少ない"
                rows={3}
                className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
            </div>

            {/* Avoid List */}
            <div>
              <label htmlFor="avoidList" className="block text-sm font-medium text-amber-900 mb-2">
                避けたい要素
              </label>
              <textarea
                id="avoidList"
                value={avoidList}
                onChange={(e) => setAvoidList(e.target.value)}
                placeholder="例: 強い苦味、酸味、高アルコール度数"
                rows={2}
                className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex space-x-4">
            <Link
              href="/home"
              className="flex-1 px-6 py-3 border border-amber-300 text-amber-700 rounded-lg font-medium hover:bg-amber-50 transition-colors text-center"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              disabled={!sessionGoal || !tastePreferences || isLoading}
              className="flex-1 px-6 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>プロンプト生成</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}