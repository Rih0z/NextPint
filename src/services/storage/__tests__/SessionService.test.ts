import { SessionService } from '../SessionService';
import { StorageService } from '../StorageService';
import { mockBeerSearchSession } from '@/test-utils/test-helpers';
import { BeerSearchSession, SessionStatus, SessionFilter } from '@/types';

// Mock StorageService
jest.mock('../StorageService', () => ({
  StorageService: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    getStorageKeys: jest.fn(() => ({
      SEARCH_SESSIONS: 'search_sessions'
    }))
  }
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-session-uuid')
}));

describe('SessionService', () => {
  const mockStorageService = StorageService as jest.Mocked<typeof StorageService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockStorageService.getItem.mockResolvedValue([]);
  });

  describe('getSessions', () => {
    it('should return empty array when no sessions exist', async () => {
      mockStorageService.getItem.mockResolvedValueOnce(null);
      
      const sessions = await SessionService.getSessions();
      expect(sessions).toEqual([]);
      expect(mockStorageService.getItem).toHaveBeenCalledWith('search_sessions');
    });

    it('should return stored sessions', async () => {
      const storedSessions = [mockBeerSearchSession];
      mockStorageService.getItem.mockResolvedValueOnce(storedSessions);
      
      const sessions = await SessionService.getSessions();
      expect(sessions).toEqual(storedSessions);
    });
  });

  describe('createSession', () => {
    it('should create session with generated id and timestamps', async () => {
      const sessionData = {
        userId: 'user-123',
        name: 'Test Session',
        status: SessionStatus.ACTIVE,
        profile: mockBeerSearchSession.profile,
        generatedPrompts: [],
        results: [],
        notes: 'Test notes'
      };

      const result = await SessionService.createSession(sessionData);
      
      expect(result.sessionId).toBe('mock-session-uuid');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.name).toBe(sessionData.name);
      
      expect(mockStorageService.setItem).toHaveBeenCalledWith(
        'search_sessions',
        expect.arrayContaining([expect.objectContaining(sessionData)])
      );
    });

    it('should validate session data before saving', async () => {
      const invalidSession = {
        // Missing required fields
        name: 'Invalid Session'
      };

      await expect(SessionService.createSession(invalidSession as any))
        .rejects.toThrow('Invalid session data');
    });

    it('should append to existing sessions', async () => {
      const existingSession = mockBeerSearchSession;
      mockStorageService.getItem.mockResolvedValueOnce([existingSession]);
      
      const newSessionData = {
        userId: 'user-456',
        name: 'Another Session',
        status: SessionStatus.ACTIVE,
        profile: mockBeerSearchSession.profile,
        generatedPrompts: [],
        results: []
      };

      await SessionService.createSession(newSessionData);
      
      expect(mockStorageService.setItem).toHaveBeenCalledWith(
        'search_sessions',
        expect.arrayContaining([
          existingSession,
          expect.objectContaining(newSessionData)
        ])
      );
    });
  });

  describe('updateSession', () => {
    it('should update existing session', async () => {
      const existingSession = { ...mockBeerSearchSession, sessionId: 'session-123' };
      mockStorageService.getItem.mockResolvedValueOnce([existingSession]);
      
      const updates = { name: 'Updated Session', notes: 'Updated notes' };
      await SessionService.updateSession('session-123', updates);
      
      expect(mockStorageService.setItem).toHaveBeenCalledWith(
        'search_sessions',
        expect.arrayContaining([
          expect.objectContaining({
            ...existingSession,
            ...updates,
            updatedAt: expect.any(Date)
          })
        ])
      );
    });

    it('should throw error if session not found', async () => {
      mockStorageService.getItem.mockResolvedValueOnce([]);
      
      await expect(SessionService.updateSession('non-existent', {}))
        .rejects.toThrow('Session with id non-existent not found');
    });

    it('should validate updated session data', async () => {
      const existingSession = mockBeerSearchSession;
      mockStorageService.getItem.mockResolvedValueOnce([existingSession]);
      
      // Try to set invalid status
      await expect(SessionService.updateSession(existingSession.sessionId, { status: 'invalid' as any }))
        .rejects.toThrow('Invalid session data');
    });
  });

  describe('deleteSession', () => {
    it('should delete existing session', async () => {
      const session1 = { ...mockBeerSearchSession, sessionId: 'session-1' };
      const session2 = { ...mockBeerSearchSession, sessionId: 'session-2' };
      mockStorageService.getItem.mockResolvedValueOnce([session1, session2]);
      
      await SessionService.deleteSession('session-1');
      
      expect(mockStorageService.setItem).toHaveBeenCalledWith(
        'search_sessions',
        [session2]
      );
    });

    it('should throw error if session not found', async () => {
      mockStorageService.getItem.mockResolvedValueOnce([mockBeerSearchSession]);
      
      await expect(SessionService.deleteSession('non-existent'))
        .rejects.toThrow('Session with id non-existent not found');
    });
  });

  describe('getSession', () => {
    it('should return specific session by id', async () => {
      const sessions = [
        { ...mockBeerSearchSession, sessionId: 'session-1' },
        { ...mockBeerSearchSession, sessionId: 'session-2' }
      ];
      mockStorageService.getItem.mockResolvedValueOnce(sessions);
      
      const session = await SessionService.getSession('session-1');
      expect(session?.sessionId).toBe('session-1');
    });

    it('should return null for non-existent session', async () => {
      mockStorageService.getItem.mockResolvedValueOnce([mockBeerSearchSession]);
      
      const session = await SessionService.getSession('non-existent');
      expect(session).toBeNull();
    });
  });

  describe('filterSessions', () => {
    const testSessions: BeerSearchSession[] = [
      {
        ...mockBeerSearchSession,
        sessionId: '1',
        name: 'IPA Discovery',
        status: SessionStatus.ACTIVE,
        createdAt: new Date('2024-01-15'),
        profile: {
          ...mockBeerSearchSession.profile,
          sessionGoal: 'Find hoppy IPAs',
          mood: 'adventurous',
          searchKeywords: ['IPA', 'hoppy']
        }
      },
      {
        ...mockBeerSearchSession,
        sessionId: '2',
        name: 'Stout Exploration',
        status: SessionStatus.COMPLETED,
        createdAt: new Date('2024-02-01'),
        profile: {
          ...mockBeerSearchSession.profile,
          sessionGoal: 'Explore dark stouts',
          mood: 'contemplative',
          tastePreference: {
            primary: 'roasted',
            avoid: ['hoppy'],
            intensity: 4
          },
          searchKeywords: ['Stout', 'dark']
        }
      },
      {
        ...mockBeerSearchSession,
        sessionId: '3',
        name: 'Lager Session',
        status: SessionStatus.ACTIVE,
        createdAt: new Date('2024-02-15'),
        profile: {
          ...mockBeerSearchSession.profile,
          sessionGoal: 'Light lagers for summer',
          mood: 'relaxed',
          tastePreference: {
            primary: 'crisp',
            avoid: ['bitter'],
            intensity: 2
          },
          searchKeywords: ['Lager', 'light']
        }
      }
    ];

    beforeEach(() => {
      mockStorageService.getItem.mockResolvedValue(testSessions);
    });

    it('should filter by status', async () => {
      const filter: SessionFilter = { status: [SessionStatus.ACTIVE] };
      const result = await SessionService.filterSessions(filter);
      
      expect(result).toHaveLength(2);
      result.forEach(session => {
        expect(session.status).toBe(SessionStatus.ACTIVE);
      });
    });

    it('should filter by multiple statuses', async () => {
      const filter: SessionFilter = { status: [SessionStatus.ACTIVE, SessionStatus.COMPLETED] };
      const result = await SessionService.filterSessions(filter);
      
      expect(result).toHaveLength(3);
    });

    it('should filter by date range', async () => {
      const filter: SessionFilter = {
        dateRange: {
          start: new Date('2024-02-01'),
          end: new Date('2024-02-28')
        }
      };
      const result = await SessionService.filterSessions(filter);
      
      expect(result).toHaveLength(2);
      expect(result.map(s => s.sessionId)).toContain('2');
      expect(result.map(s => s.sessionId)).toContain('3');
    });

    it('should filter by search text', async () => {
      const filter: SessionFilter = { searchText: 'stout' };
      const result = await SessionService.filterSessions(filter);
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Stout Exploration');
    });

    it('should search across multiple fields', async () => {
      const filter: SessionFilter = { searchText: 'hoppy' };
      const result = await SessionService.filterSessions(filter);
      
      expect(result).toHaveLength(1);
      expect(result[0].profile.sessionGoal).toContain('hoppy');
    });

    it('should combine multiple filters', async () => {
      const filter: SessionFilter = {
        status: [SessionStatus.ACTIVE],
        searchText: 'IPA'
      };
      const result = await SessionService.filterSessions(filter);
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('IPA Discovery');
    });

    it('should return all sessions with empty filter', async () => {
      const result = await SessionService.filterSessions({});
      expect(result).toEqual(testSessions);
    });
  });

  describe('getActiveSession', () => {
    it('should return active session if exists', async () => {
      const sessions = [
        { ...mockBeerSearchSession, sessionId: '1', status: SessionStatus.COMPLETED },
        { ...mockBeerSearchSession, sessionId: '2', status: SessionStatus.ACTIVE },
        { ...mockBeerSearchSession, sessionId: '3', status: SessionStatus.ARCHIVED }
      ];
      mockStorageService.getItem.mockResolvedValueOnce(sessions);
      
      const activeSession = await SessionService.getActiveSession();
      expect(activeSession?.sessionId).toBe('2');
      expect(activeSession?.status).toBe(SessionStatus.ACTIVE);
    });

    it('should return null if no active session', async () => {
      const sessions = [
        { ...mockBeerSearchSession, status: SessionStatus.COMPLETED },
        { ...mockBeerSearchSession, status: SessionStatus.ARCHIVED }
      ];
      mockStorageService.getItem.mockResolvedValueOnce(sessions);
      
      const activeSession = await SessionService.getActiveSession();
      expect(activeSession).toBeNull();
    });
  });

  describe('getRecentSessions', () => {
    it('should return recent sessions sorted by updated date', async () => {
      const sessions = [
        { ...mockBeerSearchSession, sessionId: '1', updatedAt: new Date('2024-01-01') },
        { ...mockBeerSearchSession, sessionId: '2', updatedAt: new Date('2024-01-03') },
        { ...mockBeerSearchSession, sessionId: '3', updatedAt: new Date('2024-01-02') }
      ];
      mockStorageService.getItem.mockResolvedValueOnce(sessions);
      
      const recent = await SessionService.getRecentSessions(2);
      
      expect(recent).toHaveLength(2);
      expect(recent[0].sessionId).toBe('2'); // Most recent
      expect(recent[1].sessionId).toBe('3'); // Second most recent
    });

    it('should limit to specified number', async () => {
      const sessions = Array(15).fill(0).map((_, i) => ({
        ...mockBeerSearchSession,
        sessionId: `session-${i}`,
        updatedAt: new Date(2024, 0, i + 1)
      }));
      mockStorageService.getItem.mockResolvedValueOnce(sessions);
      
      const recent = await SessionService.getRecentSessions(5);
      expect(recent).toHaveLength(5);
    });
  });

  describe('getSessionStats', () => {
    it('should calculate session statistics', async () => {
      const sessions = [
        { ...mockBeerSearchSession, status: SessionStatus.ACTIVE, generatedPrompts: ['p1', 'p2'] },
        { ...mockBeerSearchSession, status: SessionStatus.ACTIVE, generatedPrompts: ['p1'] },
        { ...mockBeerSearchSession, status: SessionStatus.COMPLETED, generatedPrompts: ['p1', 'p2', 'p3'] },
        { ...mockBeerSearchSession, status: SessionStatus.ARCHIVED, generatedPrompts: [] }
      ];
      mockStorageService.getItem.mockResolvedValueOnce(sessions);
      
      const stats = await SessionService.getSessionStats();
      
      expect(stats.totalCount).toBe(4);
      expect(stats.activeCount).toBe(2);
      expect(stats.completedCount).toBe(1);
      expect(stats.averagePromptsPerSession).toBe(1.5); // (2+1+3+0)/4 = 1.5
    });

    it('should handle empty sessions', async () => {
      mockStorageService.getItem.mockResolvedValueOnce([]);
      
      const stats = await SessionService.getSessionStats();
      
      expect(stats.totalCount).toBe(0);
      expect(stats.activeCount).toBe(0);
      expect(stats.completedCount).toBe(0);
      expect(stats.averagePromptsPerSession).toBe(0);
    });
  });

  describe('archiveOldSessions', () => {
    it('should archive old completed sessions', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 40); // 40 days ago
      
      const sessions = [
        { ...mockBeerSearchSession, sessionId: '1', status: SessionStatus.COMPLETED, updatedAt: oldDate },
        { ...mockBeerSearchSession, sessionId: '2', status: SessionStatus.ACTIVE, updatedAt: oldDate },
        { ...mockBeerSearchSession, sessionId: '3', status: SessionStatus.COMPLETED, updatedAt: new Date() }
      ];
      mockStorageService.getItem.mockResolvedValueOnce(sessions);
      
      const archivedCount = await SessionService.archiveOldSessions(30);
      
      expect(archivedCount).toBe(1);
      expect(mockStorageService.setItem).toHaveBeenCalledWith(
        'search_sessions',
        expect.arrayContaining([
          expect.objectContaining({ sessionId: '1', status: SessionStatus.ARCHIVED }),
          expect.objectContaining({ sessionId: '2', status: SessionStatus.ACTIVE }),
          expect.objectContaining({ sessionId: '3', status: SessionStatus.COMPLETED })
        ])
      );
    });

    it('should not archive active or recent sessions', async () => {
      const recentDate = new Date();
      const sessions = [
        { ...mockBeerSearchSession, status: SessionStatus.ACTIVE, updatedAt: recentDate },
        { ...mockBeerSearchSession, status: SessionStatus.COMPLETED, updatedAt: recentDate }
      ];
      mockStorageService.getItem.mockResolvedValueOnce(sessions);
      
      const archivedCount = await SessionService.archiveOldSessions(30);
      
      expect(archivedCount).toBe(0);
      expect(mockStorageService.setItem).not.toHaveBeenCalled();
    });
  });

  describe('clearAllSessions', () => {
    it('should clear all sessions', async () => {
      await SessionService.clearAllSessions();
      
      expect(mockStorageService.removeItem).toHaveBeenCalledWith('search_sessions');
    });
  });

  describe('validateSession', () => {
    const validationMethod = (SessionService as any).validateSession;

    it('should validate complete session', () => {
      const result = validationMethod(mockBeerSearchSession);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require session ID', () => {
      const invalidSession = { ...mockBeerSearchSession, sessionId: '' };
      const result = validationMethod(invalidSession);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Session ID is required');
    });

    it('should require user ID', () => {
      const invalidSession = { ...mockBeerSearchSession, userId: '' };
      const result = validationMethod(invalidSession);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('User ID is required');
    });

    it('should validate session status', () => {
      const invalidSession = { ...mockBeerSearchSession, status: 'invalid' as any };
      const result = validationMethod(invalidSession);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid session status');
    });

    it('should validate session profile', () => {
      const invalidSession = { ...mockBeerSearchSession, profile: null };
      const result = validationMethod(invalidSession);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Session profile is required');
    });

    it('should validate profile fields', () => {
      const invalidSession = {
        ...mockBeerSearchSession,
        profile: {
          ...mockBeerSearchSession.profile,
          sessionGoal: '',
          mood: ''
        }
      };
      const result = validationMethod(invalidSession);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Session goal is required');
      expect(result.errors).toContain('Mood is required');
    });

    it('should validate taste preference', () => {
      const invalidSession = {
        ...mockBeerSearchSession,
        profile: {
          ...mockBeerSearchSession.profile,
          tastePreference: {
            primary: '',
            avoid: 'not an array' as any,
            intensity: 6 // Invalid range
          }
        }
      };
      const result = validationMethod(invalidSession);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Primary taste preference is required');
      expect(result.errors).toContain('Avoid list must be an array');
      expect(result.errors).toContain('Intensity must be a number between 1 and 5');
    });

    it('should validate constraints', () => {
      const invalidSession = {
        ...mockBeerSearchSession,
        profile: {
          ...mockBeerSearchSession.profile,
          constraints: null
        }
      };
      const result = validationMethod(invalidSession);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Constraints are required');
    });

    it('should validate generated prompts array', () => {
      const invalidSession = { ...mockBeerSearchSession, generatedPrompts: 'not an array' as any };
      const result = validationMethod(invalidSession);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Generated prompts must be an array');
    });

    it('should require created date', () => {
      const invalidSession = { ...mockBeerSearchSession, createdAt: null as any };
      const result = validationMethod(invalidSession);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Created date is required');
    });
  });
});