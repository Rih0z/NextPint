# NextPint - AI Beer Discovery Prompt Provider

NextPintは、ビール愛好家向けのAIプロンプトプロバイダーWebアプリケーションです。ユーザーの好みや状況を理解し、ChatGPT、Claude、Geminiなどの汎用AIサービスで使用できる最適なビール発見プロンプトを提供します。

## 🌐 公開URL

### Webアプリケーション
- **Cloudflare Pages**: デプロイ後、自動生成されるURLでアクセス可能
- **デザイン**: モダンダークテーマ（グラスモーフィズム）

## 🍺 特徴

- **プライバシーファースト**: すべてのデータをローカル保存
- **AI中立**: 特定のAIサービスに依存しない設計  
- **AI-Driven Personalization**: 適応学習によるリアルタイム個人化
- **4ステップウィザード**: 直感的なセッション作成体験
- **プロンプトライブラリ**: テンプレート検索・活用
- **分析ダッシュボード**: 個人の嗜好分析・成長追跡
- **2025年版モダンUI**: Dark Mode First + Glassmorphism + Modern Skeuomorphism
- **高度なマイクロインタラクション**: framer-motionによる流体的アニメーション
- **レスポンシブデザイン**: スマートフォン・タブレット・PC対応

## 🛠️ 技術スタック

### フロントエンド
- **Next.js 14**: React ベースWebアプリケーション
- **TypeScript**: 型安全な開発
- **Tailwind CSS**: モダンスタイリング
- **framer-motion**: 高度なアニメーション・インタラクション
- **lucide-react**: アイコンライブラリ
- **react-icons**: 補完アイコンライブラリ
- **react-i18next**: 国際化対応

### バックエンド
- **Cloudflare Workers**: サーバーレスAPI（将来実装予定）
- **ローカルストレージ**: クライアントサイドデータ保存

### インフラ
- **Cloudflare Pages**: Webアプリホスティング
- **GitHub**: ソースコード管理・CI/CD

## 🚀 クイックスタート

### 前提条件

- Node.js 18.0以降
- npm 8.0以降 または Yarn 1.22以降

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/NextPint.git
cd NextPint

# 依存関係のインストール
npm install
# または
yarn install

# 必須依存関係のインストール
npm install lucide-react react-icons framer-motion react-i18next
```

### 開発サーバーの起動

```bash
# 開発サーバーの起動
npm run dev
# または
yarn dev

# ブラウザで http://localhost:3000 を開く
```

### 本番ビルド

```bash
# 本番ビルド
npm run build
# または
yarn build

# ビルド結果のプレビュー
npm run start
# または
yarn start
```

### Cloudflare Pagesへのデプロイ

```bash
# Next.js on Pagesでビルド
npm run pages:build

# Cloudflare Pagesにデプロイ
npm run deploy
```

## 📁 プロジェクト構造

```
NextPint/
├── src/                      # ソースコード
│   ├── app/                  # Next.js App Router
│   │   ├── globals.css       # グローバルスタイル
│   │   ├── layout.tsx        # ルートレイアウト
│   │   ├── page.tsx          # ランディングページ
│   │   ├── home/             # ホーム画面
│   │   ├── sessions/         # セッション管理
│   │   │   ├── create/       # セッション作成
│   │   │   └── [id]/         # セッション詳細
│   │   ├── import/           # データインポート
│   │   ├── prompts/          # プロンプトライブラリ
│   │   └── analytics/        # 分析ダッシュボード
│   ├── components/           # 再利用可能なUIコンポーネント
│   │   ├── ui/               # 基本UIコンポーネント
│   │   │   ├── Button.tsx    # ボタンコンポーネント
│   │   │   ├── Card.tsx      # カードコンポーネント
│   │   │   ├── Input.tsx     # 入力フィールド
│   │   │   └── web/          # Web専用コンポーネント
│   │   ├── Navigation.tsx    # ナビゲーション
│   │   └── DataImportWizard.tsx # インポートウィザード
│   ├── services/             # ビジネスロジック
│   │   ├── storage/          # ローカルストレージ管理
│   │   ├── analytics/        # 分析機能
│   │   └── prompt/           # プロンプト生成
│   ├── types/                # TypeScript型定義
│   │   ├── beer.ts
│   │   ├── session.ts
│   │   └── index.ts
│   ├── utils/                # ユーティリティ関数
│   │   ├── constants/        # 定数定義
│   │   └── formatting/       # フォーマット関数
│   └── hooks/                # カスタムReactフック
├── public/                   # 静的ファイル
├── DESIGN_DOCUMENT.md        # UI/UX実装仕様書
├── USER_EXPERIENCE_DOCUMENT.md # UX設計書
├── tailwind.config.ts        # Tailwind設定
├── next.config.js           # Next.js設定
└── package.json             # 依存関係
```

## 🎨 デザインシステム

### カラーパレット
- **Primary Colors**: Blue系（#3B82F6, #60A5FA, #2563EB）
- **Background**: Slate系ダーク（#020617, #0F172A, #1E293B）  
- **Text**: White系（#FFFFFF, #CBD5E1, #94A3B8）
- **Glass Colors**: Glassmorphism専用色（rgba(255,255,255,0.1)等）
- **Beer Colors**: ビールテーマ色（amber, gold, copper, dark, foam）
- **Neon Colors**: AI・モダンアクセント色（blue, purple, pink, green, cyan）

### コンポーネント
- **グラスモーフィズム**: `bg-slate-800/50 backdrop-blur-sm`
- **グラデーション**: `bg-gradient-to-r from-blue-500 to-blue-600`
- **2025年版コンポーネント**: Button2025, Card2025, Navigation2025等
- **3D Effects**: transform-gpu, perspective-1000
- **Modern Skeuomorphism**: neumorphism効果
- **AI-Driven UI**: パーソナライゼーション対応
- **マイクロインタラクション**: framer-motionベースの流体的アニメーション

### アイコン
- **ライブラリ**: lucide-react
- **サイズ**: 16px (w-4 h-4) ～ 64px (w-16 h-16)
- **主要アイコン**: Beer, Search, Home, Sparkles, Target等

## 📱 主要機能

### 1. セッション作成（4ステップウィザード）
```
Step 1: 目標設定 → Step 2: 味の好み → Step 3: 詳細設定 → Step 4: プロンプト生成
```

### 2. データインポート
- **AIアシスタント方式**: ガイド付き対話型
- **ファイルアップロード方式**: ドラッグ&ドロップ

### 3. プロンプトライブラリ
- テンプレート検索・閲覧
- カテゴリ別フィルタリング
- お気に入り機能

### 4. 分析ダッシュボード
- 個人統計（試したビール数、セッション数等）
- パーソナリティ診断
- 傾向分析とインサイト

### 5. AI-Driven Personalization
- 適応型レイアウトシステム
- プロアクティブUI提案
- 動的コンテンツ個人化
- リアルタイム学習機能
- AIインサイト・推奨システム

### 6. モダンUI/UX機能
- Dark Mode First設計
- Glassmorphism + Modern Skeuomorphism
- 高度なマイクロインタラクション
- GPU最適化アニューション
- レスポンシブデザイン

## 🧪 テスト

```bash
# テストの実行
npm test
# または
yarn test

# ウォッチモードでテスト
npm run test:watch
# または
yarn test:watch
```

## 📖 開発ガイドライン

### コーディング規則
1. **TypeScript**: 型安全な実装を徹底
2. **コンポーネント設計**: 再利用可能な設計・SOLID原則の遵守
3. **ステート管理**: useState、カスタムフック、ServiceFactoryパターンを活用
4. **スタイリング**: Tailwind CSSクラスを使用（2025年版カスタムクラス含む）
5. **アイコン**: react-iconsではなくlucide-reactを使用
6. **アニメーション**: framer-motionを使用、GPU最適化を意識
7. **AI機能**: PersonalizationServiceを経由したAI機能の統合
8. **ダークモード**: Dark Mode First設計・OLED最適化

### ファイル命名規則
- **コンポーネント**: PascalCase（例: `DataImportWizard.tsx`）
- **ファイル**: camelCase（例: `useAppSettings.ts`）
- **定数**: SCREAMING_SNAKE_CASE（例: `BUDGET_MIN`）

### コミット規則
- **feat**: 新機能追加
- **fix**: バグ修正
- **style**: UI/スタイル変更
- **refactor**: リファクタリング
- **docs**: ドキュメント更新

## 🔒 プライバシー・セキュリティ

### データ保護
- **ローカル保存**: すべてのユーザーデータはブラウザのlocalStorageに保存
- **外部送信なし**: ユーザーデータは外部サーバーに送信されません
- **透明性**: データの保存・利用方法を明示

### セキュリティ対策
- **XSS対策**: React標準のエスケープ機能
- **HTTPS**: 本番環境では必ずHTTPS
- **依存関係**: 定期的な脆弱性スキャン

## 🤖 AI・パーソナライゼーション機能

### PersonalizationService
- **AI推薦エンジン**: ユーザーの好み・コンテキストを学習
- **リアルタイム分析**: 時間帯・季節・気分に応じた推薦
- **動的インサイト**: AIが生成するパーソナライズされた提案
- **適応学習**: ユーザー行動に応じて継続的に改善

### カスタムフック
- **useDarkMode**: OLED最適化ダークモード管理
- **useAnimations**: GPU最適化アニメーション制御
- **usePersonalization**: AIパーソナライゼーションデータ管理
- **useNotification**: スマート通知システム
- **useResponsive**: アダプティブレスポンシブデザイン

## 🎨 2025年版UIコンポーネント

### コアコンポーネント
- **Button2025**: マイクロインタラクション搭載ボタン
- **Card2025**: Glassmorphism + 3D効果カード
- **Modal2025**: 空間デザイン対応モーダル
- **Navigation2025**: AI提案機能付きナビゲーション
- **LoadingSpinner2025**: AIテーマローディングアニメーション

### デザイン特徴
- **Dark Mode First**: OLED最適化絶対黒背景
- **Glassmorphism**: backdrop-filterと透明度を活用
- **Modern Skeuomorphism**: ニューモーフィズム効果
- **フルードアニメーション**: framer-motionベースの流体的動作

## 🤝 コントリビュート

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'feat: Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

### 開発参加時の注意事項
- **UI/UX実装仕様書**: `DESIGN_DOCUMENT.md`に従って実装
- **UX設計書**: `USER_EXPERIENCE_DOCUMENT.md`を参考にユーザー体験を考慮
- **テスト**: 新機能には適切なテストを追加
- **アクセシビリティ**: WCAG 2.1 AAレベルを目標

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 👥 作者

- **開発者**: [あなたの名前]
- **GitHub**: [@yourusername](https://github.com/yourusername)

## 🙏 謝辞

- React・Next.jsコミュニティ
- Tailwind CSSチーム
- lucide-reactメンテナー
- すべてのコントリビューター

## 📞 サポート

- **バグ報告**: [GitHub Issues](https://github.com/yourusername/NextPint/issues)
- **機能要望**: [GitHub Discussions](https://github.com/yourusername/NextPint/discussions)
- **質問**: README内容で解決しない場合はIssueを作成

---

**NextPint** - AI技術でビール発見体験を革新する