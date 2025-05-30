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
        <div className="text-center space-y-6">
          <div className="text-6xl mb-4">🍺</div>
          <h1 className="text-3xl font-bold text-amber-900 mb-4">NextPint</h1>
          <p className="text-lg text-amber-700 leading-relaxed">
            AI を活用したビール発見プロンプト提供アプリです。
          </p>
          <p className="text-amber-600">
            あなたの好みや場面に最適なビールを見つけるためのプロンプトを提供します。
          </p>
        </div>
      ),
    },
    {
      title: 'プライバシー重視',
      content: (
        <div className="text-center space-y-6">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-amber-900 mb-4">プライバシー重視の設計</h2>
          <div className="text-left space-y-4">
            <p className="text-amber-700">✅ すべてのデータはデバイス内に保存</p>
            <p className="text-amber-700">✅ 外部サーバーには個人データを送信しません</p>
            <p className="text-amber-700">✅ プロンプトテンプレートのみを取得</p>
            <p className="text-amber-700">✅ いつでもデータを削除可能</p>
          </div>
        </div>
      ),
    },
    {
      title: '使い方',
      content: (
        <div className="text-center space-y-6">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold text-amber-900 mb-4">簡単3ステップ</h2>
          <div className="text-left space-y-4">
            <div className="flex items-center space-x-3">
              <span className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold">1</span>
              <span className="text-amber-700">目的や好みを入力</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold">2</span>
              <span className="text-amber-700">最適なプロンプトを生成</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold">3</span>
              <span className="text-amber-700">AIに質問してビールを発見</span>
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="mb-8">
          <div className="flex space-x-2 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full ${
                  index <= currentStep ? 'bg-amber-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          
          {steps[currentStep].content}
        </div>

        <div className="flex justify-between space-x-4">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              currentStep === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            戻る
          </button>

          {currentStep === steps.length - 1 ? (
            <button
              onClick={handleComplete}
              disabled={isLoading}
              className="px-6 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>はじめる</span>
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
            >
              次へ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}