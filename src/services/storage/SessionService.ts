import {v4 as uuidv4} from 'uuid';
import {BeerSearchSession, SessionStatus, SessionFilter, ValidationResult} from '@/types';
import {StorageService} from './StorageService';

export class SessionService {
  private static readonly STORAGE_KEY = StorageService.getStorageKeys().SEARCH_SESSIONS;

  static async getSessions(): Promise<BeerSearchSession[]> {
    const sessions = await StorageService.getItem<BeerSearchSession[]>(this.STORAGE_KEY);
    return sessions || [];
  }

  static async createSession(
    sessionData: Omit<BeerSearchSession, 'sessionId' | 'createdAt' | 'updatedAt'>,
  ): Promise<BeerSearchSession> {
    const newSession: BeerSearchSession = {
      ...sessionData,
      sessionId: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const validation = this.validateSession(newSession);
    if (!validation.isValid) {
      throw new Error(`Invalid session data: ${validation.errors.join(', ')}`);
    }

    const sessions = await this.getSessions();
    sessions.push(newSession);
    await StorageService.setItem(this.STORAGE_KEY, sessions);

    return newSession;
  }

  static async updateSession(
    sessionId: string,
    updates: Partial<BeerSearchSession>,
  ): Promise<void> {
    const sessions = await this.getSessions();
    const sessionIndex = sessions.findIndex(session => session.sessionId === sessionId);

    if (sessionIndex === -1) {
      throw new Error(`Session with id ${sessionId} not found`);
    }

    sessions[sessionIndex] = {
      ...sessions[sessionIndex],
      ...updates,
      updatedAt: new Date(),
    };

    const validation = this.validateSession(sessions[sessionIndex]);
    if (!validation.isValid) {
      throw new Error(`Invalid session data: ${validation.errors.join(', ')}`);
    }

    await StorageService.setItem(this.STORAGE_KEY, sessions);
  }

  static async deleteSession(sessionId: string): Promise<void> {
    const sessions = await this.getSessions();
    const filteredSessions = sessions.filter(session => session.sessionId !== sessionId);

    if (filteredSessions.length === sessions.length) {
      throw new Error(`Session with id ${sessionId} not found`);
    }

    await StorageService.setItem(this.STORAGE_KEY, filteredSessions);
  }

  static async getSession(sessionId: string): Promise<BeerSearchSession | null> {
    const sessions = await this.getSessions();
    return sessions.find(session => session.sessionId === sessionId) || null;
  }

  static async filterSessions(filter: SessionFilter): Promise<BeerSearchSession[]> {
    const sessions = await this.getSessions();

    return sessions.filter(session => {
      // Status filter
      if (filter.status && filter.status.length > 0) {
        if (!filter.status.includes(session.status)) {
          return false;
        }
      }

      // Date range filter
      if (filter.dateRange) {
        const sessionDate = new Date(session.createdAt);
        if (sessionDate < filter.dateRange.start || sessionDate > filter.dateRange.end) {
          return false;
        }
      }

      // Search text filter
      if (filter.searchText) {
        const searchText = filter.searchText.toLowerCase();
        const searchableText = [
          session.name || '',
          session.profile.sessionGoal,
          session.profile.mood,
          session.profile.tastePreference.primary,
          ...session.profile.searchKeywords,
          session.notes || '',
        ].join(' ').toLowerCase();

        if (!searchableText.includes(searchText)) {
          return false;
        }
      }

      return true;
    });
  }

  static async getActiveSession(): Promise<BeerSearchSession | null> {
    const sessions = await this.getSessions();
    return sessions.find(session => session.status === SessionStatus.ACTIVE) || null;
  }

  static async getRecentSessions(limit: number = 10): Promise<BeerSearchSession[]> {
    const sessions = await this.getSessions();
    return sessions
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);
  }

  static async getSessionStats(): Promise<{
    totalCount: number;
    activeCount: number;
    completedCount: number;
    averagePromptsPerSession: number;
  }> {
    const sessions = await this.getSessions();

    const activeCount = sessions.filter(s => s.status === SessionStatus.ACTIVE).length;
    const completedCount = sessions.filter(s => s.status === SessionStatus.COMPLETED).length;

    const totalPrompts = sessions.reduce((sum, session) => sum + session.generatedPrompts.length, 0);
    const averagePromptsPerSession = sessions.length > 0 ? totalPrompts / sessions.length : 0;

    return {
      totalCount: sessions.length,
      activeCount,
      completedCount,
      averagePromptsPerSession: Math.round(averagePromptsPerSession * 10) / 10,
    };
  }

  static async archiveOldSessions(daysOld: number = 30): Promise<number> {
    const sessions = await this.getSessions();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    let archivedCount = 0;

    for (const session of sessions) {
      if (
        session.status === SessionStatus.COMPLETED &&
        new Date(session.updatedAt) < cutoffDate
      ) {
        session.status = SessionStatus.ARCHIVED;
        session.updatedAt = new Date();
        archivedCount++;
      }
    }

    if (archivedCount > 0) {
      await StorageService.setItem(this.STORAGE_KEY, sessions);
    }

    return archivedCount;
  }

  static async clearAllSessions(): Promise<void> {
    await StorageService.removeItem(this.STORAGE_KEY);
  }

  private static validateSession(session: BeerSearchSession): ValidationResult {
    const errors: string[] = [];

    if (!session.sessionId) {
      errors.push('Session ID is required');
    }

    if (!session.userId) {
      errors.push('User ID is required');
    }

    if (!Object.values(SessionStatus).includes(session.status)) {
      errors.push('Invalid session status');
    }

    if (!session.profile) {
      errors.push('Session profile is required');
    } else {
      if (!session.profile.sessionGoal || session.profile.sessionGoal.trim() === '') {
        errors.push('Session goal is required');
      }

      if (!session.profile.mood || session.profile.mood.trim() === '') {
        errors.push('Mood is required');
      }

      if (!session.profile.tastePreference) {
        errors.push('Taste preference is required');
      } else {
        if (!session.profile.tastePreference.primary || session.profile.tastePreference.primary.trim() === '') {
          errors.push('Primary taste preference is required');
        }

        if (!Array.isArray(session.profile.tastePreference.avoid)) {
          errors.push('Avoid list must be an array');
        }

        if (
          typeof session.profile.tastePreference.intensity !== 'number' ||
          session.profile.tastePreference.intensity < 1 ||
          session.profile.tastePreference.intensity > 5
        ) {
          errors.push('Intensity must be a number between 1 and 5');
        }
      }

      if (!session.profile.constraints) {
        errors.push('Constraints are required');
      } else {
        if (!Array.isArray(session.profile.constraints.other)) {
          errors.push('Other constraints must be an array');
        }
      }

      if (!Array.isArray(session.profile.searchKeywords)) {
        errors.push('Search keywords must be an array');
      }
    }

    if (!Array.isArray(session.generatedPrompts)) {
      errors.push('Generated prompts must be an array');
    }

    if (!session.createdAt) {
      errors.push('Created date is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}