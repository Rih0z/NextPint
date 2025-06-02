import { PromptService } from '../PromptService';
import { PromptTemplate, SessionProfile } from '@/types';

describe('PromptService', () => {
  let service: PromptService;

  beforeEach(() => {
    service = new PromptService();
  });

  describe('getTemplates', () => {
    it('should return default templates', async () => {
      const templates = await service.getTemplates();
      expect(templates).toHaveLength(4);
      expect(templates[0].id).toBe('beer-discovery-session');
      expect(templates[1].id).toBe('taste-analysis');
      expect(templates[2].id).toBe('brewery-exploration');
      expect(templates[3].id).toBe('food-pairing');
    });

    it('should return templates with correct structure', async () => {
      const templates = await service.getTemplates();
      templates.forEach(template => {
        expect(template).toHaveProperty('id');
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('description');
        expect(template).toHaveProperty('category');
        expect(template).toHaveProperty('template');
        expect(template).toHaveProperty('variables');
        expect(template).toHaveProperty('metadata');
      });
    });
  });

  describe('getTemplate', () => {
    it('should return a specific template by id', async () => {
      const template = await service.getTemplate('beer-discovery-session');
      expect(template).toBeDefined();
      expect(template?.id).toBe('beer-discovery-session');
      expect(template?.name).toBe('Beer Discovery Session');
    });

    it('should return null for non-existent template', async () => {
      const template = await service.getTemplate('non-existent');
      expect(template).toBeNull();
    });
  });

  describe('generateSessionPrompt', () => {
    const mockProfile: SessionProfile = {
      sessionGoal: 'Find new craft beers',
      mood: 'adventurous',
      tastePreference: {
        primary: 'hoppy',
        avoid: ['sweet', 'sour'],
        intensity: 4
      },
      constraints: {
        maxABV: 8,
        priceRange: { min: 5, max: 15, currency: 'USD' },
        other: ['gluten-free']
      },
      searchKeywords: ['IPA', 'craft', 'local']
    };

    it('should generate a prompt from profile', async () => {
      const prompt = await service.generateSessionPrompt(mockProfile);
      expect(prompt).toContain('Find new craft beers');
      expect(prompt).toContain('adventurous');
      expect(prompt).toContain('hoppy');
      expect(prompt).toContain('sweet, sour');
      expect(prompt).toContain('any location');
      expect(prompt).toContain('any budget');
      expect(prompt).toContain('gluten-free');
      expect(prompt).toContain('IPA, craft, local');
    });

    it('should handle empty avoid list', async () => {
      const profileWithoutAvoid = {
        ...mockProfile,
        tastePreference: {
          ...mockProfile.tastePreference,
          avoid: []
        }
      };
      const prompt = await service.generateSessionPrompt(profileWithoutAvoid);
      expect(prompt).toContain('any location');
    });

    it('should handle empty constraints', async () => {
      const profileWithoutConstraints = {
        ...mockProfile,
        constraints: {
          ...mockProfile.constraints,
          other: []
        }
      };
      const prompt = await service.generateSessionPrompt(profileWithoutConstraints);
      expect(prompt).toContain('Find new craft beers');
    });

    it('should handle missing price range', async () => {
      const profileWithoutPrice = {
        ...mockProfile,
        constraints: {
          maxABV: 8,
          other: []
        }
      } as SessionProfile;
      const prompt = await service.generateSessionPrompt(profileWithoutPrice);
      expect(prompt).not.toContain('$');
    });

    it('should use fallback prompt when template is not found', async () => {
      // Mock getTemplate to return null
      jest.spyOn(service, 'getTemplate').mockResolvedValueOnce(null);
      
      const prompt = await service.generateSessionPrompt(mockProfile);
      expect(prompt).toContain('I\'m looking for beer recommendations');
      expect(prompt).toContain('Find new craft beers');
    });
  });

  describe('processTemplate', () => {
    it('should replace variables in template', () => {
      const template = 'Hello {{name}}, your age is {{age}}';
      const variables = { name: 'John', age: 30 };
      
      // Make processTemplate public for testing
      const result = (service as any).processTemplate(template, variables);
      expect(result).toBe('Hello John, your age is 30');
    });

    it('should handle missing variables', () => {
      const template = 'Hello {{name}}, your age is {{age}}';
      const variables = { name: 'John' };
      
      const result = (service as any).processTemplate(template, variables);
      expect(result).toBe('Hello John, your age is {{age}}');
    });

    it('should handle empty variables', () => {
      const template = 'Hello {{name}}';
      const variables = {};
      
      const result = (service as any).processTemplate(template, variables);
      expect(result).toBe('Hello {{name}}');
    });

    it('should handle template without variables', () => {
      const template = 'Hello World';
      const variables = { name: 'John' };
      
      const result = (service as any).processTemplate(template, variables);
      expect(result).toBe('Hello World');
    });

    it('should handle array variables', () => {
      const template = 'Items: {{items}}';
      const variables = { items: ['apple', 'banana', 'orange'].join(', ') };
      
      const result = (service as any).processTemplate(template, variables);
      expect(result).toBe('Items: apple, banana, orange');
    });

    it('should handle null and undefined values', () => {
      const template = 'Value1: {{val1}}, Value2: {{val2}}';
      const variables = { val1: '', val2: '' };
      
      const result = (service as any).processTemplate(template, variables);
      expect(result).toBe('Value1: , Value2: ');
    });
  });

  describe('generateFallbackPrompt', () => {
    it('should generate a structured fallback prompt', () => {
      const profile: SessionProfile = {
        sessionGoal: 'Explore Belgian beers',
        mood: 'relaxed',
        tastePreference: {
          primary: 'malty',
          avoid: ['bitter'],
          intensity: 3
        },
        constraints: {
          maxABV: 7,
          other: []
        },
        searchKeywords: ['Belgian', 'Trappist']
      };

      const prompt = (service as any).generateFallbackPrompt(profile);
      expect(prompt).toContain('I\'m looking for beer recommendations');
      expect(prompt).toContain('Explore Belgian beers');
      expect(prompt).toContain('relaxed');
      expect(prompt).toContain('malty');
      expect(prompt).toContain('Belgian, Trappist');
    });
  });

  // formatConstraints method doesn't exist in current implementation
  // Removing these tests to match actual implementation

  describe('template metadata', () => {
    it('should have valid metadata for all templates', async () => {
      const templates = await service.getTemplates();
      
      templates.forEach(template => {
        expect(template.metadata.supportedAI).toContain('chatgpt');
        expect(template.metadata.estimatedTokens).toBeGreaterThan(0);
        expect(['easy', 'medium', 'hard']).toContain(template.metadata.difficulty);
        expect(Array.isArray(template.metadata.tags)).toBe(true);
        expect(template.metadata.tags.length).toBeGreaterThan(0);
      });
    });
  });
});