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
      <div className="min-h-screen bg-[var(--color-background-primary)] flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="relative">
            {/* Glowing Background */}
            <div className="absolute inset-0 rounded-full bg-[var(--color-primary)] opacity-20 animate-pulse-glow"></div>
            
            {/* Spinner */}
            <div className="relative spinner mx-auto mb-6 scale-150"></div>
          </div>
          
          <h1 className="text-2xl font-bold gradient-text mb-2">NextPint</h1>
          <p className="text-lg text-[var(--color-text-secondary)]">
            読み込み中...
          </p>
        </div>
      </div>
    );
  }

  return null;
}