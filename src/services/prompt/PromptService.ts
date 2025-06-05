import { IPromptService } from '@/application/factories/ServiceFactory';
import { PromptTemplate, PromptCategory, PromptVariable, SessionProfile } from '@/types';

/**
 * Prompt Service - AI Prompt Generation and Template Management
 * 
 * Core service responsible for:
 * - Generating optimized prompts for AI services
 * - Managing prompt templates
 * - Personalizing prompts based on user data
 * - Supporting multiple AI service formats
 */
export class PromptService implements IPromptService {
  private templates: Map<string, PromptTemplate> = new Map();

  constructor() {
    this.initializeDefaultTemplates();
  }

  /**
   * Generate a personalized session prompt based on user profile
   */
  async generateSessionPrompt(profile: SessionProfile): Promise<string> {
    const template = await this.getTemplate('beer-discovery-session');
    
    if (!template) {
      return this.generateFallbackPrompt(profile);
    }

    return this.processTemplate(template.template, {
      sessionGoal: profile.sessionGoal,
      mood: profile.mood,
      primaryTaste: profile.tastePreference.primary,
      avoidTastes: profile.tastePreference.avoid.join(', '),
      location: profile.constraints.location || 'any location',
      budget: profile.constraints.budget || 'any budget',
      keywords: profile.searchKeywords.join(', '),
      constraints: profile.constraints.other?.join(', ') || 'none',
      snsHistorySection: profile.includeSnsHistory ? this.getSnsHistorySection() : ''
    });
  }

  /**
   * Get all available prompt templates
   */
  async getTemplates(): Promise<PromptTemplate[]> {
    return Array.from(this.templates.values());
  }

  /**
   * Get specific template by ID
   */
  async getTemplate(id: string): Promise<PromptTemplate | null> {
    return this.templates.get(id) || null;
  }

  /**
   * Add or update a template
   */
  async saveTemplate(template: PromptTemplate): Promise<void> {
    this.templates.set(template.id, template);
  }

  /**
   * Generate data import prompt for AI assistants
   */
  async generateDataImportPrompt(): Promise<string> {
    const template = await this.getTemplate('data-import-wizard');
    
    if (!template) {
      return this.generateFallbackImportPrompt();
    }

    return template.template;
  }

  /**
   * Parse and validate JSON output from AI assistant
   */
  async parseImportData(jsonString: string): Promise<{
    userProfile?: any;
    beerHistory?: any[];
    importMetadata?: any;
    isValid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    
    try {
      const data = JSON.parse(jsonString);
      
      // Validate required structure
      if (!data.userProfile && !data.beerHistory) {
        errors.push('データにuserProfileまたはbeerHistoryが含まれていません');
      }
      
      // Validate userProfile structure
      if (data.userProfile) {
        if (!data.userProfile.preferences) {
          errors.push('userProfile.preferencesが見つかりません');
        }
      }
      
      // Validate beerHistory structure
      if (data.beerHistory && Array.isArray(data.beerHistory)) {
        data.beerHistory.forEach((beer: any, index: number) => {
          if (!beer.name || !beer.brewery) {
            errors.push(`ビール履歴 ${index + 1}: nameまたはbreweryが不足しています`);
          }
        });
      }
      
      return {
        userProfile: data.userProfile,
        beerHistory: data.beerHistory || [],
        importMetadata: data.importMetadata || {
          importDate: new Date().toISOString(),
          source: 'ai-assistant',
          version: '1.0'
        },
        isValid: errors.length === 0,
        errors
      };
      
    } catch (error) {
      errors.push('JSONの解析に失敗しました: ' + (error as Error).message);
      return {
        isValid: false,
        errors
      };
    }
  }

  /**
   * Process template by replacing variables
   */
  private processTemplate(template: string, variables: Record<string, string>): string {
    let processed = template;
    
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      processed = processed.replace(new RegExp(placeholder, 'g'), value);
    }
    
    return processed;
  }

  /**
   * Generate fallback prompt when no template is available
   */
  private generateFallbackPrompt(profile: SessionProfile): string {
    const snsSection = profile.includeSnsHistory ? `

${this.getSnsHistorySection()}` : '';

    return `I'm looking for beer recommendations with the following preferences:

Goal: ${profile.sessionGoal}
Mood: ${profile.mood}
Primary taste preference: ${profile.tastePreference.primary}
Tastes to avoid: ${profile.tastePreference.avoid.join(', ') || 'none'}
Location: ${profile.constraints.location || 'any'}
Budget: ${profile.constraints.budget || 'flexible'}
Additional keywords: ${profile.searchKeywords.join(', ') || 'none'}
${snsSection}
Please provide personalized beer recommendations with detailed explanations of why each beer matches my preferences. Include brewery information, tasting notes, and where I might find these beers.`;
  }

  /**
   * Generate fallback data import prompt
   */
  private generateFallbackImportPrompt(): string {
    return `# ビール履歴データインポート

あなたの現在のビール関連情報をNextPintアプリにインポートするため、以下の情報を段階的に教えてください。

## ステップ1: 基本的な好み
- 好きなビールスタイル（IPA、ラガー、スタウト等）
- 苦味、甘味の好み（1-5で評価）
- 避けたい味や種類

## ステップ2: ビール履歴
- 最近飲んだビール（名前、ブルワリー、評価）
- お気に入りのビール
- SNSの投稿やスクリーンショットがあれば共有

## ステップ3: その他の情報
- よく行くブルワリーやバー
- 予算範囲
- 住んでいる地域

すべての情報を収集後、以下の形式でJSON出力してください：

\`\`\`json
{
  "userProfile": {
    "preferences": {...},
    "settings": {...}
  },
  "beerHistory": [...],
  "importMetadata": {...}
}
\`\`\``;
  }

  /**
   * Generate SNS history input section
   */
  private getSnsHistorySection(): string {
    return `
=== YOUR BEER HISTORY (OPTIONAL) ===
If you have any beer-related posts or check-ins from social media (Instagram, X/Twitter, Untappd, Facebook, etc.), please paste them below. This will help me provide more personalized recommendations based on your actual beer experiences and preferences.

[Please paste your SNS posts/check-ins here]

Examples of what to include:
- Instagram posts about beers you've enjoyed
- Untappd check-ins with ratings and comments
- Twitter/X posts about brewery visits
- Facebook posts about beer events or tastings
- Any other social media content related to your beer journey

Don't worry if you don't have any - I can still provide great recommendations based on your preferences above!
===================================
`;
  }

  /**
   * Initialize default prompt templates
   */
  private initializeDefaultTemplates(): void {
    const defaultTemplates: PromptTemplate[] = [
      {
        id: 'beer-discovery-session',
        name: 'Beer Discovery Session',
        description: 'Comprehensive beer recommendation prompt',
        category: PromptCategory.SEARCH,
        version: '1.0.0',
        locale: 'en-US',
        template: `You are an expert beer sommelier and craft beer specialist. I'm looking for personalized beer recommendations based on my specific preferences and current situation.

**My Current Goal:** {{sessionGoal}}
**My Mood:** {{mood}}
**Taste Preferences:** 
- Primary taste I enjoy: {{primaryTaste}}
- Tastes I want to avoid: {{avoidTastes}}

**Practical Constraints:**
- Location: {{location}}
- Budget considerations: {{budget}}
- Additional requirements: {{constraints}}

**Keywords/Interests:** {{keywords}}
{{snsHistorySection}}
Please provide me with:
1. 3-5 specific beer recommendations that match my preferences
2. Detailed tasting notes for each recommendation
3. Explanation of why each beer fits my current mood and goal
4. Brewery information and availability
5. Food pairing suggestions if relevant
6. Alternative options if my preferred beers aren't available

Format your response to be actionable and include specific beer names, brewery names, and style information.`,
        variables: [
          { name: 'sessionGoal', type: 'string', required: true, description: 'What the user wants to achieve' },
          { name: 'mood', type: 'string', required: true, description: 'Current mood or feeling' },
          { name: 'primaryTaste', type: 'string', required: true, description: 'Primary taste preference' },
          { name: 'avoidTastes', type: 'string', required: false, description: 'Tastes to avoid' },
          { name: 'location', type: 'string', required: false, description: 'User location' },
          { name: 'budget', type: 'string', required: false, description: 'Budget constraints' },
          { name: 'constraints', type: 'string', required: false, description: 'Additional constraints' },
          { name: 'keywords', type: 'string', required: false, description: 'Search keywords' }
        ],
        metadata: {
          supportedAI: ['chatgpt', 'claude', 'gemini'],
          estimatedTokens: 800,
          difficulty: 'easy',
          tags: ['beer', 'recommendation', 'discovery'],
          author: 'NextPint Team',
          language: 'English'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'taste-analysis',
        name: 'Personal Taste Analysis',
        description: 'Analyze beer drinking patterns and preferences',
        category: PromptCategory.ANALYSIS,
        version: '1.0.0',
        locale: 'en-US',
        template: `As a beer data analyst, please analyze my beer drinking history and provide insights into my taste preferences.

**My Beer History:**
{{beerHistory}}

**Current Preferences:**
- Favorite styles: {{favoriteStyles}}
- Preferred breweries: {{preferredBreweries}}
- Typical occasions: {{occasions}}

Please provide:
1. Analysis of my taste pattern evolution
2. Identification of my "beer personality type"
3. Prediction of styles I might enjoy next
4. Recommendations for expanding my palate
5. Seasonal drinking patterns if any
6. Comparison to typical craft beer enthusiast profiles

Include specific recommendations for new beers to try based on my established preferences.`,
        variables: [
          { name: 'beerHistory', type: 'string', required: true, description: 'User beer drinking history' },
          { name: 'favoriteStyles', type: 'string', required: true, description: 'Preferred beer styles' },
          { name: 'preferredBreweries', type: 'string', required: false, description: 'Favorite breweries' },
          { name: 'occasions', type: 'string', required: false, description: 'Typical drinking occasions' }
        ],
        metadata: {
          supportedAI: ['chatgpt', 'claude', 'gemini'],
          estimatedTokens: 600,
          difficulty: 'medium',
          tags: ['analysis', 'taste', 'patterns'],
          author: 'NextPint Team',
          language: 'English'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'brewery-exploration',
        name: 'Brewery Deep Dive',
        description: 'Explore specific breweries and their offerings',
        category: PromptCategory.SEARCH,
        version: '1.0.0',
        locale: 'en-US',
        template: `I want to explore and learn about specific breweries. Act as a craft beer industry expert.

**Brewery Focus:** {{breweryName}}
**My Interest Level:** {{interestLevel}}
**Previous Experience:** {{previousExperience}}
**What I'm Seeking:** {{seekingType}}

Please provide comprehensive information about:
1. Brewery history and founding story
2. Signature beers and flagship offerings
3. Brewing philosophy and unique characteristics
4. Awards and industry recognition
5. Seasonal or limited releases to watch for
6. Best beers for beginners vs. advanced drinkers
7. Food and taproom experience
8. How to find and purchase their beers
9. Similar breweries I might also enjoy

Make recommendations specific to my experience level and interests.`,
        variables: [
          { name: 'breweryName', type: 'string', required: true, description: 'Name of brewery to explore' },
          { name: 'interestLevel', type: 'string', required: true, description: 'User interest level' },
          { name: 'previousExperience', type: 'string', required: false, description: 'Previous brewery experience' },
          { name: 'seekingType', type: 'string', required: false, description: 'What user is seeking' }
        ],
        metadata: {
          supportedAI: ['chatgpt', 'claude', 'gemini'],
          estimatedTokens: 700,
          difficulty: 'easy',
          tags: ['brewery', 'exploration', 'information'],
          author: 'NextPint Team',
          language: 'English'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'food-pairing',
        name: 'Beer and Food Pairing',
        description: 'Get expert food pairing recommendations',
        category: PromptCategory.COMPARISON,
        version: '1.0.0',
        locale: 'en-US',
        template: `As a culinary expert specializing in beer and food pairings, help me create the perfect combination.

**Food/Meal:** {{foodDescription}}
**Occasion:** {{occasion}}
**Beer Preferences:** {{beerPreferences}}
**Dietary Restrictions:** {{dietaryRestrictions}}
**Meal Timing:** {{mealTiming}}

Please recommend:
1. 3-5 beer styles that would pair excellently
2. Specific beer recommendations with brewery names
3. Explanation of why each pairing works (flavor science)
4. Alternative pairings for different palates
5. Serving suggestions (temperature, glassware)
6. Complementary side dishes or appetizers
7. Non-alcoholic alternatives if needed

Focus on creating a memorable culinary experience that enhances both the food and beer.`,
        variables: [
          { name: 'foodDescription', type: 'string', required: true, description: 'Description of food/meal' },
          { name: 'occasion', type: 'string', required: false, description: 'Dining occasion' },
          { name: 'beerPreferences', type: 'string', required: false, description: 'Beer preferences' },
          { name: 'dietaryRestrictions', type: 'string', required: false, description: 'Dietary restrictions' },
          { name: 'mealTiming', type: 'string', required: false, description: 'Meal timing' }
        ],
        metadata: {
          supportedAI: ['chatgpt', 'claude', 'gemini'],
          estimatedTokens: 750,
          difficulty: 'medium',
          tags: ['food', 'pairing', 'culinary'],
          author: 'NextPint Team',
          language: 'English'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'data-import-wizard',
        name: 'ビール履歴データインポート',
        description: 'ユーザーの現在のビール関連データを段階的に収集してJSON形式で出力',
        category: PromptCategory.IMPORT,
        version: '1.0.0',
        locale: 'ja-JP',
        template: `# ビール履歴データインポートアシスタント

あなたはNextPintアプリのデータインポート専門アシスタントです。ユーザーの現在のビール関連情報を段階的に収集し、最終的にJSON形式で出力します。

## 収集する情報
1. **ビール履歴**: 過去に飲んだビールの記録
2. **好みプロファイル**: 味の好み、お気に入りスタイル
3. **ブルワリー情報**: よく行く・好きなブルワリー
4. **最近の活動**: SNS投稿、チェックイン、写真など

## 段階的な質問プロセス

### ステップ1: 基本情報の確認
まず、以下の情報について教えてください：

**Q1: ビール体験について**
- ビールを飲み始めてどのくらいになりますか？
- 普段どのくらいの頻度でビールを飲みますか？
- 主にどこでビールを飲みますか？（自宅、バー、レストラン、ブルワリー等）

**回答をお待ちしています。回答後、次の質問に進みます。**

### ステップ2: 好みの詳細情報
次に、あなたの味の好みについて教えてください：

**Q2: 味の好みについて**
- 好きなビールスタイルは何ですか？（IPA、ラガー、スタウト、ピルスナー等）
- 苦味、甘味、酸味、麦芽味、ホップ味のうち、どれが好きですか？（1-5で評価）
- 避けたいビールスタイルや味はありますか？

**回答をお待ちしています。**

### ステップ3: ビール履歴の収集
あなたのビール体験について詳しく教えてください：

**Q3: ビール履歴について**
以下の方法でビール履歴を共有してください：
- UntappdやRateBeerのスクリーンショット
- Instagram/X(Twitter)のビール関連投稿のスクリーンショット
- 最近飲んだビールの写真
- ビールメモやレビューのテキスト
- お気に入りビールのリスト

**情報を画像やテキストで共有してください。**

### ステップ4: ブルワリー・場所情報
ビールを楽しむ場所について教えてください：

**Q4: ブルワリーと場所について**
- よく行くブルワリーやビアバーはありますか？
- お住まいの地域はどちらですか？
- ビール購入の予算はだいたいどのくらいですか？

**回答をお待ちしています。**

### ステップ5: その他の情報
最後に補足情報があれば教えてください：

**Q5: 補足情報**
- ビールと一緒によく食べる料理は？
- ビールイベントやフェスティバルに参加したことはありますか？
- その他、ビールに関する特別な体験や思い出は？

**回答をお待ちしています。**

---

## 重要な指示

1. **段階的進行**: 必ず一つのステップずつ進めてください
2. **確認**: 各ステップで回答を確認してから次に進む
3. **画像解析**: スクリーンショットや写真は詳細に分析して情報を抽出
4. **最終確認**: 全ての情報収集が完了したら「すべての情報収集が完了しました。JSON出力の準備ができています。」と述べる
5. **JSON出力**: ユーザーが「完了した」と答えたら、以下の形式でJSON出力

## JSON出力フォーマット

\`\`\`json
{
  "userProfile": {
    "preferences": {
      "favoriteStyles": ["IPA", "Stout"],
      "flavorProfile": {
        "hoppy": 4,
        "malty": 3,
        "bitter": 4,
        "sweet": 2,
        "sour": 2,
        "alcohol": 3
      },
      "avoidList": ["Light Lager"],
      "preferredBreweries": ["BrewDog", "Stone Brewing"],
      "budgetRange": {
        "min": 500,
        "max": 2000,
        "currency": "JPY"
      },
      "locationPreferences": ["Tokyo", "Shibuya"]
    },
    "settings": {
      "language": "ja-JP",
      "theme": "dark",
      "notifications": true
    }
  },
  "beerHistory": [
    {
      "name": "BrewDog Punk IPA",
      "brewery": "BrewDog",
      "style": "IPA",
      "rating": 4.2,
      "abv": 5.6,
      "notes": "Great hoppy flavor",
      "checkinDate": "2024-01-15",
      "location": "Shibuya Beer Bar",
      "source": "manual",
      "tags": ["hoppy", "citrus"]
    }
  ],
  "importMetadata": {
    "importDate": "2024-01-20T10:30:00Z",
    "source": "ai-assistant",
    "completeness": "high",
    "version": "1.0"
  }
}
\`\`\`

それでは、ステップ1から始めましょう！`,
        variables: [],
        metadata: {
          supportedAI: ['chatgpt', 'claude', 'gemini'],
          estimatedTokens: 1200,
          difficulty: 'easy',
          tags: ['import', 'data-collection', 'wizard', 'japanese'],
          author: 'NextPint Team',
          language: 'Japanese'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }
}