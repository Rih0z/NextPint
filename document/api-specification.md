# API仕様書

## 概要

NextPintは基本的にローカルアプリとして動作しますが、プロンプトテンプレートの配信や更新のために軽量なAPIを提供します。
このAPIはCloudflare Workersで実装され、プライバシーを重視した設計となっています。

## API設計原則

1. **最小限のデータ交換**: プロンプトテンプレートのみを配信
2. **プライバシー保護**: ユーザーの個人データは送受信しない
3. **キャッシュ最適化**: CDNを活用した高速配信
4. **バージョン管理**: テンプレートのバージョニングサポート

## Base URL

```
Production: https://api.nextpint.app
Development: https://api-dev.nextpint.app
```

## 認証

現在のフェーズでは認証は不要です。将来的にユーザー固有のカスタマイゼーション機能を追加する場合は、JWTベースの認証を検討します。

## エンドポイント

### 1. プロンプトテンプレート取得

#### GET /v1/templates

プロンプトテンプレートの一覧を取得します。

**Request:**
```http
GET /v1/templates?version=1.0.0&category=import&locale=ja-JP
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| version | string | No | クライアントのバージョン |
| category | string | No | テンプレートカテゴリでフィルタ |
| locale | string | No | 言語設定 (デフォルト: ja-JP) |

**Response:**
```json
{
  "status": "success",
  "data": {
    "templates": [
      {
        "id": "import-untappd-v1",
        "name": "Untappdインポート",
        "description": "Untappdのスクリーンショットからビールデータを抽出",
        "category": "import",
        "version": "1.0.0",
        "locale": "ja-JP",
        "template": "以下のUntappdスクリーンショットを分析し、...",
        "variables": [
          {
            "name": "screenshot_description",
            "type": "string",
            "required": true,
            "description": "スクリーンショットの内容説明"
          }
        ],
        "metadata": {
          "supportedAI": ["chatgpt", "claude", "gemini"],
          "estimatedTokens": 150,
          "difficulty": "easy"
        },
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "limit": 20,
      "hasNext": false
    },
    "meta": {
      "latestVersion": "1.0.0",
      "totalCategories": 4
    }
  }
}
```

#### GET /v1/templates/{templateId}

特定のプロンプトテンプレートの詳細を取得します。

**Request:**
```http
GET /v1/templates/import-untappd-v1
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "template": {
      "id": "import-untappd-v1",
      "name": "Untappdインポート",
      "description": "Untappdのスクリーンショットからビールデータを抽出します",
      "category": "import",
      "version": "1.0.0",
      "locale": "ja-JP",
      "template": "あなたはビールデータの専門家です。添付されたUntappdのスクリーンショットを分析し、以下のJSON形式でビール情報を抽出してください。\n\n{{screenshot_description}}\n\n出力形式:\n```json\n{\n  \"beers\": [\n    {\n      \"name\": \"ビール名\",\n      \"brewery\": \"醸造所名\",\n      \"style\": \"ビアスタイル\",\n      \"rating\": 4.2,\n      \"notes\": \"テイスティングノート（あれば）\",\n      \"checkinDate\": \"2024-01-01\"\n    }\n  ]\n}\n```",
      "variables": [
        {
          "name": "screenshot_description",
          "type": "string",
          "required": true,
          "description": "スクリーンショットの内容説明",
          "placeholder": "Untappdのビール履歴画面です。5つのビールが表示されています。"
        }
      ],
      "examples": [
        {
          "input": {
            "screenshot_description": "Untappdの最近のチェックイン画面で、IPAを3つ、ラガーを2つ確認できます。"
          },
          "output": "期待される出力のサンプル..."
        }
      ],
      "metadata": {
        "supportedAI": ["chatgpt", "claude", "gemini"],
        "estimatedTokens": 150,
        "difficulty": "easy",
        "tags": ["import", "untappd", "beer-data"]
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

### 2. システム情報

#### GET /v1/health

APIの稼働状況を確認します。

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00Z",
  "version": "1.0.0",
  "environment": "production"
}
```

#### GET /v1/version

利用可能な最新バージョンを確認します。

**Response:**
```json
{
  "status": "success",
  "data": {
    "latestVersion": "1.0.0",
    "supportedVersions": ["1.0.0"],
    "deprecatedVersions": [],
    "releaseNotes": "初回リリース"
  }
}
```

## データ型定義

### PromptTemplate
```typescript
interface PromptTemplate {
  id: string;                    // 一意識別子
  name: string;                  // 表示名
  description: string;           // 説明
  category: PromptCategory;      // カテゴリ
  version: string;               // バージョン
  locale: string;                // 言語設定
  template: string;              // プロンプトテンプレート本体
  variables: PromptVariable[];   // 変数定義
  examples?: PromptExample[];    // 使用例
  metadata: PromptMetadata;      // メタデータ
  createdAt: string;             // 作成日時
  updatedAt: string;             // 更新日時
}
```

### PromptCategory
```typescript
enum PromptCategory {
  IMPORT = 'import',           // データインポート用
  SEARCH = 'search',           // ビール検索用
  ANALYSIS = 'analysis',       // 分析用
  COMPARISON = 'comparison'    // 比較用
}
```

### PromptVariable
```typescript
interface PromptVariable {
  name: string;                // 変数名
  type: 'string' | 'number' | 'boolean' | 'array';
  required: boolean;           // 必須フラグ
  description: string;         // 説明
  placeholder?: string;        // プレースホルダー
  defaultValue?: any;          // デフォルト値
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}
```

### PromptMetadata
```typescript
interface PromptMetadata {
  supportedAI: string[];       // 対応AIサービス
  estimatedTokens: number;     // 推定トークン数
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];              // タグ
  author?: string;             // 作成者
  language?: string;           // 対象言語
}
```

## エラーレスポンス

### 標準エラー形式
```json
{
  "status": "error",
  "error": {
    "code": "TEMPLATE_NOT_FOUND",
    "message": "指定されたテンプレートが見つかりません",
    "details": {
      "templateId": "invalid-template-id"
    }
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### エラーコード一覧

| Code | HTTP Status | Description |
|------|-------------|-------------|
| TEMPLATE_NOT_FOUND | 404 | テンプレートが存在しない |
| INVALID_VERSION | 400 | サポートされていないバージョン |
| INVALID_CATEGORY | 400 | 無効なカテゴリ |
| INVALID_LOCALE | 400 | サポートされていない言語設定 |
| RATE_LIMIT_EXCEEDED | 429 | レート制限に達した |
| INTERNAL_ERROR | 500 | サーバー内部エラー |

## レート制限

現在のフェーズでは厳しいレート制限は設けませんが、滥用防止のため以下の制限を設けます：

- 1分間に60リクエスト/IP
- 1日に1000リクエスト/IP

## キャッシュ戦略

### CDNキャッシュ
- テンプレート一覧: 1時間
- 個別テンプレート: 24時間
- システム情報: 5分

### クライアントキャッシュ推奨設定
```typescript
interface CacheConfig {
  templates: {
    ttl: number;      // 24時間 (86400秒)
    maxSize: number;  // 100テンプレート
  };
  version: {
    ttl: number;      // 1時間 (3600秒)
  };
}
```

## セキュリティ

### CORS設定
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type, Accept
```

### セキュリティヘッダー
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## API使用例

### JavaScript/TypeScript
```typescript
class NextPintAPI {
  private baseUrl: string;
  
  constructor(baseUrl: string = 'https://api.nextpint.app') {
    this.baseUrl = baseUrl;
  }
  
  async getTemplates(options?: {
    category?: string;
    locale?: string;
    version?: string;
  }): Promise<PromptTemplate[]> {
    const params = new URLSearchParams(options as any);
    const response = await fetch(
      `${this.baseUrl}/v1/templates?${params}`
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data.templates;
  }
  
  async getTemplate(id: string): Promise<PromptTemplate> {
    const response = await fetch(
      `${this.baseUrl}/v1/templates/${id}`
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data.template;
  }
}

// 使用例
const api = new NextPintAPI();

// インポート用テンプレートを取得
const importTemplates = await api.getTemplates({
  category: 'import',
  locale: 'ja-JP'
});

// 特定のテンプレートを取得
const untappdTemplate = await api.getTemplate('import-untappd-v1');
```

## バージョニング

### APIバージョニング
- URLパスでバージョンを指定: `/v1/`, `/v2/`
- 後方互換性を最低1年間維持
- 非推奨機能は6ヶ月前に通知

### テンプレートバージョニング
- セマンティックバージョニングを採用
- メジャー: 破壊的変更
- マイナー: 機能追加
- パッチ: バグ修正

## 監視・ログ

### メトリクス
- リクエスト数
- レスポンス時間
- エラー率
- キャッシュヒット率

### ログ形式
```json
{
  "timestamp": "2024-01-01T12:00:00Z",
  "level": "info",
  "message": "Template requested",
  "templateId": "import-untappd-v1",
  "clientVersion": "1.0.0",
  "userAgent": "NextPint/1.0.0",
  "responseTime": 50
}
```