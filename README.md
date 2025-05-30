# NextPint - AI Beer Discovery Prompt Provider

NextPintは、ビール愛好家向けのAIプロンプトプロバイダーアプリです。ユーザーの好みや状況を理解し、ChatGPT、Claude、Geminiなどの汎用AIサービスで使用できる最適なプロンプトを提供します。

## 🌐 ライブデモ

### Web アプリケーション
- **本番環境**: [https://nextpint-web.pages.dev](https://nextpint-web.pages.dev)
- **最新デプロイ**: [https://9a513b5b.nextpint-web.pages.dev](https://9a513b5b.nextpint-web.pages.dev)
- **プラットフォーム**: Cloudflare Pages
- **デザイン**: Netflix/Uber風モダンダークテーマ

### API エンドポイント
- **ベースURL**: [https://nextpint-api.riho-dare.workers.dev](https://nextpint-api.riho-dare.workers.dev)
- **ヘルスチェック**: [/v1/health](https://nextpint-api.riho-dare.workers.dev/v1/health)
- **プロンプトテンプレート**: [/v1/templates](https://nextpint-api.riho-dare.workers.dev/v1/templates)
- **プラットフォーム**: Cloudflare Workers + D1 Database

## 🍺 特徴

- **プライバシーファースト**: すべてのデータをローカル保存
- **AI中立**: 特定のAIサービスに依存しない設計  
- **パーソナライゼーション**: ユーザーの好みを学習・反映
- **クロスプラットフォーム**: React NativeによるiOS/Android対応
- **モダンデザイン**: Netflix/Uber風ダークテーマ
- **高パフォーマンス**: Cloudflare Edge配信

## 🛠️ 技術スタック

### フロントエンド
- **React Native**: モバイルアプリ（iOS/Android）
- **Next.js 15**: Webアプリケーション
- **TypeScript**: 型安全な開発
- **Tailwind CSS v4**: モダンスタイリング

### バックエンド
- **Cloudflare Workers**: サーバーレスAPI
- **Hono**: 軽量Webフレームワーク
- **D1 Database**: SQLiteベースクラウドDB

### インフラ
- **Cloudflare Pages**: Webアプリホスティング
- **Cloudflare Workers**: API実行環境  
- **GitHub**: ソースコード管理・CI/CD

## 🚀 クイックスタート

### 前提条件

- Node.js 18.0以降
- npm 8.0以降 または Yarn 1.22以降
- Xcode 14.0以降（iOS開発用）
- Android Studio 2022.1以降（Android開発用）

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/Rih0z/NextPint.git
cd NextPint

# 依存関係のインストール
npm install
# または
yarn install

# iOS依存関係のインストール（macOSのみ）
cd ios
pod install
cd ..
```

### React Native モバイルアプリの起動

```bash
# Metro bundlerの起動
npm start

# iOSシミュレーターで実行
npm run ios

# Androidエミュレーターで実行
npm run android
```

### Web版の開発・デプロイ

```bash
# Web版ディレクトリに移動
cd web

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# 本番ビルド
npm run build

# Cloudflare Pagesへデプロイ
npx wrangler pages deploy out --project-name=nextpint-web
```

### API の開発・デプロイ

```bash
# APIディレクトリに移動
cd api

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# データベースのセットアップ
npm run setup

# Cloudflare Workersへデプロイ
npm run deploy
```

## 📁 プロジェクト構造

```
NextPint/
├── src/                    # React Native モバイルアプリ
│   ├── components/         # 再利用可能なUIコンポーネント
│   ├── screens/           # 画面コンポーネント
│   ├── services/          # ビジネスロジックとデータ管理
│   ├── navigation/        # ナビゲーション設定
│   ├── hooks/            # カスタムReactフック
│   ├── types/            # TypeScript型定義
│   └── utils/            # ユーティリティ関数と定数
├── web/                   # Next.js Webアプリケーション
│   ├── src/app/          # App Routerベースのページ
│   ├── src/services/     # APIサービスとストレージ
│   ├── src/types/        # 共通型定義
│   └── src/app/globals.css # モダンデザインシステム
├── api/                   # Cloudflare Workers API
│   ├── src/              # API実装
│   ├── schema.sql        # D1データベーススキーマ
│   ├── seed.sql          # 初期データ
│   └── wrangler.toml     # Cloudflare設定
└── document/             # 設計ドキュメント
```

## 🧪 テスト

```bash
# テストの実行
npm test

# カバレッジレポート付きテスト
npm run test:coverage

# ウォッチモードでテスト
npm run test:watch
```

## 📖 ドキュメント

詳細なドキュメントは[document](./document)フォルダを参照してください：

- [アーキテクチャ設計書](./document/architecture.md)
- [API仕様書](./document/api-specification.md)
- [データベース設計書](./document/database-design.md)
- [UI/UX設計書](./document/ui-ux-design.md)
- [開発環境セットアップガイド](./document/development-setup.md)

## 🤝 コントリビュート

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 👥 作者

- Rih0z - [@Rih0z](https://github.com/Rih0z)

## 🙏 謝辞

- React Native コミュニティ
- すべてのコントリビューター