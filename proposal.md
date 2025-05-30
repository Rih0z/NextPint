# AI Beer Discovery Prompt Provider - Project Proposal

## プロジェクト概要

ビール愛好家向けのAIプロンプトプロバイダーシステム。ユーザーの好みや状況を理解し、ChatGPT、Claude、Geminiなどの汎用AIサービスで使用できる最適なプロンプトを提供する。

## コアコンセプト

### 基本原則
- **提案はしない**: アプリは決してビールを推薦しない。プロンプトのみを提供
- **ユーザー主導**: すべての意思決定はユーザーが行う
- **AIサービス中立**: 特定のAIに依存せず、どのAIでも使えるプロンプトを提供
- **プライバシー重視**: すべてのデータはローカル保存、外部API連携なし

### 主要機能

1. **ビール履歴インポート**
   - Untappd、Beer Advocate、RateBeerのスクリーンショットをAIで分析
   - 構造化されたJSON形式でデータを取り込み
   - ユーザーの好みを自動的に学習

2. **セッションベース探索**
   ```typescript
   interface BeerSearchSession {
     sessionId: string
     createdAt: Date
     profile: {
       sessionGoal: string  // "新しいスタイルを試したい"
       mood: string         // "冒険的" | "安定志向" | "リラックス"
       tastePreference: {
         primary: string    // "ホッピー" | "モルティ" | "バランス"
         avoid: string[]    // ["酸味", "スモーキー"]
       }
       constraints: {
         location: string   // "渋谷周辺"
         budget: string     // "1杯1000円以下"
         other: string[]    // ["飛行機持ち込み可能", "缶ビールのみ"]
       }
       searchKeywords: string[]  // ["IPA", "地元産", "限定"]
     }
   }
   ```

3. **プロンプトライブラリ**
   - データインポート用プロンプト
   - ビール検索用プロンプト
   - レビュー分析用プロンプト
   - 比較検討用プロンプト

4. **コンテキスト管理**
   - セッション履歴の保持
   - 過去の探索パターンの学習
   - 好みの進化を追跡

## データフロー

```
1. スクリーンショット撮影（ユーザー）
   ↓
2. プロンプト提供（アプリ）
   ↓
3. AI分析（ChatGPT等）
   ↓
4. JSON結果貼り付け（ユーザー）
   ↓
5. データ保存・学習（アプリ）
   ↓
6. 次回のプロンプト最適化
```

## 技術スタック案

### フロントエンド
- **React Native**: クロスプラットフォーム対応
- **TypeScript**: 型安全性
- **AsyncStorage**: ローカルデータ保存
- **React Navigation**: 画面遷移

### バックエンド（オプション）
- **Cloudflare Workers**: エッジでの軽量処理
- **D1**: SQLiteベースのデータストレージ
- プロンプトテンプレートの配信のみ

### データ構造
```typescript
// ユーザープロファイル
interface UserProfile {
  id: string
  preferences: {
    favoriteStyles: string[]
    flavorProfile: FlavorWheel
    avoidList: string[]
  }
  history: ImportedBeer[]
  sessions: BeerSearchSession[]
}

// インポートされたビール
interface ImportedBeer {
  name: string
  brewery: string
  style: string
  rating: number
  notes?: string
  source: 'untappd' | 'ratebeer' | 'beeradvocate'
  importedAt: Date
}
```

## MVP機能

1. **基本的なデータインポート**
   - Untappdスクリーンショット解析
   - 履歴の保存と表示

2. **シンプルなセッション作成**
   - 目的・気分・制約の入力
   - 基本的なプロンプト生成

3. **プロンプトコピー機能**
   - ワンタップでクリップボードにコピー
   - 使用したプロンプトの履歴

## 将来の拡張可能性

- より高度なプロンプトテンプレート
- 複数言語対応
- プロンプトの共有機能（コミュニティ機能）
- AIレスポンスの自動解析

## プロジェクト名候補

1. **BrewPrompt** - シンプルで直接的
2. **HopGPT** - AI連携を強調
3. **CraftAI** - クラフトビール×AI
4. **PromptHop** - PintHopとの緩い関連性

## 開発フェーズ

### Phase 1: MVP (1ヶ月)
- 基本的なUIの実装
- Untappdインポート機能
- シンプルなプロンプト生成

### Phase 2: 拡張 (2-3ヶ月)
- 複数サービス対応
- セッション管理の高度化
- プロンプトライブラリの充実

### Phase 3: 最適化 (3-4ヶ月)
- 機械学習による個人化
- パフォーマンス改善
- ユーザビリティ向上

## まとめ

このプロジェクトは、元のPintHopとは全く異なる方向性を持つ、新しいタイプのビール探索支援ツールです。AIの力を借りながらも、最終的な判断は常にユーザーに委ねるという哲学で、ビール愛好家の探索体験を豊かにすることを目指します。