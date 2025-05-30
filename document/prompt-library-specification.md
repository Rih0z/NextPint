# プロンプトライブラリ仕様書

## 概要

NextPintアプリケーションの核となるプロンプトライブラリの設計と実装について詳述します。このライブラリは、ユーザーの好みや状況に応じて最適化されたAI用プロンプトを生成・管理する機能を提供します。

## プロンプトライブラリの原則

### 1. AI中立性
- ChatGPT、Claude、Gemini等で共通利用可能
- 特定のAIサービスに依存しない汎用的な記述
- 各AIの特性に応じたプロンプト微調整機能

### 2. 日本語最適化
- 日本のビール文化・市場に特化
- 日本語の自然な表現とコンテキスト
- 日本の醸造所・ビアスタイルへの対応

### 3. パーソナライゼーション
- ユーザーの履歴データに基づく最適化
- 好みの学習と反映機能
- セッション情報の適応的活用

## プロンプトカテゴリ

### 1. データインポートプロンプト (Import Prompts)

#### 1.1 Untappdインポートプロンプト
```typescript
const untappdImportPrompt: PromptTemplate = {
  id: 'import-untappd-v1',
  name: 'Untappdデータインポート',
  category: 'import',
  description: 'Untappdのスクリーンショットからビールデータを抽出',
  template: `
あなたはビールデータの専門家です。添付されたUntappdのスクリーンショットを分析し、以下のJSON形式でビール情報を抽出してください。

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
\`\`\`json
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
\`\`\`

**注意事項**
- 確実に判読できる情報のみ抽出してください
- 不明な項目は null として記録してください
- 日本語のビール名・醸造所名は正確に記録してください
`,
  variables: [
    {
      name: 'screenshot_description',
      type: 'string',
      required: true,
      description: 'スクリーンショットの内容説明'
    }
  ]
};
```

#### 1.2 RateBeerインポートプロンプト
```typescript
const ratebeerImportPrompt: PromptTemplate = {
  id: 'import-ratebeer-v1',
  name: 'RateBeerデータインポート',
  category: 'import',
  description: 'RateBeerのスクリーンショットからビールデータを抽出',
  template: `
あなたはビールデータの専門家です。RateBeerのスクリーンショットを分析し、ビール情報をJSON形式で抽出してください。

**画像の内容**
{{screenshot_description}}

**RateBeer特有の情報を含めて抽出**
- Overall Rating（総合評価）
- Style Rating（スタイル評価） 
- ABV（アルコール度数）
- IBU（苦味単位）
- Style（正確なビアスタイル分類）

**出力形式**
\`\`\`json
{
  "beers": [
    {
      "name": "ビール名",
      "brewery": "醸造所名",
      "style": "正確なビアスタイル",
      "overallRating": 85,
      "styleRating": 90,
      "abv": 5.2,
      "ibu": 45,
      "reviewDate": "2024-01-01",
      "notes": "レビューコメント"
    }
  ]
}
\`\`\`
`,
  variables: [
    {
      name: 'screenshot_description',
      type: 'string',
      required: true,
      description: 'RateBeerスクリーンショットの内容説明'
    }
  ]
};
```

### 2. ビール検索プロンプト (Search Prompts)

#### 2.1 基本検索プロンプト
```typescript
const basicSearchPrompt: PromptTemplate = {
  id: 'search-basic-v1',
  name: '基本ビール検索',
  category: 'search',
  description: '基本的な条件でビールを検索',
  template: `
あなたはビールの専門家です。以下の条件に最適なビールを3つ提案してください。

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
- 私の好みの履歴を考慮して提案してください
`,
  variables: [
    {
      name: 'session_goal',
      type: 'string',
      required: true,
      description: 'セッションの目的'
    },
    {
      name: 'location',
      type: 'string',
      required: false,
      description: '場所・地域制限'
    },
    {
      name: 'budget',
      type: 'string',
      required: false,
      description: '予算制限'
    },
    {
      name: 'taste_preferences',
      type: 'string',
      required: true,
      description: '味の好み'
    },
    {
      name: 'avoid_list',
      type: 'string',
      required: false,
      description: '避けたい要素'
    },
    {
      name: 'user_history_summary',
      type: 'string',
      required: false,
      description: 'ユーザーのビール履歴サマリー'
    }
  ]
};
```

#### 2.2 冒険的検索プロンプト
```typescript
const adventurousSearchPrompt: PromptTemplate = {
  id: 'search-adventurous-v1',
  name: '冒険的ビール検索',
  category: 'search',
  description: '新しいスタイルや挑戦的なビールを検索',
  template: `
あなたは革新的なビールの専門家です。私に新しいビール体験を提供してください。

**私の現在の好み**
好きなスタイル: {{favorite_styles}}
好きな味の要素: {{flavor_profile}}

**冒険の方向性**
{{adventure_direction}}

**制約条件**
場所: {{location}}
予算: {{budget}}
挑戦レベル: {{challenge_level}} (1=少し冒険, 5=完全に未知)

**私のビール経験**
{{user_experience_level}}

**提案してほしいこと**
1. **段階的チャレンジ**: 私の好みから少しずつ広げる3つのビール
2. **味の解説**: なぜそのビールが次のステップに適しているか
3. **飲み方のコツ**: 初めてのスタイルを楽しむためのアドバイス

**回答形式**
### ステップ1: [安全な冒険] - [ビール名]
- **現在の好みとの共通点**: 
- **新しい要素**: 
- **期待できる味わい**: 

### ステップ2: [中程度の冒険] - [ビール名]
### ステップ3: [大きな冒険] - [ビール名]

**飲み比べのススメ**
[3つのビールを比較して味わう方法やポイント]
`,
  variables: [
    {
      name: 'favorite_styles',
      type: 'string',
      required: true,
      description: '現在好きなビアスタイル'
    },
    {
      name: 'flavor_profile',
      type: 'string',
      required: true,
      description: '好きな味の要素'
    },
    {
      name: 'adventure_direction',
      type: 'string',
      required: true,
      description: '冒険の方向性（より苦く、より酸っぱく、等）'
    },
    {
      name: 'challenge_level',
      type: 'number',
      required: true,
      description: '挑戦レベル（1-5）'
    },
    {
      name: 'user_experience_level',
      type: 'string',
      required: false,
      description: 'ユーザーのビール経験レベル'
    }
  ]
};
```

### 3. 分析プロンプト (Analysis Prompts)

#### 3.1 好み分析プロンプト
```typescript
const preferenceAnalysisPrompt: PromptTemplate = {
  id: 'analysis-preferences-v1',
  name: 'ビール好み分析',
  category: 'analysis',
  description: 'ユーザーの好みパターンを分析',
  template: `
あなたはビールテイスティングの専門家です。以下の私のビール履歴を分析し、好みのパターンを明確にしてください。

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
- **低評価の共通点**: 
`,
  variables: [
    {
      name: 'beer_history',
      type: 'string',
      required: true,
      description: 'ユーザーのビール履歴データ（JSON形式）'
    }
  ]
};
```

#### 3.2 トレンド分析プロンプト
```typescript
const trendAnalysisPrompt: PromptTemplate = {
  id: 'analysis-trends-v1',
  name: 'ビールトレンド分析',
  category: 'analysis',
  description: '現在のビールトレンドと個人の関係性を分析',
  template: `
あなたはビール業界のトレンドアナリストです。私のビール履歴と現在のトレンドを比較分析してください。

**私のビール履歴（最近6ヶ月）**
{{recent_history}}

**分析の視点**
1. **現在のトレンドとの一致度**: 私がトレンドを先取りしているか追従しているか
2. **見落としているトレンド**: まだ試していない注目のスタイルや醸造所
3. **私の影響力**: 私の好みが周りに与える影響の可能性

**現在注目すべきトレンド（参考情報）**
- クラフトビールの多様化
- サステナブル醸造
- ローカル醸造所の成長
- 新しいホップ品種
- 日本の醸造技術の向上

**回答形式**
## 🌊 あなたとビールトレンドの関係

### 📍 現在位置
- **トレンド適合度**: [先駆者/追従者/独自路線]
- **探索レベル**: [保守的/バランス型/冒険的]

### 🔥 見逃しているホットトレンド
1. **[トレンド名]**: [なぜ注目されているか、なぜあなたに合うか]
2. **[トレンド名]**: 
3. **[トレンド名]**: 

### 🎯 トレンドを活用したおすすめアクション
- **今月試すべきビール**: 
- **注目すべき醸造所**: 
- **参加すべきイベント**: 

### 🏆 あなたの先見性
- **早めに気づいていたトレンド**: 
- **友人におすすめできるポイント**: 
`,
  variables: [
    {
      name: 'recent_history',
      type: 'string',
      required: true,
      description: '最近6ヶ月のビール履歴'
    }
  ]
};
```

### 4. 比較検討プロンプト (Comparison Prompts)

#### 4.1 ビール比較プロンプト
```typescript
const beerComparisonPrompt: PromptTemplate = {
  id: 'comparison-beers-v1',
  name: 'ビール比較分析',
  category: 'comparison',
  description: '複数のビールを詳細比較',
  template: `
あなたはビールテイスティングの専門家です。以下のビールを多角的に比較分析してください。

**比較対象ビール**
{{beer_list}}

**比較の目的**
{{comparison_purpose}}

**私の好み参考情報**
{{user_preferences}}

**比較してほしい観点**
1. **味わいの違い**: 具体的な味の差異
2. **スタイルの特徴**: 各スタイルの代表性
3. **価格パフォーマンス**: コストと満足度
4. **入手しやすさ**: 購入の容易さ
5. **飲むシーン**: どんな時に適しているか

**回答形式**
## 🔍 ビール比較分析

### 📋 基本情報比較
| 項目 | [ビール1] | [ビール2] | [ビール3] |
|------|----------|----------|----------|
| スタイル | | | |
| ABV | | | |
| IBU | | | |
| 価格帯 | | | |

### 👅 テイスティング比較
**[ビール1名]**
- 香り: 
- 味わい: 
- 後味: 
- 総合印象: 

**[ビール2名]**
**[ビール3名]**

### 🎯 あなたへのおすすめ度
1. **[順位1位]**: ⭐⭐⭐⭐⭐
   - 理由: 
   - いつ飲むべき: 

2. **[順位2位]**: ⭐⭐⭐⭐☆
3. **[順位3位]**: ⭐⭐⭐☆☆

### 💡 飲み比べのコツ
- **順番**: [どの順番で飲むと良いか]
- **ペアリング**: [それぞれに合う食べ物]
- **注意点**: [温度、グラス等の注意事項]
`,
  variables: [
    {
      name: 'beer_list',
      type: 'string',
      required: true,
      description: '比較したいビールのリスト'
    },
    {
      name: 'comparison_purpose',
      type: 'string',
      required: true,
      description: '比較の目的（どちらを買うか、等）'
    },
    {
      name: 'user_preferences',
      type: 'string',
      required: false,
      description: 'ユーザーの好み情報'
    }
  ]
};
```

## プロンプト生成エンジン

### 1. テンプレート処理システム

```typescript
class PromptGenerator {
  private templates: Map<string, PromptTemplate>;
  private userProfile: UserProfile;
  
  constructor(templates: PromptTemplate[], userProfile: UserProfile) {
    this.templates = new Map(templates.map(t => [t.id, t]));
    this.userProfile = userProfile;
  }
  
  async generatePrompt(
    templateId: string, 
    variables: Record<string, any>,
    sessionContext?: BeerSearchSession
  ): Promise<GeneratedPrompt> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }
    
    // 変数の検証
    this.validateVariables(template, variables);
    
    // ユーザーコンテキストの自動注入
    const enhancedVariables = await this.enhanceWithUserContext(
      variables, 
      template, 
      sessionContext
    );
    
    // プロンプト生成
    const content = this.interpolateTemplate(template.template, enhancedVariables);
    
    return {
      id: generateUUID(),
      templateId,
      content,
      variables: enhancedVariables,
      generatedAt: new Date(),
      copiedCount: 0
    };
  }
  
  private validateVariables(template: PromptTemplate, variables: Record<string, any>): void {
    for (const variable of template.variables) {
      if (variable.required && !variables[variable.name]) {
        throw new Error(`Required variable missing: ${variable.name}`);
      }
      
      if (variable.validation) {
        this.validateVariable(variables[variable.name], variable.validation);
      }
    }
  }
  
  private async enhanceWithUserContext(
    variables: Record<string, any>,
    template: PromptTemplate,
    sessionContext?: BeerSearchSession
  ): Promise<Record<string, any>> {
    const enhanced = { ...variables };
    
    // ユーザー履歴サマリーの自動注入
    if (template.template.includes('{{user_history_summary}}') && !enhanced.user_history_summary) {
      enhanced.user_history_summary = await this.generateHistorySummary();
    }
    
    // 好みプロファイルの自動注入
    if (template.template.includes('{{user_preferences}}') && !enhanced.user_preferences) {
      enhanced.user_preferences = this.generatePreferencesSummary();
    }
    
    // セッションコンテキストの注入
    if (sessionContext) {
      enhanced.session_context = this.generateSessionContext(sessionContext);
    }
    
    return enhanced;
  }
  
  private interpolateTemplate(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match;
    });
  }
}
```

### 2. パーソナライゼーション機能

```typescript
class PersonalizationEngine {
  async customizePrompt(
    basePrompt: string,
    userProfile: UserProfile,
    context: PersonalizationContext
  ): Promise<string> {
    let customized = basePrompt;
    
    // 好みに基づく調整
    customized = this.adjustForPreferences(customized, userProfile.preferences);
    
    // 経験レベルに基づく調整
    customized = this.adjustForExperience(customized, userProfile.history);
    
    // 地域に基づく調整
    customized = this.adjustForLocation(customized, context.location);
    
    return customized;
  }
  
  private adjustForPreferences(prompt: string, preferences: UserPreferences): string {
    // 好きなスタイルの強調
    if (preferences.favoriteStyles.length > 0) {
      const styleHint = `特に${preferences.favoriteStyles.join('、')}系のビールを好む傾向があります。`;
      return prompt.replace('{{user_preferences}}', styleHint);
    }
    
    return prompt;
  }
  
  private adjustForExperience(prompt: string, history: ImportedBeer[]): string {
    const experienceLevel = this.calculateExperienceLevel(history);
    
    if (experienceLevel === 'beginner') {
      return prompt.replace(
        '専門的な表現で',
        '初心者にもわかりやすい表現で'
      );
    } else if (experienceLevel === 'expert') {
      return prompt.replace(
        '基本的な説明も含めて',
        '詳細な技術的説明も含めて'
      );
    }
    
    return prompt;
  }
}
```

### 3. プロンプト最適化システム

```typescript
class PromptOptimizer {
  async optimizeForAI(prompt: string, aiService: string): Promise<string> {
    switch (aiService) {
      case 'chatgpt':
        return this.optimizeForChatGPT(prompt);
      case 'claude':
        return this.optimizeForClaude(prompt);
      case 'gemini':
        return this.optimizeForGemini(prompt);
      default:
        return prompt;
    }
  }
  
  private optimizeForChatGPT(prompt: string): string {
    // ChatGPT用の最適化
    return prompt
      .replace(/\*\*(.*?)\*\*/g, '**$1**') // 太字の統一
      .replace(/^## /gm, '### '); // ヘッダーレベルの調整
  }
  
  private optimizeForClaude(prompt: string): string {
    // Claude用の最適化
    return `Human: ${prompt}\n\nAssistant: `;
  }
  
  private optimizeForGemini(prompt: string): string {
    // Gemini用の最適化
    return prompt.replace(/```json/g, '```json\n');
  }
}
```

## プロンプトテンプレート管理

### 1. テンプレートバージョニング

```typescript
interface TemplateVersion {
  version: string;
  changelog: string;
  template: PromptTemplate;
  isActive: boolean;
  createdAt: Date;
}

class TemplateManager {
  async updateTemplate(templateId: string, newVersion: PromptTemplate): Promise<void> {
    // バージョンの検証
    const currentVersion = await this.getCurrentVersion(templateId);
    if (!this.isValidVersionUpgrade(currentVersion.version, newVersion.version)) {
      throw new Error('Invalid version upgrade');
    }
    
    // 新バージョンの保存
    await this.saveTemplateVersion(templateId, newVersion);
    
    // ユーザーへの通知
    await this.notifyTemplateUpdate(templateId, newVersion);
  }
  
  async rollbackTemplate(templateId: string, targetVersion: string): Promise<void> {
    const version = await this.getTemplateVersion(templateId, targetVersion);
    if (!version) {
      throw new Error('Version not found');
    }
    
    await this.activateTemplateVersion(templateId, targetVersion);
  }
}
```

### 2. テンプレート配信システム

```typescript
class TemplateDistributor {
  async syncTemplates(): Promise<TemplateUpdateResult> {
    try {
      // リモートから最新テンプレートを取得
      const remoteTemplates = await this.fetchRemoteTemplates();
      
      // ローカルテンプレートと比較
      const updates = await this.compareTemplates(remoteTemplates);
      
      // 更新の適用
      const results = await this.applyUpdates(updates);
      
      return {
        success: true,
        updatedCount: results.length,
        updates: results
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async fetchRemoteTemplates(): Promise<PromptTemplate[]> {
    const response = await fetch('/api/v1/templates', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': `NextPint/${APP_VERSION}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch templates: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data.templates;
  }
}
```

## 品質保証・テスト

### 1. プロンプトテスト

```typescript
interface PromptTestCase {
  name: string;
  templateId: string;
  variables: Record<string, any>;
  expectedOutput: {
    contains: string[];
    notContains: string[];
    structure: 'json' | 'markdown' | 'text';
  };
}

class PromptTester {
  async runTests(testCases: PromptTestCase[]): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    for (const testCase of testCases) {
      const result = await this.runSingleTest(testCase);
      results.push(result);
    }
    
    return results;
  }
  
  private async runSingleTest(testCase: PromptTestCase): Promise<TestResult> {
    try {
      const generator = new PromptGenerator(this.templates, this.testUserProfile);
      const prompt = await generator.generatePrompt(
        testCase.templateId,
        testCase.variables
      );
      
      const validations = [
        this.validateContent(prompt.content, testCase.expectedOutput),
        this.validateStructure(prompt.content, testCase.expectedOutput.structure),
        this.validateVariableReplacement(prompt.content, testCase.variables)
      ];
      
      return {
        testName: testCase.name,
        passed: validations.every(v => v.passed),
        errors: validations.filter(v => !v.passed).map(v => v.error)
      };
    } catch (error) {
      return {
        testName: testCase.name,
        passed: false,
        errors: [error.message]
      };
    }
  }
}
```

### 2. A/Bテスト機能

```typescript
class PromptABTester {
  async createABTest(
    name: string,
    templateA: PromptTemplate,
    templateB: PromptTemplate,
    config: ABTestConfig
  ): Promise<ABTest> {
    return {
      id: generateUUID(),
      name,
      templateA,
      templateB,
      config,
      status: 'active',
      startedAt: new Date(),
      results: {
        variantA: { usageCount: 0, satisfactionScore: 0 },
        variantB: { usageCount: 0, satisfactionScore: 0 }
      }
    };
  }
  
  async selectVariant(testId: string, userId: string): Promise<'A' | 'B'> {
    const test = await this.getABTest(testId);
    const userHash = this.hashUserId(userId);
    
    // 一貫性のあるバリアント選択
    return userHash % 2 === 0 ? 'A' : 'B';
  }
  
  async recordUsage(testId: string, variant: 'A' | 'B', satisfaction: number): Promise<void> {
    const test = await this.getABTest(testId);
    
    if (variant === 'A') {
      test.results.variantA.usageCount++;
      test.results.variantA.satisfactionScore = this.updateSatisfactionScore(
        test.results.variantA.satisfactionScore,
        test.results.variantA.usageCount,
        satisfaction
      );
    } else {
      test.results.variantB.usageCount++;
      test.results.variantB.satisfactionScore = this.updateSatisfactionScore(
        test.results.variantB.satisfactionScore,
        test.results.variantB.usageCount,
        satisfaction
      );
    }
    
    await this.saveABTest(test);
  }
}
```

## 監視・分析

### 1. プロンプト使用分析

```typescript
class PromptAnalytics {
  async trackPromptUsage(promptId: string, templateId: string, context: UsageContext): Promise<void> {
    const event: PromptUsageEvent = {
      promptId,
      templateId,
      userId: context.userId,
      sessionId: context.sessionId,
      aiService: context.aiService,
      copiedAt: new Date(),
      variables: context.variables
    };
    
    await this.logEvent(event);
    await this.updateUsageStats(templateId);
  }
  
  async trackPromptFeedback(promptId: string, feedback: PromptFeedback): Promise<void> {
    await this.logEvent({
      type: 'prompt_feedback',
      promptId,
      satisfaction: feedback.satisfaction,
      comment: feedback.comment,
      timestamp: new Date()
    });
    
    await this.updateTemplateScore(promptId, feedback.satisfaction);
  }
  
  async generateUsageReport(period: DateRange): Promise<UsageReport> {
    const events = await this.getUsageEvents(period);
    
    return {
      period,
      totalUsage: events.length,
      topTemplates: this.calculateTopTemplates(events),
      aiServiceDistribution: this.calculateAIDistribution(events),
      satisfactionTrend: this.calculateSatisfactionTrend(events),
      conversionRate: this.calculateConversionRate(events)
    };
  }
}
```

### 2. パフォーマンス監視

```typescript
class PromptPerformanceMonitor {
  async measureGenerationTime(templateId: string, variables: Record<string, any>): Promise<number> {
    const startTime = performance.now();
    
    await this.generatePrompt(templateId, variables);
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    await this.logPerformanceMetric({
      templateId,
      operation: 'generation',
      duration,
      timestamp: new Date()
    });
    
    return duration;
  }
  
  async monitorTemplateSize(): Promise<TemplateSizeReport> {
    const templates = await this.getAllTemplates();
    
    return {
      totalCount: templates.length,
      averageSize: this.calculateAverageSize(templates),
      largestTemplates: this.findLargestTemplates(templates, 5),
      sizeDistribution: this.calculateSizeDistribution(templates)
    };
  }
}
```

## セキュリティ・プライバシー

### 1. テンプレート検証

```typescript
class TemplateValidator {
  validateTemplate(template: PromptTemplate): ValidationResult {
    const errors: string[] = [];
    
    // 悪意のあるコンテンツチェック
    if (this.containsMaliciousContent(template.template)) {
      errors.push('Template contains potentially malicious content');
    }
    
    // PII漏洩チェック
    if (this.containsPII(template.template)) {
      errors.push('Template may leak personal information');
    }
    
    // 変数検証
    const variableErrors = this.validateVariables(template.variables);
    errors.push(...variableErrors);
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  private containsMaliciousContent(content: string): boolean {
    const maliciousPatterns = [
      /system.*prompt/i,
      /ignore.*previous.*instructions/i,
      /jailbreak/i
    ];
    
    return maliciousPatterns.some(pattern => pattern.test(content));
  }
}
```

### 2. データ匿名化

```typescript
class DataAnonymizer {
  anonymizeUserData(data: Record<string, any>): Record<string, any> {
    const anonymized = { ...data };
    
    // 個人識別情報の除去
    delete anonymized.userId;
    delete anonymized.email;
    delete anonymized.name;
    
    // ハッシュ化
    if (data.userId) {
      anonymized.userHash = this.hashUserId(data.userId);
    }
    
    return anonymized;
  }
  
  private hashUserId(userId: string): string {
    return crypto.createHash('sha256').update(userId).digest('hex').substring(0, 16);
  }
}
```