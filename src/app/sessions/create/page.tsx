'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { 
  Target, 
  Heart, 
  MapPin, 
  DollarSign, 
  Search, 
  Sparkles,
  ChevronRight,
  Plus,
  X,
  Copy,
  Check,
  ArrowLeft
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import { ServiceFactory } from '@/application/factories/ServiceFactory';
import { SessionProfile } from '@/types';

interface FormData {
  sessionGoal: string;
  mood: string;
  primaryTaste: string;
  avoidTastes: string[];
  location: string;
  budget: string;
  keywords: string[];
  constraints: string[];
}

export default function CreateSessionPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    sessionGoal: '',
    mood: '',
    primaryTaste: '',
    avoidTastes: [],
    location: '',
    budget: '',
    keywords: [],
    constraints: []
  });

  const [newKeyword, setNewKeyword] = useState('');
  const [newConstraint, setNewConstraint] = useState('');

  useEffect(() => {
    // Track page view
    ServiceFactory.getAnalyticsService().trackEvent('page_view', { page: 'session_create' });
  }, []);

  const moods = [
    { value: 'adventurous', label: '冒険的', emoji: '🚀', description: '新しいスタイルを試したい' },
    { value: 'relaxed', label: 'リラックス', emoji: '😌', description: '馴染みのある味を楽しみたい' },
    { value: 'celebratory', label: 'お祝い', emoji: '🎉', description: '特別な日にふさわしいビール' },
    { value: 'contemplative', label: '思索的', emoji: '🤔', description: 'じっくり味わいたい' },
    { value: 'social', label: '社交的', emoji: '👥', description: 'みんなで楽しめるビール' },
    { value: 'nostalgic', label: 'ノスタルジック', emoji: '💭', description: '懐かしい味を求めている' }
  ];

  const tastes = [
    { value: 'hoppy', label: 'ホッピー', description: 'IPA、ペールエールなど' },
    { value: 'malty', label: 'モルティ', description: 'ラガー、ポーターなど' },
    { value: 'fruity', label: 'フルーティ', description: 'ベルジャン、サワーなど' },
    { value: 'smooth', label: 'スムース', description: 'ピルスナー、ライトエールなど' },
    { value: 'complex', label: '複雑', description: 'バーレーワイン、インペリアルスタウトなど' },
    { value: 'crisp', label: 'クリスプ', description: 'ラガー、ケルシュなど' },
    { value: 'roasted', label: 'ローストが効いた', description: 'スタウト、ポーターなど' },
    { value: 'spicy', label: 'スパイシー', description: 'ベルジャン、セゾンなど' }
  ];

  const budgetOptions = [
    { value: 'budget-friendly', label: '手頃（〜500円）', description: '普段使いできる価格帯' },
    { value: 'moderate', label: '普通（500-1000円）', description: 'バランスの取れた価格帯' },
    { value: 'premium', label: 'プレミアム（1000-2000円）', description: '特別な時のための価格帯' },
    { value: 'luxury', label: 'ラグジュアリー（2000円〜）', description: '最高級のビール体験' },
    { value: 'flexible', label: '柔軟', description: '価格にこだわらない' }
  ];

  const handleSubmit = async () => {
    if (!formData.sessionGoal || !formData.mood || !formData.primaryTaste) {
      alert('必須項目を入力してください');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Track session creation
      ServiceFactory.getAnalyticsService().trackEvent('session_create_start', {
        mood: formData.mood,
        primaryTaste: formData.primaryTaste,
        hasLocation: !!formData.location,
        keywordCount: formData.keywords.length
      });

      const profile: SessionProfile = {
        sessionGoal: formData.sessionGoal,
        mood: formData.mood,
        tastePreference: {
          primary: formData.primaryTaste,
          avoid: formData.avoidTastes,
          intensity: 3
        },
        constraints: {
          location: formData.location || undefined,
          budget: formData.budget || undefined,
          other: formData.constraints
        },
        searchKeywords: formData.keywords
      };

      // Generate prompt using PromptService
      const promptService = ServiceFactory.getPromptService();
      const prompt = await promptService.generateSessionPrompt(profile);
      
      setGeneratedPrompt(prompt);

      // Save session
      const storageService = ServiceFactory.getStorageService();
      const sessions = await storageService.getSessions();
      const newSession = {
        id: `session_${Date.now()}`,
        sessionId: `session_${Date.now()}`,
        userId: 'user_local',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        profile,
        generatedPrompts: [prompt],
        status: 'active',
        notes: `Generated on ${new Date().toLocaleDateString('ja-JP')}`
      };

      await storageService.saveSessions([...sessions, newSession]);

      // Track successful generation
      ServiceFactory.getAnalyticsService().trackEvent('prompt_generated', {
        sessionId: newSession.id,
        promptLength: prompt.length,
        hasKeywords: formData.keywords.length > 0
      });

      setStep(4); // Show result step
    } catch (error) {
      console.error('Error generating prompt:', error);
      ServiceFactory.getAnalyticsService().trackEvent('prompt_generation_error', { error: error instanceof Error ? error.message : String(error) });
      alert('プロンプト生成中にエラーが発生しました。もう一度お試しください。');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setIsCopied(true);
      ServiceFactory.getAnalyticsService().trackEvent('prompt_copied');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const addConstraint = () => {
    if (newConstraint.trim() && !formData.constraints.includes(newConstraint.trim())) {
      setFormData(prev => ({
        ...prev,
        constraints: [...prev.constraints, newConstraint.trim()]
      }));
      setNewConstraint('');
    }
  };

  const removeConstraint = (constraint: string) => {
    setFormData(prev => ({
      ...prev,
      constraints: prev.constraints.filter(c => c !== constraint)
    }));
  };

  const toggleAvoidTaste = (taste: string) => {
    setFormData(prev => ({
      ...prev,
      avoidTastes: prev.avoidTastes.includes(taste)
        ? prev.avoidTastes.filter(t => t !== taste)
        : [...prev.avoidTastes, taste]
    }));
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Target size={48} className="text-primary-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">セッション目標を設定</h2>
        <p className="text-text-secondary">今回のビール発見で何を達成したいですか？</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">今回の目標 *</label>
        <textarea
          value={formData.sessionGoal}
          onChange={(e) => setFormData(prev => ({ ...prev, sessionGoal: e.target.value }))}
          placeholder="例：新しいIPAスタイルを見つけたい、友人との飲み会にぴったりなビールを探したい、など"
          className="w-full p-4 rounded-lg bg-background-secondary border border-gray-700 focus:border-primary-500 focus:outline-none resize-none"
          rows={4}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">今の気分 *</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {moods.map((mood) => (
            <button
              key={mood.value}
              onClick={() => setFormData(prev => ({ ...prev, mood: mood.value }))}
              className={`
                p-4 rounded-lg border text-left transition-all
                ${formData.mood === mood.value
                  ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                  : 'border-gray-700 bg-background-secondary hover:border-gray-600'
                }
              `}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{mood.emoji}</span>
                <span className="font-medium">{mood.label}</span>
              </div>
              <p className="text-sm text-text-secondary">{mood.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Heart size={48} className="text-primary-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">味の好みを教えてください</h2>
        <p className="text-text-secondary">あなたの味覚プロファイルを設定します</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">好みの味わい *</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tastes.map((taste) => (
            <button
              key={taste.value}
              onClick={() => setFormData(prev => ({ ...prev, primaryTaste: taste.value }))}
              className={`
                p-4 rounded-lg border text-left transition-all
                ${formData.primaryTaste === taste.value
                  ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                  : 'border-gray-700 bg-background-secondary hover:border-gray-600'
                }
              `}
            >
              <div className="font-medium mb-1">{taste.label}</div>
              <p className="text-sm text-text-secondary">{taste.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">避けたい味わい（複数選択可）</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {tastes.map((taste) => (
            <button
              key={taste.value}
              onClick={() => toggleAvoidTaste(taste.value)}
              className={`
                p-3 rounded-lg border text-center transition-all text-sm
                ${formData.avoidTastes.includes(taste.value)
                  ? 'border-red-500 bg-red-500/10 text-red-400'
                  : 'border-gray-700 bg-background-secondary hover:border-gray-600'
                }
              `}
            >
              {taste.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Search size={48} className="text-primary-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">詳細設定（オプション）</h2>
        <p className="text-text-secondary">より精密な推奨のための追加情報</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">
          <MapPin size={16} className="inline mr-2" />
          場所・地域
        </label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
          placeholder="例：東京、大阪、ローカルブルワリー、など"
          className="w-full p-3 rounded-lg bg-background-secondary border border-gray-700 focus:border-primary-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">
          <DollarSign size={16} className="inline mr-2" />
          予算・価格帯
        </label>
        <div className="grid grid-cols-1 gap-3">
          {budgetOptions.map((budget) => (
            <button
              key={budget.value}
              onClick={() => setFormData(prev => ({ ...prev, budget: budget.value }))}
              className={`
                p-4 rounded-lg border text-left transition-all
                ${formData.budget === budget.value
                  ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                  : 'border-gray-700 bg-background-secondary hover:border-gray-600'
                }
              `}
            >
              <div className="font-medium mb-1">{budget.label}</div>
              <p className="text-sm text-text-secondary">{budget.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">キーワード・関心事</label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
            placeholder="例：クラフトビール、地ビール、季節限定"
            className="flex-1 p-3 rounded-lg bg-background-secondary border border-gray-700 focus:border-primary-500 focus:outline-none"
          />
          <button
            onClick={addKeyword}
            className="px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.keywords.map((keyword) => (
            <span
              key={keyword}
              className="inline-flex items-center gap-1 px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm"
            >
              {keyword}
              <button onClick={() => removeKeyword(keyword)}>
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">その他の制約・要望</label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newConstraint}
            onChange={(e) => setNewConstraint(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addConstraint()}
            placeholder="例：ノンアルコール可、オーガニック、低カロリー"
            className="flex-1 p-3 rounded-lg bg-background-secondary border border-gray-700 focus:border-primary-500 focus:outline-none"
          />
          <button
            onClick={addConstraint}
            className="px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.constraints.map((constraint) => (
            <span
              key={constraint}
              className="inline-flex items-center gap-1 px-3 py-1 bg-secondary-500/20 text-secondary-400 rounded-full text-sm"
            >
              {constraint}
              <button onClick={() => removeConstraint(constraint)}>
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Sparkles size={48} className="text-primary-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">プロンプトが生成されました！</h2>
        <p className="text-text-secondary">このプロンプトをAIサービスで使用してください</p>
      </div>

      <div className="bg-background-secondary rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">生成されたプロンプト</h3>
          <button
            onClick={copyToClipboard}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg transition-all
              ${isCopied 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-primary-500/20 text-primary-400 hover:bg-primary-500/30'
              }
            `}
          >
            {isCopied ? <Check size={16} /> : <Copy size={16} />}
            {isCopied ? 'コピー済み' : 'コピー'}
          </button>
        </div>
        <div className="bg-background-primary rounded p-4 text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
          {generatedPrompt}
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <h4 className="font-medium text-blue-400 mb-2">💡 使用方法</h4>
        <ul className="text-sm text-text-secondary space-y-1">
          <li>• 上のプロンプトをコピーしてください</li>
          <li>• ChatGPT、Claude、Geminiなどのお好みのAIサービスに貼り付けてください</li>
          <li>• AIからの回答を待って、おすすめビールを楽しんでください！</li>
        </ul>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => router.push('/sessions')}
          className="flex-1 btn-secondary"
        >
          セッション一覧へ
        </button>
        <button
          onClick={() => {
            setStep(1);
            setFormData({
              sessionGoal: '',
              mood: '',
              primaryTaste: '',
              avoidTastes: [],
              location: '',
              budget: '',
              keywords: [],
              constraints: []
            });
            setGeneratedPrompt('');
          }}
          className="flex-1 btn-primary"
        >
          新しいセッション
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Navigation />
      
      <main className="mobile-container mobile-section pb-24 lg:pb-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : router.push('/')}
            className="btn-secondary-small"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">ビール発見セッション</h1>
            <p className="text-text-secondary">ステップ {step} / 4</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-text-secondary mb-2">
            <span>目標設定</span>
            <span>味の好み</span>
            <span>詳細設定</span>
            <span>プロンプト生成</span>
          </div>
          <div className="w-full bg-background-secondary rounded-full h-2">
            <div 
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>

        {/* Navigation Buttons */}
        {step < 4 && (
          <div className="max-w-2xl mx-auto mt-8 flex gap-4">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="btn-secondary flex-1"
              >
                戻る
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && (!formData.sessionGoal || !formData.mood)) ||
                  (step === 2 && !formData.primaryTaste)
                }
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                次へ
                <ChevronRight size={20} className="ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isGenerating || !formData.sessionGoal || !formData.mood || !formData.primaryTaste}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner mr-2"></div>
                    プロンプト生成中...
                  </div>
                ) : (
                  <>
                    <Sparkles size={20} className="mr-2" />
                    プロンプト生成
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}