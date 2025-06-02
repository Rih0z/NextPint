import { BeerHistoryService } from '../BeerHistoryService';
import { StorageService } from '../StorageService';
import { ImportedBeer, BeerFilter } from '@/types';
import { mockImportedBeer } from '@/test-utils/test-helpers';

// Mock StorageService
jest.mock('../StorageService', () => ({
  StorageService: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    getStorageKeys: jest.fn(() => ({
      IMPORTED_BEERS: 'imported_beers',
      USER_PROFILE: 'user_profile',
      SEARCH_SESSIONS: 'search_sessions',
      PROMPT_TEMPLATES_CACHE: 'prompt_templates_cache',
      APP_SETTINGS: 'app_settings'
    }))
  }
}));

describe('BeerHistoryService', () => {
  const mockStorageService = StorageService as jest.Mocked<typeof StorageService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockStorageService.getItem.mockResolvedValue([]);
  });

  describe('getImportedBeers', () => {
    it('should return empty array when no beers exist', async () => {
      mockStorageService.getItem.mockResolvedValueOnce(null);
      
      const beers = await BeerHistoryService.getImportedBeers();
      expect(beers).toEqual([]);
      expect(mockStorageService.getItem).toHaveBeenCalledWith('imported_beers');
    });

    it('should return stored beers', async () => {
      const storedBeers = [mockImportedBeer];
      mockStorageService.getItem.mockResolvedValueOnce(storedBeers);
      
      const beers = await BeerHistoryService.getImportedBeers();
      expect(beers).toEqual(storedBeers);
    });
  });

  describe('addImportedBeer', () => {
    it('should add a new beer with generated id and timestamps', async () => {
      const beerData = {
        name: 'New Beer',
        brewery: 'New Brewery',
        style: 'Lager',
        abv: 5,
        rating: 4.0,
        tags: ['light', 'crisp'],
        source: 'untappd' as const,
        originalData: {}
      };

      const result = await BeerHistoryService.addImportedBeer(beerData);
      
      expect(result.id).toBeDefined();
      expect(result.importedAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.name).toBe(beerData.name);
      
      expect(mockStorageService.setItem).toHaveBeenCalledWith(
        'imported_beers',
        expect.arrayContaining([expect.objectContaining(beerData)])
      );
    });

    it('should validate beer data before saving', async () => {
      const invalidBeer = {
        // Missing required fields
        brewery: 'Test',
        source: 'untappd' as const,
        originalData: {}
      };

      await expect(BeerHistoryService.addImportedBeer(invalidBeer as any))
        .rejects.toThrow('Invalid beer data');
    });

    it('should append to existing beers', async () => {
      const existingBeer = mockImportedBeer;
      mockStorageService.getItem.mockResolvedValueOnce([existingBeer]);
      
      const newBeer = {
        name: 'Another Beer',
        brewery: 'Another Brewery',
        style: 'Stout',
        abv: 7,
        rating: 4.5,
        tags: ['dark', 'roasted'],
        source: 'ratebeer' as const,
        originalData: {}
      };

      await BeerHistoryService.addImportedBeer(newBeer);
      
      expect(mockStorageService.setItem).toHaveBeenCalledWith(
        'imported_beers',
        expect.arrayContaining([
          existingBeer,
          expect.objectContaining(newBeer)
        ])
      );
    });
  });

  describe('addImportedBeers', () => {
    it('should add multiple beers at once', async () => {
      const beersData = [
        {
          name: 'Beer 1',
          brewery: 'Brewery 1',
          style: 'IPA',
          abv: 6,
          rating: 4.2,
          tags: ['hoppy'],
          source: 'untappd' as const,
          originalData: {}
        },
        {
          name: 'Beer 2',
          brewery: 'Brewery 2',
          style: 'Porter',
          abv: 5.5,
          rating: 4.0,
          tags: ['smooth'],
          source: 'ratebeer' as const,
          originalData: {}
        }
      ];

      const result = await BeerHistoryService.addImportedBeers(beersData);
      
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Beer 1');
      expect(result[1].name).toBe('Beer 2');
      
      // All should have unique IDs
      const ids = result.map(b => b.id);
      expect(new Set(ids).size).toBe(2);
    });

    it('should validate all beers before saving', async () => {
      const beersData = [
        {
          name: 'Valid Beer',
          brewery: 'Brewery',
          style: 'IPA',
          abv: 6,
          rating: 4.0,
          tags: ['craft'],
          source: 'untappd' as const,
          originalData: {}
        },
        {
          // Invalid - missing name, style, rating, tags
          brewery: 'Brewery',
          source: 'ratebeer' as const,
          originalData: {}
        }
      ];

      await expect(BeerHistoryService.addImportedBeers(beersData as any))
        .rejects.toThrow('Invalid beer data');
      
      // Should not save any beers if validation fails
      expect(mockStorageService.setItem).not.toHaveBeenCalled();
    });
  });

  describe('updateImportedBeer', () => {
    it('should update existing beer', async () => {
      const existingBeer = { ...mockImportedBeer, id: 'beer-123' };
      mockStorageService.getItem.mockResolvedValueOnce([existingBeer]);
      
      const updates = { rating: 4.5, notes: 'Updated notes' };
      await BeerHistoryService.updateImportedBeer('beer-123', updates);
      
      expect(mockStorageService.setItem).toHaveBeenCalledWith(
        'imported_beers',
        expect.arrayContaining([
          expect.objectContaining({
            ...existingBeer,
            ...updates,
            updatedAt: expect.any(Date)
          })
        ])
      );
    });

    it('should throw error if beer not found', async () => {
      mockStorageService.getItem.mockResolvedValueOnce([]);
      
      await expect(BeerHistoryService.updateImportedBeer('non-existent', {}))
        .rejects.toThrow('Beer with id non-existent not found');
    });

    it('should validate updated beer data', async () => {
      const existingBeer = mockImportedBeer;
      mockStorageService.getItem.mockResolvedValueOnce([existingBeer]);
      
      // Try to set invalid ABV
      await expect(BeerHistoryService.updateImportedBeer(existingBeer.id, { abv: -1 }))
        .rejects.toThrow('Invalid beer data');
    });
  });

  describe('deleteImportedBeer', () => {
    it('should delete existing beer', async () => {
      const beer1 = { ...mockImportedBeer, id: 'beer-1' };
      const beer2 = { ...mockImportedBeer, id: 'beer-2' };
      mockStorageService.getItem.mockResolvedValueOnce([beer1, beer2]);
      
      await BeerHistoryService.deleteImportedBeer('beer-1');
      
      expect(mockStorageService.setItem).toHaveBeenCalledWith(
        'imported_beers',
        [beer2]
      );
    });

    it('should throw error if beer not found', async () => {
      mockStorageService.getItem.mockResolvedValueOnce([mockImportedBeer]);
      
      await expect(BeerHistoryService.deleteImportedBeer('non-existent'))
        .rejects.toThrow('Beer with id non-existent not found');
    });
  });

  describe('filterBeers', () => {
    const testBeers: ImportedBeer[] = [
      {
        ...mockImportedBeer,
        id: '1',
        name: 'Test IPA',
        style: 'IPA',
        brewery: 'Craft Brewery',
        rating: 4.5,
        drankAt: new Date('2024-01-15'),
        checkinDate: new Date('2024-01-15')
      },
      {
        ...mockImportedBeer,
        id: '2',
        name: 'Dark Stout',
        style: 'Stout',
        brewery: 'Local Brewery',
        rating: 4.0,
        drankAt: new Date('2024-02-01'),
        checkinDate: new Date('2024-02-01')
      },
      {
        ...mockImportedBeer,
        id: '3',
        name: 'Light Lager',
        style: 'Lager',
        brewery: 'Big Brewery',
        rating: 3.0,
        drankAt: new Date('2024-02-15'),
        checkinDate: new Date('2024-02-15')
      }
    ];

    beforeEach(() => {
      mockStorageService.getItem.mockResolvedValue(testBeers);
    });

    it('should filter by style', async () => {
      const filter: BeerFilter = { styles: ['IPA'] };
      const result = await BeerHistoryService.filterBeers(filter);
      
      expect(result).toHaveLength(1);
      expect(result[0].style).toBe('IPA');
    });

    it('should filter by multiple styles', async () => {
      const filter: BeerFilter = { styles: ['IPA', 'Stout'] };
      const result = await BeerHistoryService.filterBeers(filter);
      
      expect(result).toHaveLength(2);
      expect(result.map(b => b.style)).toContain('IPA');
      expect(result.map(b => b.style)).toContain('Stout');
    });

    it('should filter by brewery', async () => {
      const filter: BeerFilter = { breweries: ['Local Brewery'] };
      const result = await BeerHistoryService.filterBeers(filter);
      
      expect(result).toHaveLength(1);
      expect(result[0].brewery).toBe('Local Brewery');
    });

    it('should filter by rating range', async () => {
      const filter: BeerFilter = { ratingRange: { min: 4.0, max: 4.5 } };
      const result = await BeerHistoryService.filterBeers(filter);
      
      expect(result).toHaveLength(2);
      result.forEach(beer => {
        expect(beer.rating).toBeGreaterThanOrEqual(4.0);
        expect(beer.rating!).toBeLessThanOrEqual(4.5);
      });
    });

    it('should filter by date range', async () => {
      const filter: BeerFilter = {
        dateRange: {
          start: new Date('2024-02-01'),
          end: new Date('2024-02-28')
        }
      };
      const result = await BeerHistoryService.filterBeers(filter);
      
      expect(result).toHaveLength(2);
      expect(result.map(b => b.id)).toContain('2');
      expect(result.map(b => b.id)).toContain('3');
    });

    it('should filter by search text', async () => {
      const filter: BeerFilter = { searchText: 'stout' };
      const result = await BeerHistoryService.filterBeers(filter);
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Dark Stout');
    });

    it('should combine multiple filters', async () => {
      const filter: BeerFilter = {
        styles: ['IPA', 'Stout'],
        minRating: 4.0,
        searchText: 'Test'
      };
      const result = await BeerHistoryService.filterBeers(filter);
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Test IPA');
    });

    it('should return all beers with empty filter', async () => {
      const result = await BeerHistoryService.filterBeers({});
      expect(result).toEqual(testBeers);
    });
  });

  describe('getBeerStats', () => {
    it('should calculate statistics', async () => {
      const beers = [
        { ...mockImportedBeer, style: 'IPA', rating: 4.5, abv: 6.5 },
        { ...mockImportedBeer, style: 'IPA', rating: 4.0, abv: 6.0 },
        { ...mockImportedBeer, style: 'Stout', rating: 4.2, abv: 8.0 },
        { ...mockImportedBeer, style: 'Stout', rating: 3.0, abv: 7.5 }
      ];
      mockStorageService.getItem.mockResolvedValueOnce(beers);
      
      const stats = await BeerHistoryService.getBeerStats();
      
      expect(stats.totalCount).toBe(4);
      expect(stats.averageRating).toBeCloseTo(3.9, 1);  // (4.5 + 4.0 + 4.2 + 3.0) / 4 = 3.925
      expect(stats.topStyles[0].name).toBe('IPA');
      expect(stats.topBreweries[0].name).toBe('Test Brewery');
    });

    it('should handle empty beer list', async () => {
      mockStorageService.getItem.mockResolvedValueOnce([]);
      
      const stats = await BeerHistoryService.getBeerStats();
      
      expect(stats.totalCount).toBe(0);
      expect(stats.averageRating).toBe(0);
      expect(stats.topStyles).toEqual([]);
      expect(stats.topBreweries).toEqual([]);
    });
  });

  describe('clearAllBeers', () => {
    it('should clear all beers', async () => {
      await BeerHistoryService.clearAllBeers();
      
      expect(mockStorageService.removeItem).toHaveBeenCalledWith('imported_beers');
    });
  });

  describe('validateImportedBeer', () => {
    it('should validate required fields', () => {
      const invalidBeers = [
        { ...mockImportedBeer, id: '' },
        { ...mockImportedBeer, name: '' },
        { ...mockImportedBeer, brewery: '' },
        { ...mockImportedBeer, source: null },
        { ...mockImportedBeer, importedAt: null }
      ];

      invalidBeers.forEach(beer => {
        const result = (BeerHistoryService as any).validateImportedBeer(beer);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    it('should validate ABV range', () => {
      const invalidABVs = [-1, 101];
      
      invalidABVs.forEach(abv => {
        const beer = { ...mockImportedBeer, abv };
        const result = (BeerHistoryService as any).validateImportedBeer(beer);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('ABV must be a number between 0 and 100');
      });
    });

    it('should validate IBU range', () => {
      const invalidIBUs = [-1];
      
      invalidIBUs.forEach(ibu => {
        const beer = { ...mockImportedBeer, ibu };
        const result = (BeerHistoryService as any).validateImportedBeer(beer);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('IBU must be a positive number');
      });
    });

    it('should validate rating range', () => {
      const invalidRatings = [-1, 6];
      
      invalidRatings.forEach(rating => {
        const beer = { ...mockImportedBeer, rating };
        const result = (BeerHistoryService as any).validateImportedBeer(beer);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Rating must be a number between 0 and 5');
      });
    });

    it('should validate import source', () => {
      const beer = { ...mockImportedBeer, source: 'invalid' as any };
      const result = (BeerHistoryService as any).validateImportedBeer(beer);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid import source');
    });

    it('should accept valid beer', () => {
      const result = (BeerHistoryService as any).validateImportedBeer(mockImportedBeer);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});