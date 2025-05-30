'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { storageService } from '@/services/storage';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const steps = [
    {
      title: 'NextPint へようこそ',
      content: (
        <div className="text-center space-y-8 animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-[var(--color-primary)] opacity-20 animate-pulse-glow"></div>
            <div className="relative text-8xl mb-6">🍺</div>
          </div>
          <h1 className="text-5xl font-bold gradient-text mb-6">NextPint</h1>
          <p className="text-xl text-[var(--color-text-secondary)] leading-relaxed max-w-md mx-auto">
            AI を活用したビール発見プロンプト提供アプリです。
          </p>
          <p className="text-[var(--color-text-tertiary)] max-w-lg mx-auto">
            あなたの好みや場面に最適なビールを見つけるためのプロンプトを提供します。
          </p>
        </div>
      ),
    },
    {
      title: 'プライバシー重視',
      content: (
        <div className="text-center space-y-8 animate-fade-in">
          <div className="text-8xl mb-6">🔒</div>
          <h2 className="text-4xl font-bold text-white mb-6">プライバシー重視の設計</h2>
          <div className="text-left space-y-6 max-w-md mx-auto">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-[var(--color-success)] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">✓</span>
              </div>
              <p className="text-[var(--color-text-secondary)]">すべてのデータはデバイス内に保存</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-[var(--color-success)] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">✓</span>
              </div>
              <p className="text-[var(--color-text-secondary)]">外部サーバーには個人データを送信しません</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-[var(--color-success)] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">✓</span>
              </div>
              <p className="text-[var(--color-text-secondary)]">プロンプトテンプレートのみを取得</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-[var(--color-success)] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">✓</span>
              </div>
              <p className="text-[var(--color-text-secondary)]">いつでもデータを削除可能</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '使い方',
      content: (
        <div className="text-center space-y-8 animate-fade-in">
          <div className="text-8xl mb-6">🎯</div>
          <h2 className="text-4xl font-bold text-white mb-6">簡単3ステップ</h2>
          <div className="space-y-6 max-w-md mx-auto">
            <div className="flex items-center space-x-6">
              <div className="w-12 h-12 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                1
              </div>
              <span className="text-[var(--color-text-secondary)] text-left">目的や好みを入力</span>
            </div>
            <div className="flex items-center space-x-6">
              <div className="w-12 h-12 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                2
              </div>
              <span className="text-[var(--color-text-secondary)] text-left">最適なプロンプトを生成</span>
            </div>
            <div className="flex items-center space-x-6">
              <div className="w-12 h-12 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                3
              </div>
              <span className="text-[var(--color-text-secondary)] text-left">AIに質問してビールを発見</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await storageService.setOnboardingCompleted(true);
      router.push('/home');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background-primary)] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex space-x-2 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                  index <= currentStep 
                    ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]' 
                    : 'bg-[var(--color-border)]'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-sm text-[var(--color-text-tertiary)]">
            {currentStep + 1} / {steps.length}
          </p>
        </div>

        {/* Content Card */}
        <div className="card-modern p-12 mb-8">
          {steps[currentStep].content}
        </div>

        {/* Navigation */}
        <div className="flex justify-between space-x-6">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="button-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            戻る
          </button>

          {currentStep === steps.length - 1 ? (
            <button
              onClick={handleComplete}
              disabled={isLoading}
              className="button-primary disabled:opacity-50 flex items-center space-x-3"
            >
              {isLoading && <div className="spinner scale-75" />}
              <span>はじめる</span>
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="button-primary"
            >
              次へ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}