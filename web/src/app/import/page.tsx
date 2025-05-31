'use client';

import { useState } from 'react';
import { Upload, Image, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import { storageService } from '@/services/storage';
import type { ImportedBeer } from '@/types/simple';

export default function ImportPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string>('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getImportPrompt = () => {
    return `以下のビール履歴画像を分析して、JSON形式でデータを抽出してください。

出力形式:
{
  "beers": [
    {
      "name": "ビール名",
      "brewery": "醸造所名",
      "style": "スタイル（IPA、ピルスナーなど）",
      "rating": 評価（1-5の数値）,
      "notes": "テイスティングノート（あれば）",
      "source": "untappd",
      "date": "YYYY-MM-DD形式の日付"
    }
  ]
}

画像から読み取れる情報のみを抽出し、不明な項目はnullとしてください。`;
  };

  const copyPrompt = async () => {
    const prompt = getImportPrompt();
    await navigator.clipboard.writeText(prompt);
    setCopyStatus('copied');
    setTimeout(() => setCopyStatus(''), 2000);
  };

  const processImportResult = async () => {
    if (!importResult) return;
    
    setIsProcessing(true);
    try {
      // Parse the JSON result
      const data = JSON.parse(importResult);
      
      // Save to local storage
      const history = await storageService.getBeerHistory();
      const updatedHistory = [...history, ...data.beers.map((beer: ImportedBeer) => ({
        ...beer,
        id: Date.now() + Math.random(),
        importedAt: new Date().toISOString()
      }))];
      
      await storageService.saveBeerHistory(updatedHistory);
      
      // Update user preferences based on imported data
      const profile = await storageService.getUserProfile();
      const styles = data.beers.map((b: ImportedBeer) => b.style).filter(Boolean);
      const uniqueStyles = [...new Set([...profile.favoriteStyles, ...styles])];
      
      await storageService.saveUserProfile({
        ...profile,
        favoriteStyles: uniqueStyles.slice(0, 10),
        totalBeers: profile.totalBeers + data.beers.length
      });
      
      alert(`${data.beers.length}件のビールをインポートしました！`);
      setImportResult(null);
      setSelectedFile(null);
      setPreview(null);
    } catch {
      alert('JSONの解析に失敗しました。正しい形式で入力してください。');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gradient">ビール履歴インポート</h1>
        
        <div className="space-y-6">
          {/* Step 1: Upload Screenshot */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Image size={24} />
              ステップ1: スクリーンショットをアップロード
            </h2>
            
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-400 mb-2">
                  クリックして画像を選択、またはドラッグ&ドロップ
                </p>
                <p className="text-sm text-gray-500">
                  Untappd、RateBeer、BeerAdvocateのスクリーンショット対応
                </p>
              </label>
            </div>
            
            {preview && (
              <div className="mt-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={preview} 
                  alt="Upload preview"
                  className="max-h-64 mx-auto rounded-lg"
                />
              </div>
            )}
          </div>
          
          {/* Step 2: Copy Prompt */}
          {selectedFile && (
            <div className="glass-card rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText size={24} />
                ステップ2: AIにプロンプトをコピー
              </h2>
              
              <div className="bg-background-secondary rounded-lg p-4 mb-4">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                  {getImportPrompt()}
                </pre>
              </div>
              
              <Button
                onClick={copyPrompt}
                className="w-full btn-primary"
              >
                {copyStatus === 'copied' ? (
                  <>
                    <CheckCircle size={20} className="mr-2" />
                    コピーしました！
                  </>
                ) : (
                  'プロンプトをコピー'
                )}
              </Button>
              
              <p className="text-sm text-gray-400 mt-4">
                このプロンプトと画像をChatGPT、Claude、Geminiなどに送信してください
              </p>
            </div>
          )}
          
          {/* Step 3: Paste Result */}
          {selectedFile && (
            <div className="glass-card rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle size={24} />
                ステップ3: AI分析結果を貼り付け
              </h2>
              
              <textarea
                value={importResult || ''}
                onChange={(e) => setImportResult(e.target.value)}
                placeholder="AIが出力したJSON結果をここに貼り付けてください"
                className="w-full h-32 bg-background-secondary rounded-lg p-4 text-gray-300 placeholder-gray-500 border border-gray-700 focus:border-primary-500 transition-colors"
              />
              
              <Button
                onClick={processImportResult}
                disabled={!importResult || isProcessing}
                className="w-full btn-primary mt-4"
              >
                {isProcessing ? '処理中...' : 'インポートを完了'}
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}