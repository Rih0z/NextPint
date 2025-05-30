'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { storageService } from '@/services/storage';

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const isCompleted = await storageService.isOnboardingCompleted();
        
        if (!isCompleted) {
          router.push('/onboarding');
        } else {
          router.push('/home');
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        router.push('/onboarding');
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboarding();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-amber-800">NextPint を読み込み中...</p>
        </div>
      </div>
    );
  }

  return null;
}