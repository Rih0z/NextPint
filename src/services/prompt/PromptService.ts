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
      constraints: profile.constraints.other?.join(', ') || 'none'
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
    return `I'm looking for beer recommendations with the following preferences:

Goal: ${profile.sessionGoal}
Mood: ${profile.mood}
Primary taste preference: ${profile.tastePreference.primary}
Tastes to avoid: ${profile.tastePreference.avoid.join(', ') || 'none'}
Location: ${profile.constraints.location || 'any'}
Budget: ${profile.constraints.budget || 'flexible'}
Additional keywords: ${profile.searchKeywords.join(', ') || 'none'}

Please provide personalized beer recommendations with detailed explanations of why each beer matches my preferences. Include brewery information, tasting notes, and where I might find these beers.`;
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
      }
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }
}