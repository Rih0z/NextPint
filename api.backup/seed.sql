-- カテゴリの初期データ
INSERT INTO template_categories (id, name, description, sort_order) VALUES
  ('import', 'データインポート', 'ビールデータをインポートするためのプロンプト', 1),
  ('search', 'ビール検索', 'ビールを探すためのプロンプト', 2),
  ('analysis', '分析', '好みやトレンドを分析するためのプロンプト', 3),
  ('comparison', '比較', 'ビールを比較検討するためのプロンプト', 4);

-- プロンプトテンプレートの初期データ
INSERT INTO prompt_templates (id, name, description, category, version, locale, template, variables, metadata) VALUES
  (
    'import-untappd-v1',
    'Untappdインポート',
    'Untappdのスクリーンショットからビールデータを抽出します',
    'import',
    '1.0.0',
    'ja-JP',
    'あなたはビールデータの専門家です。添付されたUntappdのスクリーンショットを分析し、以下のJSON形式でビール情報を抽出してください。

**画像の内容**
{{screenshot_description}}

**抽出してほしい情報**
- ビール名
- 醸造所名
- ビアスタイル
- 評価（星の数）
- チェックイン日時
- テイスティングノート（あれば）

**出力形式**
```json
{
  "beers": [
    {
      "name": "ビール名",
      "brewery": "醸造所名",
      "style": "ビアスタイル",
      "rating": 4.2,
      "checkinDate": "2024-01-01",
      "notes": "テイスティングノート（あれば）",
      "venue": "飲んだ場所（あれば）"
    }
  ]
}
```

**注意事項**
- 確実に判読できる情報のみ抽出してください
- 不明な項目は null として記録してください
- 日本語のビール名・醸造所名は正確に記録してください',
    '[{"name":"screenshot_description","type":"string","required":true,"description":"スクリーンショットの内容説明","placeholder":"Untappdのビール履歴画面です。5つのビールが表示されています。"}]',
    '{"supportedAI":["chatgpt","claude","gemini"],"estimatedTokens":150,"difficulty":"easy","tags":["import","untappd","beer-data"]}'
  ),
  (
    'search-basic-v1',
    '基本ビール検索',
    '基本的な条件でビールを検索',
    'search',
    '1.0.0',
    'ja-JP',
    'あなたはビールの専門家です。以下の条件に最適なビールを3つ提案してください。

**検索条件**
目的: {{session_goal}}
場所・地域: {{location}}
予算: {{budget}}
好みの味: {{taste_preferences}}
避けたい要素: {{avoid_list}}

**私のビール履歴（参考情報）**
{{user_history_summary}}

**提案形式**
各ビールについて以下の形式で回答してください：

### 1. [ビール名] / [醸造所名]
- **スタイル**: [ビアスタイル]
- **特徴**: [味わいの特徴]
- **なぜオススメか**: [選定理由]
- **入手方法**: [購入できる場所や方法]
- **価格の目安**: [価格帯]

**注意事項**
- 実在するビールのみ提案してください
- 指定した地域で入手可能なものを優先してください
- 私の好みの履歴を考慮して提案してください',
    '[{"name":"session_goal","type":"string","required":true,"description":"セッションの目的"},{"name":"location","type":"string","required":false,"description":"場所・地域制限"},{"name":"budget","type":"string","required":false,"description":"予算制限"},{"name":"taste_preferences","type":"string","required":true,"description":"味の好み"},{"name":"avoid_list","type":"string","required":false,"description":"避けたい要素"},{"name":"user_history_summary","type":"string","required":false,"description":"ユーザーのビール履歴サマリー"}]',
    '{"supportedAI":["chatgpt","claude","gemini"],"estimatedTokens":200,"difficulty":"medium","tags":["search","basic","recommendation"]}'
  ),
  (
    'analysis-preferences-v1',
    'ビール好み分析',
    'ユーザーの好みパターンを分析',
    'analysis',
    '1.0.0',
    'ja-JP',
    'あなたはビールテイスティングの専門家です。以下の私のビール履歴を分析し、好みのパターンを明確にしてください。

**私のビール履歴**
{{beer_history}}

**分析してほしいポイント**
1. **好みのスタイル傾向**: 高評価を付けたビールの共通点
2. **味の好み**: ホップ、モルト、酸味、甘味などの傾向
3. **醸造所の傾向**: よく飲む醸造所や地域
4. **評価パターン**: 評価基準の特徴
5. **成長の軌跡**: 好みの変化や広がり

**回答形式**
## 📊 あなたのビール好み分析

### 🎯 コアな好み
- **最も好きなスタイル**: [分析結果]
- **好みの味の要素**: [ホップ感、モルト感、etc.]
- **評価が高いビールの共通点**: [具体的な特徴]

### 📈 好みの傾向
- **冒険度**: [保守的 or 冒険的]
- **地域志向**: [地ビール好き or 海外ビール好き]
- **価格志向**: [価格と評価の関係性]

### 🔮 おすすめの次のステップ
- **まだ試していない好みそうなスタイル**: 
- **好きになりそうな醸造所**: 
- **次に挑戦すべき味の要素**: 

### ⚠️ 注意すべき傾向
- **避ける傾向があるもの**: 
- **低評価の共通点**: ',
    '[{"name":"beer_history","type":"string","required":true,"description":"ユーザーのビール履歴データ（JSON形式）"}]',
    '{"supportedAI":["chatgpt","claude","gemini"],"estimatedTokens":300,"difficulty":"hard","tags":["analysis","preferences","personalization"]}'
  );

-- アプリバージョンの初期データ
INSERT INTO app_versions (version, min_supported_version, release_notes, is_latest) VALUES
  ('1.0.0', '1.0.0', '初回リリース - プロンプトテンプレート配信機能', true);