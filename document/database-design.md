# データベース設計書

## 概要

NextPintアプリケーションのデータベース設計について説明します。プライバシーファーストの原則に従い、ユーザーデータは主にローカルストレージ（AsyncStorage）に保存され、オプションでCloudflare D1（SQLite）を使用してプロンプトテンプレートを配信します。

## ストレージ戦略

### ローカルストレージ（AsyncStorage）
- **ユーザープロファイル**: 個人の好み、履歴データ
- **セッションデータ**: 検索セッション、生成されたプロンプト
- **キャッシュデータ**: プロンプトテンプレート、設定情報

### クラウドストレージ（Cloudflare D1）
- **プロンプトテンプレート**: 公開テンプレートの配信
- **システム設定**: アプリ設定、バージョン情報

## ローカルデータベース設計

### 1. UserProfile（ユーザープロファイル）

```sql
-- AsyncStorageキー: user_profile
```

```typescript
interface UserProfile {
  id: string;                    // UUID v4
  version: string;               // データスキーマバージョン
  preferences: UserPreferences;  // ユーザー好み設定
  history: ImportedBeer[];       // インポートしたビール履歴
  sessions: BeerSearchSession[]; // 検索セッション履歴
  settings: UserSettings;        // アプリ設定
  createdAt: Date;              // 作成日時
  updatedAt: Date;              // 更新日時
}

interface UserPreferences {
  favoriteStyles: string[];     // 好きなビアスタイル
  flavorProfile: {              // 味の好み
    hoppy: number;              // ホップ感 (1-5)
    malty: number;              // モルト感 (1-5)
    bitter: number;             // 苦味 (1-5)
    sweet: number;              // 甘味 (1-5)
    sour: number;               // 酸味 (1-5)
    alcohol: number;            // アルコール度数好み (1-5)
  };
  avoidList: string[];          // 避けたい要素
  preferredBreweries: string[]; // 好きな醸造所
  budgetRange: {                // 予算範囲
    min: number;
    max: number;
    currency: string;
  };
  locationPreferences: string[];// 好きな地域
}

interface UserSettings {
  language: string;             // 言語設定
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  dataRetentionDays: number;    // データ保持期間
  aiPreference: string[];       // 好きなAIサービス
}
```

### 2. ImportedBeer（インポート済みビール）

```sql
-- AsyncStorageキー: imported_beers_{userId}
```

```typescript
interface ImportedBeer {
  id: string;                   // UUID v4
  name: string;                 // ビール名
  brewery: string;              // 醸造所名
  style: string;                // ビアスタイル
  rating: number;               // 評価 (1-5)
  abv?: number;                 // アルコール度数
  ibu?: number;                 // 苦味単位
  notes?: string;               // テイスティングノート
  imageUrl?: string;            // ビール画像URL
  source: ImportSource;         // インポート元
  sourceId?: string;            // 元サービスでのID
  checkinDate?: Date;           // チェックイン日時
  location?: string;            // 飲んだ場所
  venue?: string;               // 店舗名
  tags: string[];               // タグ
  importedAt: Date;             // インポート日時
  updatedAt: Date;              // 更新日時
}

enum ImportSource {
  UNTAPPD = 'untappd',
  RATEBEER = 'ratebeer',
  BEERADVOCATE = 'beeradvocate',
  MANUAL = 'manual'
}
```

### 3. BeerSearchSession（検索セッション）

```sql
-- AsyncStorageキー: search_sessions_{userId}
```

```typescript
interface BeerSearchSession {
  sessionId: string;            // UUID v4
  userId: string;               // ユーザーID
  name?: string;                // セッション名
  createdAt: Date;              // 作成日時
  updatedAt: Date;              // 更新日時
  status: SessionStatus;        // セッション状態
  profile: SessionProfile;      // セッションプロファイル
  generatedPrompts: GeneratedPrompt[]; // 生成されたプロンプト
  results?: SessionResult[];    // AI分析結果
  notes?: string;               // メモ
}

enum SessionStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived'
}

interface SessionProfile {
  sessionGoal: string;          // セッション目標
  mood: string;                 // 気分
  tastePreference: {
    primary: string;            // 主要な好み
    avoid: string[];            // 避けたい要素
    intensity: number;          // 強度設定 (1-5)
  };
  constraints: {
    location?: string;          // 場所制限
    budget?: string;            // 予算制限
    availability?: string;      // 入手可能性
    occasion?: string;          // 飲用シーン
    other: string[];            // その他制限
  };
  searchKeywords: string[];     // 検索キーワード
  timeFrame?: {                 // 時間制限
    start?: Date;
    end?: Date;
  };
}

interface GeneratedPrompt {
  id: string;                   // UUID v4
  templateId: string;           // 使用したテンプレートID
  content: string;              // 生成されたプロンプト内容
  variables: Record<string, any>; // 使用した変数
  aiService?: string;           // 使用予定のAIサービス
  generatedAt: Date;            // 生成日時
  usedAt?: Date;                // 使用日時
  copiedCount: number;          // コピー回数
}

interface SessionResult {
  id: string;                   // UUID v4
  promptId: string;             // 使用したプロンプトID
  aiService: string;            // 使用したAIサービス
  input: string;                // AI入力内容
  output: string;               // AI出力内容
  satisfaction: number;         // 満足度 (1-5)
  feedback?: string;            // フィードバック
  processedAt: Date;            // 処理日時
}
```

### 4. PromptTemplateCache（プロンプトテンプレートキャッシュ）

```sql
-- AsyncStorageキー: prompt_templates_cache
```

```typescript
interface PromptTemplateCache {
  templates: CachedTemplate[];
  lastUpdated: Date;
  version: string;
  expiresAt: Date;
}

interface CachedTemplate {
  id: string;
  name: string;
  description: string;
  category: PromptCategory;
  version: string;
  locale: string;
  template: string;
  variables: PromptVariable[];
  metadata: PromptMetadata;
  cachedAt: Date;
}
```

### 5. AppSettings（アプリ設定）

```sql
-- AsyncStorageキー: app_settings
```

```typescript
interface AppSettings {
  version: string;              // 設定バージョン
  firstLaunch: Date;            // 初回起動日時
  lastLaunch: Date;             // 最終起動日時
  launchCount: number;          // 起動回数
  onboardingCompleted: boolean; // オンボーディング完了フラグ
  dataBackupEnabled: boolean;   // データバックアップ有効
  analyticsEnabled: boolean;    // 分析データ収集有効
  crashReportingEnabled: boolean; // クラッシュレポート有効
  autoUpdateTemplates: boolean; // テンプレート自動更新
  cacheSettings: {
    maxCacheSize: number;       // 最大キャッシュサイズ
    cacheRetentionDays: number; // キャッシュ保持期間
  };
}
```

## クラウドデータベース設計（Cloudflare D1）

### 1. prompt_templates（プロンプトテンプレート）

```sql
CREATE TABLE prompt_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  version TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'ja-JP',
  template TEXT NOT NULL,
  variables TEXT, -- JSON配列
  metadata TEXT,  -- JSONオブジェクト
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX idx_templates_category ON prompt_templates(category);
CREATE INDEX idx_templates_locale ON prompt_templates(locale);
CREATE INDEX idx_templates_version ON prompt_templates(version);
CREATE INDEX idx_templates_active ON prompt_templates(is_active);
```

### 2. template_versions（テンプレートバージョン）

```sql
CREATE TABLE template_versions (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL,
  version TEXT NOT NULL,
  changelog TEXT,
  is_latest BOOLEAN DEFAULT false,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (template_id) REFERENCES prompt_templates(id)
);

-- インデックス
CREATE UNIQUE INDEX idx_template_version ON template_versions(template_id, version);
CREATE INDEX idx_latest_version ON template_versions(is_latest);
```

### 3. template_categories（テンプレートカテゴリ）

```sql
CREATE TABLE template_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4. app_versions（アプリバージョン）

```sql
CREATE TABLE app_versions (
  version TEXT PRIMARY KEY,
  min_supported_version TEXT,
  release_notes TEXT,
  is_latest BOOLEAN DEFAULT false,
  force_update BOOLEAN DEFAULT false,
  released_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## データ操作API

### ローカルストレージ操作

```typescript
class LocalStorageService {
  // ユーザープロファイル
  async saveUserProfile(profile: UserProfile): Promise<void>;
  async getUserProfile(): Promise<UserProfile | null>;
  async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<void>;
  
  // ビール履歴
  async addImportedBeer(beer: ImportedBeer): Promise<void>;
  async getImportedBeers(filter?: BeerFilter): Promise<ImportedBeer[]>;
  async updateImportedBeer(id: string, updates: Partial<ImportedBeer>): Promise<void>;
  async deleteImportedBeer(id: string): Promise<void>;
  
  // セッション管理
  async createSession(session: BeerSearchSession): Promise<void>;
  async getSessions(filter?: SessionFilter): Promise<BeerSearchSession[]>;
  async updateSession(sessionId: string, updates: Partial<BeerSearchSession>): Promise<void>;
  async deleteSession(sessionId: string): Promise<void>;
  
  // プロンプト管理
  async cacheTemplates(templates: CachedTemplate[]): Promise<void>;
  async getCachedTemplates(): Promise<CachedTemplate[]>;
  async clearTemplateCache(): Promise<void>;
  
  // 設定管理
  async saveAppSettings(settings: AppSettings): Promise<void>;
  async getAppSettings(): Promise<AppSettings>;
}
```

### データ検索・フィルタリング

```typescript
interface BeerFilter {
  styles?: string[];
  breweries?: string[];
  ratingRange?: { min: number; max: number; };
  dateRange?: { start: Date; end: Date; };
  sources?: ImportSource[];
  searchText?: string;
}

interface SessionFilter {
  status?: SessionStatus[];
  dateRange?: { start: Date; end: Date; };
  categories?: string[];
  searchText?: string;
}
```

## データマイグレーション

### マイグレーション戦略

```typescript
interface MigrationScript {
  version: string;
  description: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
}

class DataMigrationService {
  private migrations: MigrationScript[] = [
    {
      version: '1.0.0',
      description: '初期データ構造',
      up: async () => { /* 初期設定 */ },
      down: async () => { /* ロールバック */ }
    },
    {
      version: '1.1.0',
      description: 'フレーバープロファイル追加',
      up: async () => { /* フレーバー設定を追加 */ },
      down: async () => { /* フレーバー設定を削除 */ }
    }
  ];
  
  async migrate(): Promise<void>;
  async rollback(version: string): Promise<void>;
  async getCurrentVersion(): Promise<string>;
}
```

## データバックアップ・復元

### バックアップ形式

```typescript
interface DataBackup {
  version: string;
  createdAt: Date;
  userProfile: UserProfile;
  importedBeers: ImportedBeer[];
  sessions: BeerSearchSession[];
  settings: AppSettings;
  checksum: string; // データ整合性チェック
}

class BackupService {
  async createBackup(): Promise<DataBackup>;
  async restoreBackup(backup: DataBackup): Promise<void>;
  async validateBackup(backup: DataBackup): Promise<boolean>;
  async exportToJSON(): Promise<string>;
  async importFromJSON(json: string): Promise<void>;
}
```

## パフォーマンス最適化

### インデックス戦略
1. **頻繁なクエリにインデックス作成**
   - ビールスタイル別検索
   - 醸造所別検索
   - 日付範囲検索

2. **メモリ使用量最適化**
   - 大きなオブジェクトの分割保存
   - 不要なデータの定期削除
   - 画像データの圧縮

### キャッシュ戦略
```typescript
interface CacheConfig {
  templates: {
    ttl: number;        // 24時間
    maxSize: number;    // 100件
  };
  userProfiles: {
    ttl: number;        // 永続化
    maxSize: number;    // 1件
  };
  sessions: {
    ttl: number;        // 30日
    maxSize: number;    // 1000件
  };
}
```

## セキュリティ考慮事項

### データ暗号化
```typescript
class EncryptionService {
  async encryptUserData(data: any): Promise<string>;
  async decryptUserData(encryptedData: string): Promise<any>;
  async generateDeviceKey(): Promise<string>;
}
```

### データ検証
```typescript
class DataValidator {
  validateUserProfile(profile: UserProfile): ValidationResult;
  validateImportedBeer(beer: ImportedBeer): ValidationResult;
  validateSession(session: BeerSearchSession): ValidationResult;
  sanitizeInput(input: string): string;
}
```

## 監視・ログ

### データベース操作ログ
```typescript
interface DatabaseLog {
  operation: 'read' | 'write' | 'delete';
  table: string;
  recordCount: number;
  executionTime: number;
  timestamp: Date;
  error?: string;
}
```

### パフォーマンス監視
- ストレージ使用量
- 読み書き速度
- キャッシュヒット率
- エラー発生率