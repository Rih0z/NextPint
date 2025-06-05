'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Upload, 
  Camera, 
  FileImage, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ArrowLeft,
  X,
  Plus,
  Bot,
  ImageIcon
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import DataImportWizard from '@/components/DataImportWizard';
import { ServiceFactory } from '@/application/factories/ServiceFactory';

type ImportTab = 'files' | 'ai';

export default function ImportPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ImportTab>('ai');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    setSelectedFiles(prev => [...prev, ...imageFiles]);
    setError(null);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processImages = async () => {
    if (selectedFiles.length === 0) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Mock AI processing - in real implementation, this would call an AI service
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock extracted data
      const mockResults = selectedFiles.map((file, index) => ({
        filename: file.name,
        beers: [
          {
            id: `beer_${Date.now()}_${index}`,
            name: `Sample Beer ${index + 1}`,
            brewery: 'Sample Brewery',
            style: 'IPA',
            rating: 4.2,
            notes: 'Great hoppy flavor',
            source: 'untappd' as const,
            checkinDate: new Date().toISOString().split('T')[0],
            importedAt: new Date().toISOString()
          }
        ]
      }));

      setResults(mockResults);

      // Save to storage
      const storageService = ServiceFactory.getStorageService();
      const allBeers = mockResults.flatMap(result => result.beers);
      await storageService.saveBeerHistory(allBeers);

    } catch (err) {
      setError('画像の処理中にエラーが発生しました。もう一度お試しください。');
      console.error('Error processing images:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetImport = () => {
    setSelectedFiles([]);
    setResults([]);
    setError(null);
    setIsProcessing(false);
  };

  const goToHistory = () => {
    router.push('/history');
  };

  const handleAIImportComplete = (data: any) => {
    setError(null);
    // AI import success is handled within the DataImportWizard component
  };

  const handleAIImportError = (errorMessage: string) => {
    setError(errorMessage);
  };

  // Success state
  if (results.length > 0) {
    const totalBeers = results.reduce((sum, result) => sum + result.beers.length, 0);
    
    return (
      <div className="min-h-screen bg-gradient-dark">
        <Navigation />
        
        <main className="mobile-container mobile-section pb-24 lg:pb-8">
          <div className="text-center animate-fade-in">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-400" />
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-gradient">
              インポート完了！
            </h1>
            
            <p className="text-text-secondary mb-8 max-w-md mx-auto">
              {totalBeers}個のビールが正常にインポートされました
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={goToHistory}
                className="btn-primary"
              >
                履歴を確認
              </button>
              <button
                onClick={resetImport}
                className="btn-secondary"
              >
                続けてインポート
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Navigation />
      
      <main className="mobile-container mobile-section pb-24 lg:pb-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 sm:mb-8">
          <Link href="/home" className="btn-secondary-small">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gradient">
              ビール履歴インポート
            </h1>
            <p className="text-text-secondary text-sm sm:text-base">
              {activeTab === 'ai' 
                ? 'AIアシスタントでデータを収集・インポート'
                : 'スクリーンショットからビール情報を自動抽出'
              }
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 sm:mb-8">
          <div className="flex space-x-1 bg-background-secondary rounded-lg p-1">
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-all ${
                activeTab === 'ai'
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Bot size={20} />
              AIアシスタント
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-all ${
                activeTab === 'files'
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <ImageIcon size={20} />
              ファイルアップロード
            </button>
          </div>
        </div>

        {/* AI Import Tab */}
        {activeTab === 'ai' && (
          <DataImportWizard 
            onImportComplete={handleAIImportComplete}
            onError={handleAIImportError}
          />
        )}

        {/* File Upload Tab */}
        {activeTab === 'files' && (
          <>
            {/* Instructions */}
            <div className="glass-card rounded-xl p-6 mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">📱</span>
                対応アプリ
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {['Untappd', 'RateBeer', 'BeerAdvocate'].map((app) => (
                  <div key={app} className="flex items-center gap-3 p-3 bg-background-secondary rounded-lg">
                    <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
                    <span className="font-medium">{app}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* File Upload Area */}
        <div className="mb-6 sm:mb-8">
          <div
            className={`
              relative border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-all duration-200
              ${dragActive 
                ? 'border-primary-400 bg-primary-500/10' 
                : 'border-gray-600 hover:border-gray-500'
              }
              ${selectedFiles.length > 0 ? 'border-green-500 bg-green-500/10' : ''}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="space-y-4">
              <div className="text-4xl sm:text-5xl">
                {selectedFiles.length > 0 ? '✅' : '📷'}
              </div>
              
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">
                  {selectedFiles.length > 0 
                    ? `${selectedFiles.length}個のファイルが選択されました`
                    : 'スクリーンショットをアップロード'
                  }
                </h3>
                <p className="text-text-secondary text-sm sm:text-base">
                  ドラッグ&ドロップ、またはボタンでファイルを選択
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary flex items-center justify-center gap-2"
                >
                  <FileImage size={20} />
                  ファイルを選択
                </button>
                
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="btn-secondary flex items-center justify-center gap-2 lg:hidden"
                >
                  <Camera size={20} />
                  写真を撮る
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <h3 className="text-lg font-semibold mb-4">選択されたファイル</h3>
            <div className="space-y-3">
              {selectedFiles.map((file, index) => (
                <div key={index} className="glass-card rounded-lg p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileImage size={20} className="text-primary-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium line-clamp-1">{file.name}</p>
                    <p className="text-sm text-text-secondary">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  
                  <button
                    onClick={() => removeFile(index)}
                    className="btn-secondary-small text-red-400 hover:bg-red-500/20"
                    aria-label="ファイルを削除"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Process Button */}
        {selectedFiles.length > 0 && !isProcessing && (
          <div className="text-center mb-6">
            <button
              onClick={processImages}
              className="btn-primary text-lg px-8 py-4"
            >
              <Upload size={20} className="mr-2" />
              ビール情報を抽出
            </button>
          </div>
        )}

        {/* Processing State */}
        {isProcessing && (
          <div className="text-center py-12">
            <div className="spinner mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">画像を処理中...</h3>
            <p className="text-text-secondary">
              AIがビール情報を抽出しています。しばらくお待ちください。
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="glass-card rounded-xl p-6 border border-red-500/50 bg-red-500/10">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-400 mb-1">エラーが発生しました</h3>
                <p className="text-sm text-text-secondary">{error}</p>
              </div>
            </div>
          </div>
        )}

            {/* Tips */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">💡</span>
                より良い結果を得るためのコツ
              </h3>
              
              <div className="space-y-3 text-sm sm:text-base">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary-400 rounded-full flex-shrink-0 mt-2"></div>
                  <p className="text-text-secondary">
                    ビール名、醸造所名、評価が見やすいスクリーンショットを使用
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary-400 rounded-full flex-shrink-0 mt-2"></div>
                  <p className="text-text-secondary">
                    画像は鮮明で、文字がはっきり読める状態が理想的
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary-400 rounded-full flex-shrink-0 mt-2"></div>
                  <p className="text-text-secondary">
                    複数のビールが含まれるスクリーンショットも対応
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Global Error Display */}
        {error && activeTab === 'ai' && (
          <div className="glass-card rounded-xl p-6 border border-red-500/50 bg-red-500/10 mt-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-400 mb-1">エラーが発生しました</h3>
                <p className="text-sm text-text-secondary">{error}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}