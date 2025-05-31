'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Copy, CheckCircle, ArrowLeft } from 'lucide-react';
import { storageService } from '@/services/storage';
import type { BeerSearchSession, UserProfile } from '@/types/simple';
import Navigation from '@/components/Navigation';

function SessionDetailContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('id');
  
  const [session, setSession] = useState<BeerSearchSession | null>(null);
  const [, setUserProfile] = useState<UserProfile | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!sessionId) return;
      
      try {
        const [sessionData, profileData] = await Promise.all([
          storageService.getSession(sessionId),
          storageService.getUserProfile()
        ]);
        
        if (sessionData) {
          setSession(sessionData);
          generatePrompt(sessionData, profileData);
        }
        setUserProfile(profileData);
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [sessionId]);

  const generatePrompt = (session: BeerSearchSession, profile: UserProfile) => {
    const moodMap = {
      adventurous: '冒険的で新しいスタイルに挑戦したい',
      stable: '安定志向で好みに近いものを探したい', 
      relaxed: 'リラックスしてのんびり楽しみたい'
    };

    const tasteMap = {
      hoppy: 'ホップの香りと苦味が効いた',
      malty: '麦芽の甘みとコクがある',
      balanced: 'バランスの取れた'
    };

    const prompt = `私は${session.profile.sessionGoal}という目的でビールを探しています。

現在の気分: ${moodMap[session.profile.mood]}
味の好み: ${tasteMap[session.profile.tastePreference.primary]}ビールが好きです。

制約条件:
${session.profile.constraints.location ? `- 場所: ${session.profile.constraints.location}` : ''}
${session.profile.constraints.budget ? `- 予算: ${session.profile.constraints.budget}` : ''}
${session.profile.constraints.other.length > 0 ? `- その他: ${session.profile.constraints.other.join(', ')}` : ''}

${session.profile.searchKeywords.length > 0 ? `検索キーワード: ${session.profile.searchKeywords.join(', ')}` : ''}
${session.profile.tastePreference.avoid.length > 0 ? `避けたい要素: ${session.profile.tastePreference.avoid.join(', ')}` : ''}

${profile.favoriteStyles.length > 0 ? `\n過去に楽しんだスタイル: ${profile.favoriteStyles.join(', ')}` : ''}

上記の条件に合うビールを5つ提案してください。それぞれについて以下の情報を含めてください：
1. ビール名と醸造所
2. スタイルと特徴
3. 味のプロフィール
4. なぜこのビールがおすすめなのか
5. 入手可能な場所（もしあれば）`;

    setGeneratedPrompt(prompt);

    // Save prompt to session
    session.results = {
      prompt,
      copiedAt: undefined,
      aiResponse: undefined
    };
    storageService.saveSession(session);
  };

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopyStatus('copied');
      
      if (session) {
        session.results = {
          ...session.results,
          prompt: generatedPrompt,
          copiedAt: new Date().toISOString()
        };
        await storageService.saveSession(session);
      }

      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="spinner mx-auto mb-6"></div>
          <p className="text-lg text-text-secondary">セッション読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!sessionId || !session) {
    return (
      <div className="min-h-screen bg-gradient-dark">
        <Navigation />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <p className="text-xl text-text-secondary mb-4">セッションが見つかりません</p>
            <Link href="/sessions/create" className="btn-primary">
              新しいセッションを開始
            </Link>
          </div>
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
          <Link 
            href="/sessions/create" 
            className="inline-flex items-center text-text-secondary hover:text-primary-400 mb-4 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            新しいセッション
          </Link>
          <h1 className="text-3xl font-bold mb-2 text-gradient">セッション詳細</h1>
          <p className="text-text-secondary">
            作成日時: {new Date(session.createdAt).toLocaleString('ja-JP')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Session Info */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              セッション情報
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-text-tertiary">目的</label>
                <p className="text-white mt-1">{session.profile.sessionGoal}</p>
              </div>
              
              <div>
                <label className="text-sm text-text-tertiary">気分</label>
                <p className="text-white mt-1">
                  {session.profile.mood === 'adventurous' && '冒険的'}
                  {session.profile.mood === 'stable' && '安定志向'}
                  {session.profile.mood === 'relaxed' && 'リラックス'}
                </p>
              </div>
              
              <div>
                <label className="text-sm text-text-tertiary">味の好み</label>
                <p className="text-white mt-1">
                  {session.profile.tastePreference.primary === 'hoppy' && 'ホッピー'}
                  {session.profile.tastePreference.primary === 'malty' && 'モルティ'}
                  {session.profile.tastePreference.primary === 'balanced' && 'バランス'}
                </p>
              </div>
              
              {session.profile.constraints.location && (
                <div>
                  <label className="text-sm text-text-tertiary">場所</label>
                  <p className="text-white mt-1">{session.profile.constraints.location}</p>
                </div>
              )}
              
              {session.profile.constraints.budget && (
                <div>
                  <label className="text-sm text-text-tertiary">予算</label>
                  <p className="text-white mt-1">{session.profile.constraints.budget}</p>
                </div>
              )}
              
              {session.profile.searchKeywords.length > 0 && (
                <div>
                  <label className="text-sm text-text-tertiary">キーワード</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {session.profile.searchKeywords.map((keyword, i) => (
                      <span key={i} className="px-3 py-1 bg-primary-500/20 rounded-full text-sm">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Generated Prompt */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <span className="text-2xl">✨</span>
                生成されたプロンプト
              </h2>
              <button
                onClick={copyPrompt}
                className="btn-primary flex items-center gap-2"
              >
                {copyStatus === 'copied' ? (
                  <>
                    <CheckCircle size={20} />
                    コピー済み
                  </>
                ) : (
                  <>
                    <Copy size={20} />
                    コピー
                  </>
                )}
              </button>
            </div>
            
            <div className="bg-background-secondary rounded-lg p-4 max-h-[400px] overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-300 font-mono">
                {generatedPrompt}
              </pre>
            </div>
            
            {session.results?.copiedAt && (
              <p className="text-sm text-text-tertiary mt-4">
                最終コピー: {new Date(session.results.copiedAt).toLocaleString('ja-JP')}
              </p>
            )}
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="mt-8 glass-card rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-6">使い方</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Copy size={32} className="text-primary-400" />
              </div>
              <h3 className="font-semibold mb-2">1. プロンプトをコピー</h3>
              <p className="text-sm text-text-secondary">
                上のボタンでクリップボードにコピー
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="font-semibold mb-2">2. AIに質問</h3>
              <p className="text-sm text-text-secondary">
                ChatGPT、Claude、Geminiなどに貼り付け
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🍺</span>
              </div>
              <h3 className="font-semibold mb-2">3. ビールを発見</h3>
              <p className="text-sm text-text-secondary">
                AIの提案から好みのビールを見つけよう
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SessionDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="spinner mx-auto mb-6"></div>
          <p className="text-lg text-text-secondary">読み込み中...</p>
        </div>
      </div>
    }>
      <SessionDetailContent />
    </Suspense>
  );
}