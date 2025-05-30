import {BeerHistoryService} from '../BeerHistoryService';
import {StorageService} from '../StorageService';
import {ImportedBeer, ImportSource} from '@types';

jest.mock('../StorageService');

describe('BeerHistoryService', () => {
  const mockBeer: Omit<ImportedBeer, 'id' | 'importedAt'> = {
    name: 'Test IPA',
    brewery: 'Test Brewery',
    style: 'IPA',
    rating: 4.5,
    abv: 6.5,
    ibu: 65,
    source: ImportSource.UNTAPPD,
    tags: ['hoppy', 'citrus'],
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (StorageService.getItem as jest.Mock).mockResolvedValue([]);
  });

  describe('addImportedBeer', () => {
    it('should add a new beer with generated id and timestamp', async () => {
      (StorageService.setItem as jest.Mock).mockResolvedValue(undefined);

      const result = await BeerHistoryService.addImportedBeer(mockBeer);

      expect(result).toMatchObject({
        ...mockBeer,
        id: expect.any(String),
        importedAt: expect.any(Date),
      });

      expect(StorageService.setItem).toHaveBeenCalledWith(
        'imported_beers',
        expect.arrayContaining([
          expect.objectContaining({
            ...mockBeer,
            id: expect.any(String),
          }),
        ])
      );
    });

    it('should validate beer data before adding', async () => {
      const invalidBeer = {...mockBeer, name: ''};

      await expect(
        BeerHistoryService.addImportedBeer(invalidBeer)
      ).rejects.toThrow('Invalid beer data: Beer name is required');
    });

    it('should validate rating range', async () => {
      const invalidBeer = {...mockBeer, rating: 6};

      await expect(
        BeerHistoryService.addImportedBeer(invalidBeer)
      ).rejects.toThrow('Rating must be a number between 0 and 5');
    });
  });

  describe('addImportedBeers', () => {
    it('should add multiple beers at once', async () => {
      const beers = [
        mockBeer,
        {...mockBeer, name: 'Test Stout', style: 'Stout', rating: 4.2},
      ];

      const result = await BeerHistoryService.addImportedBeers(beers);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({name: 'Test IPA'});
      expect(result[1]).toMatchObject({name: 'Test Stout'});
    });

    it('should validate all beers before adding', async () => {
      const beers = [
        mockBeer,
        {...mockBeer, brewery: ''}, // Invalid
      ];

      await expect(
        BeerHistoryService.addImportedBeers(beers)
      ).rejects.toThrow('Brewery name is required');
    });
  });

  describe('filterBeers', () => {
    const testBeers: ImportedBeer[] = [
      {
        id: '1',
        name: 'Test IPA',
        brewery: 'Brewery A',
        style: 'IPA',
        rating: 4.5,
        source: ImportSource.UNTAPPD,
        tags: ['hoppy'],
        importedAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: '2',
        name: 'Test Stout',
        brewery: 'Brewery B',
        style: 'Stout',
        rating: 4.0,
        source: ImportSource.RATEBEER,
        tags: ['roasted'],
        importedAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
      },
      {
        id: '3',
        name: 'Test Lager',
        brewery: 'Brewery A',
        style: 'Lager',
        rating: 3.5,
        source: ImportSource.UNTAPPD,
        tags: ['crisp'],
        importedAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
      },
    ];

    beforeEach(() => {
      (StorageService.getItem as jest.Mock).mockResolvedValue(testBeers);
    });

    it('should filter by style', async () => {
      const result = await BeerHistoryService.filterBeers({
        styles: ['IPA'],
      });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Test IPA');
    });

    it('should filter by brewery', async () => {
      const result = await BeerHistoryService.filterBeers({
        breweries: ['Brewery A'],
      });

      expect(result).toHaveLength(2);
      expect(result.map(b => b.name)).toContain('Test IPA');
      expect(result.map(b => b.name)).toContain('Test Lager');
    });

    it('should filter by rating range', async () => {
      const result = await BeerHistoryService.filterBeers({
        ratingRange: {min: 4.0, max: 5.0},
      });

      expect(result).toHaveLength(2);
      expect(result.map(b => b.rating)).toEqual([4.5, 4.0]);
    });

    it('should filter by search text', async () => {
      const result = await BeerHistoryService.filterBeers({
        searchText: 'stout',
      });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Test Stout');
    });

    it('should combine multiple filters', async () => {
      const result = await BeerHistoryService.filterBeers({
        styles: ['IPA', 'Lager'],
        breweries: ['Brewery A'],
        ratingRange: {min: 4.0, max: 5.0},
      });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Test IPA');
    });
  });

  describe('getBeerStats', () => {
    it('should calculate statistics correctly', async () => {
      const beers: ImportedBeer[] = [
        {
          id: '1',
          name: 'Beer 1',
          brewery: 'Brewery A',
          style: 'IPA',
          rating: 4.5,
          source: ImportSource.UNTAPPD,
          tags: [],
          importedAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Beer 2',
          brewery: 'Brewery A',
          style: 'IPA',
          rating: 4.0,
          source: ImportSource.UNTAPPD,
          tags: [],
          importedAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '3',
          name: 'Beer 3',
          brewery: 'Brewery B',
          style: 'Stout',
          rating: 3.5,
          source: ImportSource.UNTAPPD,
          tags: [],
          importedAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (StorageService.getItem as jest.Mock).mockResolvedValue(beers);

      const stats = await BeerHistoryService.getBeerStats();

      expect(stats).toEqual({
        totalCount: 3,
        averageRating: 4.0,
        topBreweries: [
          {name: 'Brewery A', count: 2},
          {name: 'Brewery B', count: 1},
        ],
        topStyles: [
          {name: 'IPA', count: 2},
          {name: 'Stout', count: 1},
        ],
      });
    });

    it('should handle empty beer list', async () => {
      (StorageService.getItem as jest.Mock).mockResolvedValue([]);

      const stats = await BeerHistoryService.getBeerStats();

      expect(stats).toEqual({
        totalCount: 0,
        averageRating: 0,
        topBreweries: [],
        topStyles: [],
      });
    });
  });

  describe('updateImportedBeer', () => {
    it('should update existing beer', async () => {
      const existingBeer: ImportedBeer = {
        id: 'test-id',
        ...mockBeer,
        importedAt: new Date(),
      };

      (StorageService.getItem as jest.Mock).mockResolvedValue([existingBeer]);
      (StorageService.setItem as jest.Mock).mockResolvedValue(undefined);

      await BeerHistoryService.updateImportedBeer('test-id', {rating: 5});

      expect(StorageService.setItem).toHaveBeenCalledWith(
        'imported_beers',
        expect.arrayContaining([
          expect.objectContaining({
            id: 'test-id',
            rating: 5,
            updatedAt: expect.any(Date),
          }),
        ])
      );
    });

    it('should throw error if beer not found', async () => {
      (StorageService.getItem as jest.Mock).mockResolvedValue([]);

      await expect(
        BeerHistoryService.updateImportedBeer('non-existent', {rating: 5})
      ).rejects.toThrow('Beer with id non-existent not found');
    });
  });
});