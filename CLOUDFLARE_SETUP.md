# Cloudflare Pages - nodejs_compat フラグの設定方法

## エラーの解決方法

現在表示されているエラーを解決するには、Cloudflare Dashboardで`nodejs_compat`フラグを有効にする必要があります。

### 手順

1. **Cloudflare Dashboardにログイン**
   - https://dash.cloudflare.com にアクセス
   - アカウントにログイン

2. **Pagesプロジェクトに移動**
   - 左サイドバーから「Workers & Pages」をクリック
   - 「nextpint」プロジェクトをクリック

3. **Settings（設定）タブに移動**
   - プロジェクトページの上部にある「Settings」タブをクリック

4. **Functions（関数）セクションを探す**
   - 下にスクロールして「Functions」セクションを見つける

5. **Compatibility Flags（互換性フラグ）を設定**
   - 「Compatibility flags」の項目を見つける
   - 「Configure Production compatibility flags」をクリック
   - 「+ Add flag」をクリック
   - 入力欄に `nodejs_compat` と入力
   - 「Save」をクリック

6. **Preview環境にも同じ設定を適用**
   - 「Configure Preview compatibility flags」でも同じ手順を繰り返す
   - `nodejs_compat` フラグを追加
   - 「Save」をクリック

7. **再デプロイ（必要な場合）**
   - 設定後、自動的に反映されるはずですが、反映されない場合は再デプロイ：
   ```bash
   npm run deploy
   ```

### 確認方法

設定が完了したら、ブラウザでアプリケーションを再度開いてください：
https://nextpint.pages.dev

エラーが解消され、アプリケーションが正常に表示されるはずです。

### トラブルシューティング

もし設定後もエラーが続く場合：

1. ブラウザのキャッシュをクリア
2. 別のブラウザで試す
3. 5分程度待ってから再度アクセス（設定の反映に時間がかかる場合があります）

### 補足情報

`nodejs_compat`フラグは、Next.jsアプリケーションがCloudflare Workers環境でNode.js APIを使用できるようにするための重要な設定です。このフラグにより、以下のNode.js組み込みモジュールが利用可能になります：

- `node:buffer`
- `node:async_hooks`
- その他のNode.js互換API

この設定は、@cloudflare/next-on-pagesを使用するすべてのNext.jsアプリケーションで必要です。