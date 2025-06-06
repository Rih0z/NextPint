'use client';

import React, { useState, useRef } from 'react';
import { 
  Copy, 
  Check, 
  Upload, 
  AlertTriangle, 
  CheckCircle,
  Bot,
  Loader2
} from 'lucide-react';
import { ServiceFactory } from '@/application/factories/ServiceFactory';
import { Button, Card } from '@/components/ui/web';

interface DataImportWizardProps {
  onImportComplete?: (data: any) => void;
  onError?: (error: string) => void;
}

export default function DataImportWizard({ onImportComplete, onError }: DataImportWizardProps) {
  const [step, setStep] = useState<'prompt' | 'json' | 'processing' | 'complete'>('prompt');
  const [prompt, setPrompt] = useState<string>('');
  const [jsonInput, setJsonInput] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // プロンプトを生成
  const generatePrompt = async () => {
    setIsLoading(true);
    try {
      const promptService = ServiceFactory.getPromptService();
      const generatedPrompt = await promptService.generateDataImportPrompt();
      setPrompt(generatedPrompt);
    } catch (error) {
      onError?.('プロンプトの生成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 初回読み込み時にプロンプトを生成
  React.useEffect(() => {
    if (!prompt) {
      generatePrompt();
    }
  }, []);

  // プロンプトをクリップボードにコピー
  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      onError?.('コピーに失敗しました');
    }
  };

  // JSONを検証・処理
  const processJsonInput = async () => {
    if (!jsonInput.trim()) {
      onError?.('JSONデータを入力してください');
      return;
    }

    setIsLoading(true);
    setStep('processing');

    try {
      const promptService = ServiceFactory.getPromptService();
      const result = await promptService.parseImportData(jsonInput);
      
      setValidationResult(result);

      if (result.isValid) {
        // データをアプリにインポート
        await importDataToApp(result);
        setStep('complete');
        onImportComplete?.(result);
      } else {
        setStep('json');
        onError?.('データの検証に失敗しました: ' + result.errors.join(', '));
      }
    } catch (error) {
      setStep('json');
      onError?.('データの処理中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  // データをアプリにインポート
  const importDataToApp = async (data: any) => {
    const storageService = ServiceFactory.getStorageService();
    
    try {
      // ユーザープロファイルをインポート
      if (data.userProfile) {
        await storageService.saveUserProfile(data.userProfile);
      }

      // ビール履歴をインポート  
      if (data.beerHistory && data.beerHistory.length > 0) {
        await storageService.saveBeerHistory(data.beerHistory);
      }

      // アナリティクス追跡
      ServiceFactory.getAnalyticsService().trackEvent('data_import_success', {
        userProfileImported: !!data.userProfile,
        beerHistoryCount: data.beerHistory?.length || 0,
        source: data.importMetadata?.source || 'unknown'
      });
    } catch (error) {
      throw new Error('データの保存中にエラーが発生しました');
    }
  };

  const nextToJsonStep = () => {
    setStep('json');
  };

  const backToPromptStep = () => {
    setStep('prompt');
  };

  const restart = () => {
    setStep('prompt');
    setJsonInput('');
    setValidationResult(null);
  };

  if (step === 'prompt') {
    return (
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Bot className="w-6 h-6 text-primary-400" />
            <h3 className="text-xl font-bold">AIアシスタントでデータを収集</h3>
          </div>
          
          <div className="space-y-4">
            <p className="text-text-secondary">
              以下のプロンプトをClaude、Gemini、ChatGPTなどのAIツールにコピーして、
              現在のビール関連情報を段階的に入力してください。
            </p>

            <div className="bg-background-secondary rounded-lg p-4 relative">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-400" />
                  <span className="ml-2 text-text-secondary">プロンプトを生成中...</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-sm text-text-secondary">AIツール用プロンプト</h4>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={copyPrompt}
                      className="flex items-center gap-2"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-4 h-4" />
                          コピー済み
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          コピー
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="bg-background border rounded p-3 max-h-64 overflow-y-auto">
                    <pre className="text-sm whitespace-pre-wrap font-mono">{prompt}</pre>
                  </div>
                </>
              )}
            </div>

            <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-4">
              <h4 className="font-medium text-primary-400 mb-2">手順：</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-text-secondary">
                <li>上のプロンプトをコピーしてAIツール（Claude、Gemini、ChatGPT等）に貼り付け</li>
                <li>AIの質問に従って段階的に情報を入力</li>
                <li>スクリーンショットや画像も一緒に共有</li>
                <li>AIが最終的にJSON形式でデータを出力するまで待つ</li>
                <li>出力されたJSONをこのページに戻って入力</li>
              </ol>
            </div>

            <div className="flex justify-end">
              <Button onClick={nextToJsonStep} className="flex items-center gap-2">
                次へ：JSON入力
                <Upload className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (step === 'json') {
    return (
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Upload className="w-6 h-6 text-primary-400" />
            <h3 className="text-xl font-bold">AIから出力されたJSONを入力</h3>
          </div>

          <div className="space-y-4">
            <p className="text-text-secondary">
              AIツールから出力されたJSON形式のデータをここに貼り付けてください。
            </p>

            <div>
              <label htmlFor="json-input" className="block text-sm font-medium mb-2">
                JSON データ
              </label>
              <textarea
                id="json-input"
                ref={textareaRef}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder={`{
  "userProfile": {
    "preferences": {...},
    "settings": {...}
  },
  "beerHistory": [...],
  "importMetadata": {...}
}`}
                className="w-full h-64 p-3 bg-background-secondary border border-border rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {validationResult && !validationResult.isValid && (
              <div className="bg-error/10 border border-error/20 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-error mb-1">検証エラー</h4>
                    <ul className="list-disc list-inside text-sm text-error/80 space-y-1">
                      {validationResult.errors.map((error: string, index: number) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="secondary" onClick={backToPromptStep}>
                戻る
              </Button>
              <Button 
                onClick={processJsonInput} 
                disabled={!jsonInput.trim() || isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    処理中...
                  </>
                ) : (
                  <>
                    データをインポート
                    <CheckCircle className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (step === 'processing') {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary-400 mx-auto" />
          <h3 className="text-xl font-bold">データを処理中...</h3>
          <p className="text-text-secondary">
            JSONデータを検証し、アプリに取り込んでいます。少々お待ちください。
          </p>
        </div>
      </Card>
    );
  }

  if (step === 'complete') {
    return (
      <Card className="p-6">
        <div className="text-center space-y-6">
          <CheckCircle className="w-16 h-16 text-success mx-auto" />
          <div>
            <h3 className="text-xl font-bold text-success mb-2">インポート完了！</h3>
            <p className="text-text-secondary">
              データが正常にNextPintアプリに取り込まれました。
            </p>
          </div>

          {validationResult && (
            <div className="bg-success/10 border border-success/20 rounded-lg p-4 text-left">
              <h4 className="font-medium text-success mb-2">インポート内容：</h4>
              <div className="space-y-1 text-sm text-text-secondary">
                {validationResult.userProfile && (
                  <div>✓ ユーザープロファイル（好み・設定）</div>
                )}
                {validationResult.beerHistory?.length > 0 && (
                  <div>✓ ビール履歴 {validationResult.beerHistory.length}件</div>
                )}
                <div>✓ インポートメタデータ</div>
              </div>
            </div>
          )}

          <Button onClick={restart} variant="primary">
            新しいデータをインポート
          </Button>
        </div>
      </Card>
    );
  }

  return null;
}