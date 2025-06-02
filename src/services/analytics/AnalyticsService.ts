import { IAnalyticsService } from '@/application/factories/ServiceFactory';

export interface AnalyticsEvent {
  id: string;
  event: string;
  timestamp: string;
  data?: any;
  sessionId?: string;
  userId?: string;
}

export interface UserInsights {
  totalBeers: number;
  totalSessions: number;
  favoriteStyles: string[];
  breweryPreferences: string[];
  tastingPatterns: {
    mostActiveDay: string;
    preferredTime: string;
    seasonalTrends: Record<string, number>;
  };
  discoveryMetrics: {
    newStylesThisMonth: number;
    adventurousnessScore: number;
    consistencyScore: number;
  };
  recommendations: {
    nextStyles: string[];
    breweriesToExplore: string[];
    personalityType: string;
  };
}

/**
 * Analytics Service - User Behavior Tracking and Insights
 * 
 * Provides privacy-first analytics and insights:
 * - Tracks user interactions locally
 * - Generates personalized insights
 * - Identifies drinking patterns
 * - Suggests improvements and discoveries
 */
export class AnalyticsService implements IAnalyticsService {
  private events: AnalyticsEvent[] = [];
  private readonly STORAGE_KEY = 'nextpint_analytics';

  constructor() {
    this.loadEvents();
  }

  /**
   * Track user events for analytics
   */
  trackEvent(event: string, data?: any): void {
    const analyticsEvent: AnalyticsEvent = {
      id: this.generateId(),
      event,
      timestamp: new Date().toISOString(),
      data,
      sessionId: this.getCurrentSessionId(),
      userId: this.getCurrentUserId()
    };

    this.events.push(analyticsEvent);
    this.saveEvents();

    // Optional: Log for development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', analyticsEvent);
    }
  }

  /**
   * Generate user insights based on collected data
   */
  async getInsights(): Promise<UserInsights> {
    // Load additional data from storage services
    const beerHistory = await this.getBeerHistory();
    const sessions = await this.getSessions();

    return {
      totalBeers: beerHistory.length,
      totalSessions: sessions.length,
      favoriteStyles: this.analyzeFavoriteStyles(beerHistory),
      breweryPreferences: this.analyzeBreweryPreferences(beerHistory),
      tastingPatterns: this.analyzeTastingPatterns(beerHistory),
      discoveryMetrics: this.analyzeDiscoveryMetrics(beerHistory, sessions),
      recommendations: this.generateRecommendations(beerHistory, sessions)
    };
  }

  /**
   * Get events for a specific time period
   */
  getEvents(startDate?: Date, endDate?: Date): AnalyticsEvent[] {
    let filteredEvents = this.events;

    if (startDate) {
      filteredEvents = filteredEvents.filter(
        event => new Date(event.timestamp) >= startDate
      );
    }

    if (endDate) {
      filteredEvents = filteredEvents.filter(
        event => new Date(event.timestamp) <= endDate
      );
    }

    return filteredEvents;
  }

  /**
   * Get events by type
   */
  getEventsByType(eventType: string): AnalyticsEvent[] {
    return this.events.filter(event => event.event === eventType);
  }

  /**
   * Clear all analytics data
   */
  clearData(): void {
    this.events = [];
    this.saveEvents();
  }

  /**
   * Export analytics data
   */
  exportData(): string {
    return JSON.stringify({
      events: this.events,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    }, null, 2);
  }

  // Private helper methods

  private analyzeFavoriteStyles(beerHistory: any[]): string[] {
    const styleCount = new Map<string, number>();
    
    beerHistory.forEach(beer => {
      if (beer.style) {
        styleCount.set(beer.style, (styleCount.get(beer.style) || 0) + 1);
      }
    });

    return Array.from(styleCount.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([style]) => style);
  }

  private analyzeBreweryPreferences(beerHistory: any[]): string[] {
    const breweryCount = new Map<string, number>();
    
    beerHistory.forEach(beer => {
      if (beer.brewery) {
        breweryCount.set(beer.brewery, (breweryCount.get(beer.brewery) || 0) + 1);
      }
    });

    return Array.from(breweryCount.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([brewery]) => brewery);
  }

  private analyzeTastingPatterns(beerHistory: any[]): UserInsights['tastingPatterns'] {
    const dayCount = new Map<string, number>();
    const seasonCount = new Map<string, number>();
    
    beerHistory.forEach(beer => {
      if (beer.drankAt) {
        const date = new Date(beer.drankAt);
        const day = date.toLocaleDateString('en-US', { weekday: 'long' });
        const month = date.getMonth();
        const season = this.getSeason(month);
        
        dayCount.set(day, (dayCount.get(day) || 0) + 1);
        seasonCount.set(season, (seasonCount.get(season) || 0) + 1);
      }
    });

    const mostActiveDay = Array.from(dayCount.entries())
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Saturday';

    return {
      mostActiveDay,
      preferredTime: 'Evening', // Could be enhanced with actual time tracking
      seasonalTrends: Object.fromEntries(seasonCount)
    };
  }

  private analyzeDiscoveryMetrics(beerHistory: any[], sessions: any[]): UserInsights['discoveryMetrics'] {
    const thisMonth = new Date();
    thisMonth.setDate(1);
    
    const recentBeers = beerHistory.filter(beer => 
      beer.drankAt && new Date(beer.drankAt) >= thisMonth
    );
    
    const uniqueStyles = new Set(recentBeers.map(beer => beer.style));
    const totalStyles = new Set(beerHistory.map(beer => beer.style));
    
    // Calculate adventurousness (variety / total)
    const adventurousnessScore = Math.min(100, (totalStyles.size / Math.max(beerHistory.length, 1)) * 100);
    
    // Calculate consistency (repeat beers / total)
    const beerNames = beerHistory.map(beer => beer.name);
    const uniqueBeers = new Set(beerNames);
    const consistencyScore = Math.max(0, 100 - ((uniqueBeers.size / Math.max(beerHistory.length, 1)) * 100));

    return {
      newStylesThisMonth: uniqueStyles.size,
      adventurousnessScore: Math.round(adventurousnessScore),
      consistencyScore: Math.round(consistencyScore)
    };
  }

  private generateRecommendations(beerHistory: any[], sessions: any[]): UserInsights['recommendations'] {
    const favoriteStyles = this.analyzeFavoriteStyles(beerHistory);
    const breweryPrefs = this.analyzeBreweryPreferences(beerHistory);
    
    // Generate next styles based on current preferences
    const styleRecommendations = this.getRelatedStyles(favoriteStyles);
    
    // Determine personality type
    const personalityType = this.determinePersonalityType(beerHistory, sessions);

    return {
      nextStyles: styleRecommendations,
      breweriesToExplore: ['Local Craft Breweries', 'Award Winners', 'Seasonal Specialists'],
      personalityType
    };
  }

  private getRelatedStyles(favoriteStyles: string[]): string[] {
    const styleMap: Record<string, string[]> = {
      'IPA': ['Double IPA', 'Session IPA', 'Hazy IPA', 'Belgian IPA'],
      'Stout': ['Imperial Stout', 'Coffee Stout', 'Chocolate Stout', 'Milk Stout'],
      'Pilsner': ['Czech Pilsner', 'German Pilsner', 'Italian Pilsner'],
      'Wheat': ['Hefeweizen', 'Witbier', 'American Wheat', 'Berliner Weisse'],
      'Porter': ['Robust Porter', 'Smoked Porter', 'Baltic Porter'],
      'Lager': ['Vienna Lager', 'Märzen', 'Schwarzbier', 'Helles']
    };

    const recommendations = new Set<string>();
    
    favoriteStyles.forEach(style => {
      const related = styleMap[style] || [];
      related.forEach(rec => recommendations.add(rec));
    });

    return Array.from(recommendations).slice(0, 3);
  }

  private determinePersonalityType(beerHistory: any[], sessions: any[]): string {
    const totalBeers = beerHistory.length;
    const uniqueStyles = new Set(beerHistory.map(beer => beer.style)).size;
    const varietyRatio = uniqueStyles / Math.max(totalBeers, 1);

    if (varietyRatio > 0.7) {
      return 'Explorer - You love trying new styles and breweries';
    } else if (varietyRatio > 0.4) {
      return 'Balanced Drinker - You enjoy both favorites and new discoveries';
    } else {
      return 'Loyalist - You know what you like and stick with favorites';
    }
  }

  private getSeason(month: number): string {
    if (month >= 2 && month <= 4) return 'Spring';
    if (month >= 5 && month <= 7) return 'Summer';
    if (month >= 8 && month <= 10) return 'Fall';
    return 'Winter';
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getCurrentSessionId(): string {
    // In a real app, this would be managed by session management
    return 'session_' + Date.now();
  }

  private getCurrentUserId(): string {
    // In a real app, this would be from authentication
    return 'user_local';
  }

  private loadEvents(): void {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          this.events = JSON.parse(stored);
        }
      } catch (error) {
        console.error('Failed to load analytics events:', error);
        this.events = [];
      }
    }
  }

  private saveEvents(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.events));
      } catch (error) {
        console.error('Failed to save analytics events:', error);
      }
    }
  }

  private async getBeerHistory(): Promise<any[]> {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('nextpint_beer_history');
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    }
    return [];
  }

  private async getSessions(): Promise<any[]> {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('nextpint_sessions');
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    }
    return [];
  }
}