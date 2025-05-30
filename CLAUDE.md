# Claude開発ガイドライン

## 🔒 セキュリティチェックリスト

### GitHubへのプッシュ前に必ず確認

1. **APIキー・シークレットの確認**
   - [ ] `.env`ファイルが`.gitignore`に含まれているか
   - [ ] ハードコードされたAPIキーやパスワードがないか
   - [ ] データベースIDやトークンが公開されていないか

2. **個人情報の確認**
   - [ ] 個人のメールアドレスや電話番号が含まれていないか
   - [ ] 本名以外の個人識別情報がないか

3. **設定ファイルの確認**
   - [ ] `wrangler.toml`にシークレット情報が含まれていないか
   - [ ] データベースIDがプレースホルダーのままか

## 📋 作業完了チェックリスト

### 作業完了時に実行

1. **GitHubへの追加**
   ```bash
   git add .
   git commit -m "適切なコミットメッセージ"
   git push origin main
   ```

2. **ビルドとデプロイ**
   ```bash
   # React Nativeアプリ（ローカル環境で実行）
   cd /path/to/NextPint
   npm install
   npm run ios  # または npm run android

   # Cloudflare Workers API
   cd api
   npm install
   npx wrangler login
   npx wrangler d1 create nextpint-db  # 初回のみ
   npm run db:init  # 初回のみ
   npm run db:seed  # 初回のみ
   npm run deploy
   ```

## 🚀 デプロイ手順

### Cloudflare Workersのデプロイ

1. **初回セットアップ**
   - Cloudflareアカウントでログイン
   - D1データベースの作成
   - wrangler.tomlのdatabase_id更新

2. **デプロイコマンド**
   ```bash
   # Production
   npm run deploy

   # Development
   npx wrangler deploy --env development
   ```

3. **デプロイ後の確認**
   - ヘルスチェックエンドポイントの確認
   - テンプレートAPIの動作確認

## ⚠️ 重要な注意事項

- **絶対にシークレット情報をコミットしない**
- **database_idは必ずプレースホルダーのままにする**
- **個人情報を含むファイルは作成しない**
- **デプロイ前に必ずローカルでテストする**