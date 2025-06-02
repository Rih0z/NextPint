# Cloudflare Pages デプロイメント設定

## 必要な準備

### 1. Cloudflareアカウントの準備

1. [Cloudflare](https://cloudflare.com) にサインアップ
2. Cloudflare Dashboardにログイン

### 2. API Tokenの作成

1. Cloudflare Dashboard → 右上のプロフィール → "My Profile"
2. "API Tokens" タブ → "Create Token"
3. "Custom token" を選択し、以下の権限を設定：
   - **Account** - Cloudflare Pages:Edit
   - **Zone** - Page Rules:Edit (オプション、カスタムドメイン使用時)
4. トークンを作成してコピー

### 3. Account IDの取得

1. Cloudflare Dashboard → 任意のドメインを選択（または"Workers & Pages"）
2. 右側のサイドバーに表示される "Account ID" をコピー

### 4. GitHubシークレットの設定

GitHubリポジトリで以下のシークレットを設定：

1. リポジトリの Settings → Secrets and variables → Actions
2. "New repository secret" をクリック
3. 以下のシークレットを追加：
   - `CLOUDFLARE_API_TOKEN`: 上記で作成したAPIトークン
   - `CLOUDFLARE_ACCOUNT_ID`: 上記で確認したAccount ID

## デプロイ方法

### 自動デプロイ（推奨）

mainブランチにプッシュすると自動的にデプロイされます：

```bash
git add .
git commit -m "Deploy to Cloudflare Pages"
git push origin main
```

### 手動デプロイ

GitHub Actionsから手動でデプロイ：

1. GitHubリポジトリ → Actions タブ
2. "Deploy to Cloudflare Pages" ワークフロー
3. "Run workflow" → "Run workflow" をクリック

## ローカルでのテスト

```bash
# ビルドテスト
npm run build
npm run pages:build

# ローカルプレビュー（Wranglerログインが必要）
npm run preview
```

## カスタムドメインの設定

1. Cloudflare Dashboard → Workers & Pages → nextpint
2. "Custom domains" タブ
3. "Set up a custom domain" をクリック
4. ドメインを入力して設定

## 環境変数の設定

Cloudflare Pagesで環境変数を設定する場合：

1. Cloudflare Dashboard → Workers & Pages → nextpint
2. "Settings" → "Environment variables"
3. 必要な環境変数を追加

## トラブルシューティング

### ビルドエラーの場合

1. ローカルで `npm run build` が成功するか確認
2. Node.jsバージョンが18以上か確認
3. `.next` と `.vercel` ディレクトリを削除してリトライ

### デプロイエラーの場合

1. GitHub Secretsが正しく設定されているか確認
2. Cloudflare API Tokenの権限が適切か確認
3. プロジェクト名が既に使用されていないか確認

## 参考リンク

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [@cloudflare/next-on-pages](https://github.com/cloudflare/next-on-pages)
- [Next.js on Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/nextjs/)