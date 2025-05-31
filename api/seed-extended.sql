-- Enhanced prompt templates based on project proposal

INSERT INTO prompt_templates (id, name, description, category, version, locale, template, variables, metadata) VALUES
  -- Review Analysis Prompts
  (
    'analysis-review-v1',
    'ビールレビュー分析',
    'ビールレビューから味のプロファイルを分析',
    'analysis',
    '1.0.0',
    'ja-JP',
    'あなたはビールテイスティングの専門家です。以下のビールレビューを分析し、構造化された味のプロファイルを作成してください。

**分析対象レビュー**
{{review_text}}

**分析項目**
1. **外観** (色合い、泡立ち、透明度)
2. **香り** (ホップ、モルト、フルーツ、スパイスなど)
3. **味わい** (甘味、苦味、酸味、塩味、うま味のバランス)
4. **口当たり** (ボディ、炭酸感、アルコール感)
5. **総合評価** (バランス、複雑さ、飲みやすさ)

**出力形式**
```json
{
  "appearance": {
    "color": "色の表現",
    "clarity": "透明度",
    "head": "泡の状態"
  },
  "aroma": {
    "hop_character": "ホップの香り(1-5)",
    "malt_character": "モルトの香り(1-5)",
    "fruity": "フルーティさ(1-5)",
    "floral": "花の香り(1-5)",
    "spicy": "スパイシーさ(1-5)"
  },
  "taste": {
    "sweetness": "甘味(1-5)",
    "bitterness": "苦味(1-5)",
    "sourness": "酸味(1-5)",
    "saltiness": "塩味(1-5)",
    "umami": "うま味(1-5)"
  },
  "mouthfeel": {
    "body": "ボディ感(light/medium/full)",
    "carbonation": "炭酸感(1-5)",
    "alcohol_warmth": "アルコール感(1-5)"
  },
  "overall": {
    "balance": "バランス(1-5)",
    "complexity": "複雑さ(1-5)",
    "drinkability": "飲みやすさ(1-5)",
    "summary": "一言で表現した味の特徴"
  }
}
```',
    '[{"name":"review_text","type":"string","required":true,"description":"分析したいビールレビューのテキスト"}]',
    '{"supportedAI":["chatgpt","claude","gemini"],"estimatedTokens":250,"difficulty":"medium","tags":["analysis","review","taste-profile"]}'
  ),

  -- Beer Comparison Prompts
  (
    'comparison-multiple-v1',
    'ビール比較検討',
    '複数のビールを比較して最適な選択をサポート',
    'comparison',
    '1.0.0',
    'ja-JP',
    'あなたはビールソムリエです。以下のビール候補を比較分析し、最適な選択をサポートしてください。

**比較対象**
{{beer_list}}

**選択基準**
- **目的**: {{selection_purpose}}
- **予算**: {{budget_range}}
- **味の好み**: {{taste_preference}}
- **シーン**: {{drinking_scene}}
- **重視する要素**: {{priority_factors}}

**比較分析表**
| 項目 | ビール1 | ビール2 | ビール3 |
|------|---------|---------|---------|
| **スタイル** | | | |
| **ABV** | | | |
| **IBU** | | | |
| **価格** | | | |
| **入手しやすさ** | | | |
| **味の特徴** | | | |
| **食事との相性** | | | |

**詳細分析**
### 各ビールの特徴
{{beer_analysis}}

### あなたへのおすすめ順位
1. **第1位**: [ビール名]
   - **選定理由**: 
   - **おすすめポイント**: 
   - **注意点**: 

2. **第2位**: [ビール名]
   - **選定理由**: 
   - **第1位との違い**: 

3. **第3位**: [ビール名]
   - **選定理由**: 
   - **どんな時におすすめか**: 

### まとめ
最終的に{{selection_purpose}}であれば、**[推奨ビール名]**が最適です。理由は[具体的な理由]です。',
    '[{"name":"beer_list","type":"string","required":true,"description":"比較したいビールのリスト"},{"name":"selection_purpose","type":"string","required":true,"description":"選択の目的"},{"name":"budget_range","type":"string","required":false,"description":"予算範囲"},{"name":"taste_preference","type":"string","required":false,"description":"味の好み"},{"name":"drinking_scene","type":"string","required":false,"description":"飲むシーン"},{"name":"priority_factors","type":"string","required":false,"description":"重視する要素"}]',
    '{"supportedAI":["chatgpt","claude","gemini"],"estimatedTokens":400,"difficulty":"hard","tags":["comparison","decision-support","recommendation"]}'
  ),

  -- Advanced Search Prompts
  (
    'search-advanced-v1',
    'アドバンス検索',
    '詳細な条件と好み学習を活用した高度な検索',
    'search',
    '1.0.0',
    'ja-JP',
    'あなたは高度なビール推薦システムです。私の詳細な情報を基に、最適なビールを推薦してください。

**現在のリクエスト**
- **目的**: {{session_goal}}
- **気分**: {{mood_description}}
- **制約条件**: {{constraints}}

**私の詳細プロファイル**
- **好みの味**: {{flavor_profile}}
- **過去の高評価ビール**: {{favorite_beers}}
- **避けたい要素**: {{avoid_elements}}
- **冒険度**: {{adventure_level}}
- **経験レベル**: {{experience_level}}

**季節・環境要因**
- **現在の季節**: {{current_season}}
- **飲む場所**: {{drinking_location}}
- **一緒に飲む人**: {{drinking_companions}}
- **食事との組み合わせ**: {{food_pairing}}

**推薦アルゴリズム実行**

### 🎯 メイン推薦 (最もマッチ度の高い1つ)
**[ビール名] / [醸造所名]**
- **マッチ度**: ★★★★★ (5/5)
- **選定アルゴリズム**: [なぜこのビールが選ばれたか]
- **味の予測**: [あなたが感じるであろう味]
- **リスク要因**: [懸念点があれば]

### 🔄 代替案 (異なるアプローチの2つ)
**案1: 安全な選択**
- [保守的だが確実に気に入りそうなビール]

**案2: 挑戦的な選択**  
- [新しい体験を提供できるビール]

### 📊 推薦の信頼度
- **データ根拠**: [推薦の根拠となったデータ]
- **確信度**: [推薦の確信度 %]
- **学習ポイント**: [今回の選択から学べること]

### 🎯 次回への提案
飲んだ後は以下を記録すると、より精度の高い推薦が可能になります：
- 実際の味の感想
- 評価点数 (1-5)
- また飲みたいかどうか',
    '[{"name":"session_goal","type":"string","required":true,"description":"今回の目的"},{"name":"mood_description","type":"string","required":true,"description":"現在の気分"},{"name":"constraints","type":"string","required":false,"description":"制約条件"},{"name":"flavor_profile","type":"string","required":false,"description":"詳細な味の好み"},{"name":"favorite_beers","type":"string","required":false,"description":"過去の高評価ビール"},{"name":"avoid_elements","type":"string","required":false,"description":"避けたい要素"},{"name":"adventure_level","type":"string","required":false,"description":"冒険度"},{"name":"experience_level","type":"string","required":false,"description":"ビール経験レベル"},{"name":"current_season","type":"string","required":false,"description":"現在の季節"},{"name":"drinking_location","type":"string","required":false,"description":"飲む場所"},{"name":"drinking_companions","type":"string","required":false,"description":"一緒に飲む人"},{"name":"food_pairing","type":"string","required":false,"description":"食事との組み合わせ"}]',
    '{"supportedAI":["chatgpt","claude","gemini"],"estimatedTokens":500,"difficulty":"expert","tags":["search","advanced","personalization","machine-learning"]}'
  ),

  -- Data Import for Beer Advocate
  (
    'import-ratebeer-v1',
    'RateBeerインポート',
    'RateBeerのスクリーンショットからビールデータを抽出',
    'import',
    '1.0.0',
    'ja-JP',
    'あなたはビールデータベースの専門家です。RateBeerのスクリーンショット画像を分析し、ビール履歴データを抽出してください。

**画像分析指示**
{{screenshot_description}}

**RateBeer特有の要素に注意**
- 評価は通常5点満点または10点満点
- "Overall"スコアを主評価として使用
- Style、Aroma、Appearance、Taste、Palate、Overallの詳細評価があることが多い
- 醸造所の国籍情報が表示される場合が多い

**抽出対象データ**
1. ビール名 (正確な表記)
2. 醸造所名 (Brewery)
3. ビアスタイル (Style)
4. 総合評価 (Overall score)
5. 詳細評価 (もしあれば)
6. レビュー日付
7. レビューテキスト (あれば)
8. 醸造所の国・地域

**出力JSON形式**
```json
{
  "source": "ratebeer",
  "extraction_date": "2024-01-01",
  "beers": [
    {
      "name": "正確なビール名",
      "brewery": "醸造所名",
      "brewery_country": "国名",
      "style": "ビアスタイル",
      "overall_rating": 4.2,
      "detailed_ratings": {
        "aroma": 4.0,
        "appearance": 4.5,
        "taste": 4.0,
        "palate": 4.0
      },
      "review_date": "YYYY-MM-DD",
      "review_text": "レビューテキスト(あれば)",
      "abv": "アルコール度数(あれば)",
      "ibu": "IBU値(あれば)"
    }
  ]
}
```

**品質チェック**
- ビール名の表記ゆれに注意
- 評価スケールの統一 (5点満点に正規化)
- 日付形式の統一',
    '[{"name":"screenshot_description","type":"string","required":true,"description":"RateBeerスクリーンショットの内容説明"}]',
    '{"supportedAI":["chatgpt","claude","gemini"],"estimatedTokens":180,"difficulty":"medium","tags":["import","ratebeer","beer-data"]}'
  ),

  -- Seasonal/Event Search
  (
    'search-seasonal-v1',
    '季節・イベント特化検索',
    '季節やイベントに特化したビール検索',
    'search',
    '1.0.0',
    'ja-JP',
    'あなたは季節とビールのペアリング専門家です。以下の条件に最適な季節感のあるビールを提案してください。

**検索条件**
- **時期**: {{season_or_event}}
- **具体的な用途**: {{specific_purpose}}
- **参加人数**: {{group_size}}
- **予算**: {{budget_per_person}}
- **場所**: {{location_type}}

**季節/イベント考慮要素**
- **気温・湿度**: {{weather_conditions}}
- **食事メニュー**: {{food_menu}}
- **イベントの雰囲気**: {{event_atmosphere}}
- **時間帯**: {{time_of_day}}

**私の基本好み**
{{user_preferences}}

### 🌸 シーズンマッチング分析

**今回の{{season_or_event}}に最適な理由**
1. **季節性**: [なぜこの時期にぴったりか]
2. **雰囲気**: [イベント・雰囲気との調和]
3. **食事相性**: [季節料理との組み合わせ]
4. **温度感**: [最適な提供温度と季節の関係]

### 🍺 季節別推薦ビール

**メイン推薦**
- **ビール名**: [季節に最もマッチするビール]
- **季節性スコア**: ★★★★★
- **なぜ今がベストタイミングか**: 
- **楽しみ方の提案**: 
- **ペアリング提案**: 

**サブ推薦 (2-3個)**
[季節の異なる側面を楽しめる選択肢]

### 🎉 イベント演出アイデア
- **グラス選び**: [最適なグラスタイプ]
- **温度管理**: [提供温度の提案]
- **盛り付け**: [季節感のある演出]
- **楽しみ方**: [イベントを盛り上げる飲み方]

### 📅 季節カレンダー
今後の{{season_or_event}}関連でのおすすめタイミング：
- [次におすすめの時期とビール]',
    '[{"name":"season_or_event","type":"string","required":true,"description":"季節やイベント(桜の季節、クリスマス、BBQなど)"},{"name":"specific_purpose","type":"string","required":true,"description":"具体的な用途"},{"name":"group_size","type":"string","required":false,"description":"参加人数"},{"name":"budget_per_person","type":"string","required":false,"description":"一人当たり予算"},{"name":"location_type","type":"string","required":false,"description":"場所のタイプ"},{"name":"weather_conditions","type":"string","required":false,"description":"気温・湿度条件"},{"name":"food_menu","type":"string","required":false,"description":"食事メニュー"},{"name":"event_atmosphere","type":"string","required":false,"description":"イベントの雰囲気"},{"name":"time_of_day","type":"string","required":false,"description":"時間帯"},{"name":"user_preferences","type":"string","required":false,"description":"ユーザーの基本好み"}]',
    '{"supportedAI":["chatgpt","claude","gemini"],"estimatedTokens":450,"difficulty":"medium","tags":["search","seasonal","event","pairing"]}'
  );

-- Update existing templates to mark them as enhanced
UPDATE prompt_templates SET 
  metadata = JSON_SET(metadata, '$.enhanced', true),
  updated_at = CURRENT_TIMESTAMP
WHERE category IN ('import', 'search', 'analysis', 'comparison');