# NextPint API - Cloudflare Workers

NextPintアプリのバックエンドAPI。Cloudflare WorkersとD1データベースを使用して、プロンプトテンプレートを配信します。

## 🚀 セットアップ

### 1. 依存関係のインストール

```bash
cd api
npm install
```

### 2. Cloudflareアカウントの設定

```bash
# Cloudflareにログイン
npx wrangler login
```

### 3. D1データベースの作成

```bash
# データベースを作成
npx wrangler d1 create nextpint-db

# 作成されたデータベースIDをwrangler.tomlに設定
# database_id = "YOUR_DATABASE_ID" を実際のIDに置き換え
```

### 4. データベースの初期化

```bash
# スキーマの作成
npm run db:init

# 初期データの投入
npm run db:seed
```

### 5. ローカル開発

```bash
# 開発サーバーの起動
npm run dev
```

### 6. デプロイ

```bash
# プロダクション環境へのデプロイ
npm run deploy

# 開発環境へのデプロイ
npx wrangler deploy --env development
```

## 📁 プロジェクト構造

```
api/
├── src/
│   ├── index.ts          # エントリーポイント
│   └── routes/           # APIルート
│       ├── templates.ts  # テンプレートエンドポイント
│       └── health.ts     # ヘルスチェック
├── schema.sql            # データベーススキーマ
├── seed.sql              # 初期データ
├── wrangler.toml         # Cloudflare設定
└── package.json          # プロジェクト設定
```

## 🔗 APIエンドポイント

### ヘルスチェック
- `GET /v1/health` - APIの稼働状況
- `GET /v1/health/version` - バージョン情報

### プロンプトテンプレート
- `GET /v1/templates` - テンプレート一覧
  - Query params: `category`, `locale`, `version`
- `GET /v1/templates/:id` - 特定のテンプレート

## 🔧 環境変数

### wrangler.tomlで設定
- `ENVIRONMENT` - 環境名 (production/development)
- `API_VERSION` - APIバージョン

### D1データベース
- `DB` - D1データベースバインディング

## 📝 カスタムドメイン設定

1. Cloudflareダッシュボードでドメインを追加
2. Workers Routesで以下を設定：
   - Production: `api.nextpint.app/*`
   - Development: `api-dev.nextpint.app/*`

## 🧪 テスト

```bash
# 型チェック
npm run type-check

# ローカルAPIテスト
curl http://localhost:8787/v1/health
curl http://localhost:8787/v1/templates
```

## 🚨 トラブルシューティング

### D1データベースエラー
```bash
# データベースの再作成
npx wrangler d1 list
npx wrangler d1 execute nextpint-db --command "SELECT * FROM prompt_templates"
```

### デプロイエラー
```bash
# ログの確認
npx wrangler tail
```