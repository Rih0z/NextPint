# アーキテクチャ設計書

## システム概要

NextPintは、ビール愛好家向けのAIプロンプトプロバイダーアプリケーションです。ユーザーの好みや状況を理解し、ChatGPT、Claude、Geminiなどの汎用AIサービスで使用できる最適なプロンプトを提供します。

## アーキテクチャ原則

### 1. プライバシーファースト
- すべてのデータはローカル保存
- 外部API連携なし（プロンプト配信のみオプション）
- ユーザーの同意なしに外部にデータを送信しない

### 2. AIサービス中立
- 特定のAIサービスに依存しない設計
- プロンプトベースでの連携のみ
- ユーザーが自由にAIサービスを選択可能

### 3. ユーザー主導
- アプリは推薦せず、プロンプトのみ提供
- すべての判断はユーザーが行う
- 透明性の高いデータフロー

## システム構成

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External AI   │
│  React Native   │    │  (Optional)     │    │   Services      │
│                 │    │ Cloudflare      │    │                 │
│ ┌─────────────┐ │    │  Workers        │    │ ┌─────────────┐ │
│ │ Session     │ │    │                 │    │ │  ChatGPT    │ │
│ │ Management  │ │    │ ┌─────────────┐ │    │ │  Claude     │ │
│ │             │ │    │ │ Prompt      │ │    │ │  Gemini     │ │
│ └─────────────┘ │    │ │ Templates   │ │    │ │             │ │
│                 │    │ │             │ │    │ └─────────────┘ │
│ ┌─────────────┐ │    │ └─────────────┘ │    │                 │
│ │ Data        │ │    │                 │    │                 │
│ │ Management  │ │    │ ┌─────────────┐ │    │                 │
│ │             │ │    │ │ D1 Database │ │    │                 │
│ └─────────────┘ │    │ │ (Optional)  │ │    │                 │
│                 │    │ └─────────────┘ │    │                 │
│ ┌─────────────┐ │    │                 │    │                 │
│ │ Prompt      │ │    └─────────────────┘    └─────────────────┘
│ │ Library     │ │              │                      │
│ │             │ │              │                      │
│ └─────────────┘ │              │                      │
│                 │              │                      │
│ ┌─────────────┐ │              │                      │
│ │ Local       │ │              │                      │
│ │ Storage     │ │              │                      │
│ │ AsyncStorage│ │              │                      │
│ └─────────────┘ │              │                      │
└─────────────────┘              │                      │
         │                       │                      │
         └───────────────────────┴──────────────────────┘
                        HTTP (Prompts Only)
```

## レイヤーアーキテクチャ

### Presentation Layer (UI)
```typescript
// 画面コンポーネント
- SessionScreen/          // セッション作成・管理
- HistoryScreen/          // インポート履歴表示
- PromptScreen/           // プロンプト表示・コピー
- SettingsScreen/         // 設定管理

// 共通コンポーネント
- Components/
  - PromptCard/           // プロンプト表示カード
  - SessionForm/          // セッション作成フォーム
  - ImportWizard/         // データインポートウィザード
```

### Business Logic Layer
```typescript
// セッション管理
- SessionManager         // セッション作成・更新・削除
- PromptGenerator        // プロンプト生成ロジック
- PreferenceAnalyzer     // 好み分析・学習

// データ処理
- ImportProcessor        // スクリーンショット解析結果の処理
- DataValidator          // 入力データの検証
- MigrationManager       // データ移行処理
```

### Data Access Layer
```typescript
// ローカルストレージ
- UserProfileRepository  // ユーザープロファイル
- SessionRepository      // セッション履歴
- PromptRepository       // プロンプトテンプレート
- SettingsRepository     // アプリ設定

// 外部サービス（オプション）
- PromptTemplateAPI      // プロンプトテンプレート配信
```

## データフロー

### 1. データインポートフロー
```
User Action → Screenshot → AI Prompt → AI Analysis → JSON Result → Data Storage
     ↓              ↓           ↓            ↓            ↓            ↓
1. スクショ撮影  2. プロンプト  3. AI分析    4. 結果取得   5. JSON入力  6. データ保存
```

### 2. セッション作成フロー
```
User Input → Session Creation → Prompt Generation → Clipboard Copy → AI Service
     ↓              ↓                ↓                    ↓             ↓
1. 条件入力    2. セッション作成    3. プロンプト生成    4. コピー      5. AI使用
```

### 3. 学習フロー
```
Historical Data → Pattern Analysis → Preference Update → Prompt Optimization
       ↓                ↓                 ↓                     ↓
   1. 履歴データ     2. パターン分析     3. 好み更新        4. プロンプト最適化
```

## モジュール設計

### Core Modules
```typescript
// types/
export interface UserProfile {
  id: string;
  preferences: UserPreferences;
  history: ImportedBeer[];
  sessions: BeerSearchSession[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BeerSearchSession {
  sessionId: string;
  createdAt: Date;
  profile: SessionProfile;
  generatedPrompts: GeneratedPrompt[];
  results?: SessionResult[];
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: PromptVariable[];
  category: PromptCategory;
  version: string;
}
```

### Service Modules
```typescript
// services/
- SessionService         // セッション管理ロジック
- PromptService          // プロンプト生成・管理
- ImportService          // データインポート処理
- PreferenceService      // 好み分析・学習
- StorageService         // ローカルストレージ操作
- TemplateService        // プロンプトテンプレート管理
```

### Utility Modules
```typescript
// utils/
- DataValidator          // データ検証
- DateTimeHelper         // 日時処理
- ClipboardManager       // クリップボード操作
- LoggerService          // ログ管理
- ErrorHandler           // エラー処理
```

## セキュリティ設計

### データ保護
1. **ローカルストレージの暗号化**
   - AsyncStorageの内容を暗号化
   - デバイス固有のキーを使用

2. **入力データの検証**
   - すべての外部入力をサニタイズ
   - 型安全性の確保

3. **プライバシー保護**
   - 外部への不正なデータ送信防止
   - ユーザー同意なしのデータ利用禁止

### エラーハンドリング
```typescript
// ErrorTypes
enum ErrorType {
  STORAGE_ERROR = 'STORAGE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  IMPORT_ERROR = 'IMPORT_ERROR',
  PROMPT_GENERATION_ERROR = 'PROMPT_GENERATION_ERROR'
}

interface AppError {
  type: ErrorType;
  message: string;
  context?: any;
  timestamp: Date;
}
```

## パフォーマンス設計

### 最適化戦略
1. **レイジーローディング**
   - 画面遷移時の動的インポート
   - プロンプトテンプレートの遅延読み込み

2. **メモリ管理**
   - 不要なデータの自動削除
   - 履歴データの適切な制限

3. **ストレージ最適化**
   - データの圧縮保存
   - インデックス最適化

## 拡張性設計

### プラグインアーキテクチャ
```typescript
interface PromptPlugin {
  id: string;
  name: string;
  version: string;
  generate(context: PromptContext): Promise<string>;
  validate(input: any): boolean;
}

interface ImportPlugin {
  id: string;
  name: string;
  supportedSources: ImportSource[];
  process(data: any): Promise<ImportedBeer[]>;
}
```

### 国際化対応
```typescript
interface LocalizationConfig {
  language: string;
  region: string;
  templates: Record<string, string>;
  dateFormat: string;
  currency: string;
}
```

## デプロイメント戦略

### モバイルアプリ
- React Native CLI or Expo
- iOS App Store / Google Play Store
- CodePush による OTA アップデート

### バックエンド（オプション）
- Cloudflare Workers
- Cloudflare D1 Database
- CDN による高速配信

## 監視・ログ

### アプリ内ログ
```typescript
interface LogEntry {
  level: 'info' | 'warn' | 'error';
  message: string;
  context?: any;
  timestamp: Date;
  sessionId?: string;
}
```

### パフォーマンス監視
- アプリ起動時間
- プロンプト生成時間
- ストレージ操作時間
- メモリ使用量