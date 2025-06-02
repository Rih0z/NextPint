import { AnalyticsService } from '../AnalyticsService';
import { createMockLocalStorage } from '@/test-utils/test-helpers';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let mockLocalStorage: ReturnType<typeof createMockLocalStorage>;

  beforeEach(() => {
    mockLocalStorage = createMockLocalStorage();
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });
    
    service = new AnalyticsService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('trackEvent', () => {
    it('should track an event', () => {
      service.trackEvent('test_event', { foo: 'bar' });
      
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
      expect(savedData).toHaveLength(1);
      expect(savedData[0].event).toBe('test_event');
      expect(savedData[0].data).toEqual({ foo: 'bar' });
    });

    it('should track event without data', () => {
      service.trackEvent('simple_event');
      
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
      expect(savedData[0].event).toBe('simple_event');
      expect(savedData[0].data).toBeUndefined();
    });

    it('should generate unique event IDs', () => {
      service.trackEvent('event1');
      service.trackEvent('event2');
      
      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[1][1]);
      const ids = savedData.map((e: any) => e.id);
      expect(new Set(ids).size).toBe(2);
    });

    it('should include timestamp', () => {
      const before = Date.now();
      service.trackEvent('timed_event');
      const after = Date.now();
      
      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
      const timestamp = new Date(savedData[0].timestamp).getTime();
      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });

    it('should include sessionId and userId', () => {
      service.trackEvent('user_event');
      
      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
      expect(savedData[0].sessionId).toMatch(/^session_/);
      expect(savedData[0].userId).toBe('user_local');
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockLocalStorage.setItem.mockImplementationOnce(() => {
        throw new Error('Storage full');
      });

      // Should not throw
      expect(() => service.trackEvent('error_event')).not.toThrow();
      
      consoleSpy.mockRestore();
    });
  });

  describe('getEvents', () => {
    beforeEach(() => {
      // Set up some test events
      const events = [
        { id: '1', event: 'event1', timestamp: '2024-01-01T10:00:00Z' },
        { id: '2', event: 'event2', timestamp: '2024-01-02T10:00:00Z' },
        { id: '3', event: 'event3', timestamp: '2024-01-03T10:00:00Z' }
      ];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(events));
      service = new AnalyticsService(); // Recreate to load events
    });

    it('should get all events', () => {
      const events = service.getEvents();
      expect(events).toHaveLength(3);
    });

    it('should filter events by start date', () => {
      const events = service.getEvents(new Date('2024-01-02'));
      expect(events).toHaveLength(2);
      expect(events[0].event).toBe('event2');
    });

    it('should filter events by end date', () => {
      const events = service.getEvents(undefined, new Date('2024-01-02T23:59:59Z'));
      expect(events).toHaveLength(2);
      expect(events[events.length - 1].event).toBe('event2');
    });

    it('should filter events by date range', () => {
      const events = service.getEvents(
        new Date('2024-01-02'),
        new Date('2024-01-02T23:59:59Z')
      );
      expect(events).toHaveLength(1);
      expect(events[0].event).toBe('event2');
    });
  });

  describe('getEventsByType', () => {
    beforeEach(() => {
      const events = [
        { id: '1', event: 'page_view', timestamp: '2024-01-01T10:00:00Z' },
        { id: '2', event: 'button_click', timestamp: '2024-01-02T10:00:00Z' },
        { id: '3', event: 'page_view', timestamp: '2024-01-03T10:00:00Z' }
      ];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(events));
      service = new AnalyticsService();
    });

    it('should filter events by type', () => {
      const pageViews = service.getEventsByType('page_view');
      expect(pageViews).toHaveLength(2);
      pageViews.forEach(event => {
        expect(event.event).toBe('page_view');
      });
    });

    it('should return empty array for non-existent type', () => {
      const events = service.getEventsByType('non_existent');
      expect(events).toHaveLength(0);
    });
  });

  describe('clearData', () => {
    it('should clear all events', () => {
      service.trackEvent('test_event');
      expect(service.getEvents()).toHaveLength(1);
      
      service.clearData();
      
      expect(mockLocalStorage.setItem).toHaveBeenLastCalledWith('nextpint_analytics', '[]');
      expect(service.getEvents()).toHaveLength(0);
    });
  });

  describe('exportData', () => {
    it('should export data as JSON string', () => {
      service.trackEvent('export_test', { value: 123 });
      
      const exported = service.exportData();
      const parsed = JSON.parse(exported);
      
      expect(parsed.events).toHaveLength(1);
      expect(parsed.exportedAt).toBeDefined();
      expect(parsed.version).toBe('1.0.0');
    });

    it('should format JSON with indentation', () => {
      service.trackEvent('format_test');
      
      const exported = service.exportData();
      expect(exported).toContain('\n');
      expect(exported).toContain('  ');
    });
  });

  describe('getInsights', () => {
    beforeEach(() => {
      // Mock beer history
      const beerHistory = [
        { name: 'IPA 1', style: 'IPA', brewery: 'Brewery A', drankAt: '2024-01-01' },
        { name: 'IPA 2', style: 'IPA', brewery: 'Brewery A', drankAt: '2024-01-15' },
        { name: 'Stout 1', style: 'Stout', brewery: 'Brewery B', drankAt: '2024-02-01' },
        { name: 'IPA 3', style: 'IPA', brewery: 'Brewery C', drankAt: new Date().toISOString() }
      ];
      
      const sessions = [
        { id: 'session1', createdAt: '2024-01-01' },
        { id: 'session2', createdAt: '2024-02-01' }
      ];
      
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'nextpint_beer_history') return JSON.stringify(beerHistory);
        if (key === 'nextpint_sessions') return JSON.stringify(sessions);
        return null;
      });
    });

    it('should calculate total beers and sessions', async () => {
      const insights = await service.getInsights();
      expect(insights.totalBeers).toBe(4);
      expect(insights.totalSessions).toBe(2);
    });

    it('should identify favorite styles', async () => {
      const insights = await service.getInsights();
      expect(insights.favoriteStyles[0]).toBe('IPA');
      expect(insights.favoriteStyles[1]).toBe('Stout');
    });

    it('should identify brewery preferences', async () => {
      const insights = await service.getInsights();
      expect(insights.breweryPreferences[0]).toBe('Brewery A');
    });

    it('should calculate discovery metrics', async () => {
      const insights = await service.getInsights();
      expect(insights.discoveryMetrics.newStylesThisMonth).toBeGreaterThanOrEqual(1);
      expect(insights.discoveryMetrics.adventurousnessScore).toBeGreaterThan(0);
      expect(insights.discoveryMetrics.consistencyScore).toBeGreaterThanOrEqual(0);
    });

    it('should generate recommendations', async () => {
      const insights = await service.getInsights();
      expect(insights.recommendations.nextStyles).toHaveLength(3);
      expect(insights.recommendations.breweriesToExplore).toHaveLength(3);
      expect(insights.recommendations.personalityType).toContain(' - ');
    });

    it('should analyze tasting patterns', async () => {
      const insights = await service.getInsights();
      expect(insights.tastingPatterns.mostActiveDay).toBeDefined();
      expect(insights.tastingPatterns.preferredTime).toBe('Evening');
      expect(insights.tastingPatterns.seasonalTrends).toBeDefined();
    });

    it('should handle empty beer history', async () => {
      mockLocalStorage.getItem.mockImplementation(() => JSON.stringify([]));
      
      const insights = await service.getInsights();
      expect(insights.totalBeers).toBe(0);
      expect(insights.favoriteStyles).toHaveLength(0);
      expect(insights.recommendations.personalityType).toContain('Loyalist');
    });
  });

  describe('private helper methods', () => {
    it('should determine season correctly', () => {
      const service = new AnalyticsService();
      const getSeason = (service as any).getSeason.bind(service);
      
      expect(getSeason(0)).toBe('Winter');  // January
      expect(getSeason(3)).toBe('Spring');  // April
      expect(getSeason(6)).toBe('Summer');  // July
      expect(getSeason(9)).toBe('Fall');    // October
      expect(getSeason(11)).toBe('Winter'); // December
    });

    it('should generate related styles', () => {
      const service = new AnalyticsService();
      const getRelatedStyles = (service as any).getRelatedStyles.bind(service);
      
      const related = getRelatedStyles(['IPA']);
      expect(related).toContain('Double IPA');
      expect(related).toContain('Session IPA');
      expect(related).toHaveLength(3);
    });

    it('should determine personality type based on variety', () => {
      const service = new AnalyticsService();
      const determinePersonalityType = (service as any).determinePersonalityType.bind(service);
      
      // High variety
      const explorer = determinePersonalityType(
        Array(10).fill({}).map((_, i) => ({ style: `Style${i}` })),
        []
      );
      expect(explorer).toContain('Explorer');
      
      // Low variety
      const loyalist = determinePersonalityType(
        Array(10).fill({ style: 'IPA' }),
        []
      );
      expect(loyalist).toContain('Loyalist');
      
      // Medium variety (50% variety ratio)
      const balanced = determinePersonalityType(
        [...Array(3).fill({ style: 'IPA' }), ...Array(2).fill({ style: 'Stout' }), { style: 'Porter' }],
        []
      );
      expect(balanced).toContain('Balanced');
    });
  });

  describe('SSR compatibility', () => {
    it('should handle missing window object', () => {
      const windowBackup = global.window;
      // @ts-expect-error
      delete global.window;
      
      expect(() => new AnalyticsService()).not.toThrow();
      expect(() => service.trackEvent('ssr_test')).not.toThrow();
      
      global.window = windowBackup;
    });
  });
});