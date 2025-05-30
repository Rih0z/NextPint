import {v4 as uuidv4} from 'uuid';
import {ImportedBeer, BeerFilter, ImportSource, ValidationResult} from '@types';
import {StorageService} from './StorageService';

export class BeerHistoryService {
  private static readonly STORAGE_KEY = StorageService.getStorageKeys().IMPORTED_BEERS;

  static async getImportedBeers(): Promise<ImportedBeer[]> {
    const beers = await StorageService.getItem<ImportedBeer[]>(this.STORAGE_KEY);
    return beers || [];
  }

  static async addImportedBeer(beer: Omit<ImportedBeer, 'id' | 'importedAt'>): Promise<ImportedBeer> {
    const newBeer: ImportedBeer = {
      ...beer,
      id: uuidv4(),
      importedAt: new Date(),
      updatedAt: new Date(),
    };

    const validation = this.validateImportedBeer(newBeer);
    if (!validation.isValid) {
      throw new Error(`Invalid beer data: ${validation.errors.join(', ')}`);
    }

    const beers = await this.getImportedBeers();
    beers.push(newBeer);
    await StorageService.setItem(this.STORAGE_KEY, beers);

    return newBeer;
  }

  static async addImportedBeers(beers: Omit<ImportedBeer, 'id' | 'importedAt'>[]): Promise<ImportedBeer[]> {
    const newBeers: ImportedBeer[] = beers.map(beer => ({
      ...beer,
      id: uuidv4(),
      importedAt: new Date(),
      updatedAt: new Date(),
    }));

    // Validate all beers
    for (const beer of newBeers) {
      const validation = this.validateImportedBeer(beer);
      if (!validation.isValid) {
        throw new Error(`Invalid beer data for ${beer.name}: ${validation.errors.join(', ')}`);
      }
    }

    const existingBeers = await this.getImportedBeers();
    const allBeers = [...existingBeers, ...newBeers];
    await StorageService.setItem(this.STORAGE_KEY, allBeers);

    return newBeers;
  }

  static async updateImportedBeer(id: string, updates: Partial<ImportedBeer>): Promise<void> {
    const beers = await this.getImportedBeers();
    const beerIndex = beers.findIndex(beer => beer.id === id);

    if (beerIndex === -1) {
      throw new Error(`Beer with id ${id} not found`);
    }

    beers[beerIndex] = {
      ...beers[beerIndex],
      ...updates,
      updatedAt: new Date(),
    };

    const validation = this.validateImportedBeer(beers[beerIndex]);
    if (!validation.isValid) {
      throw new Error(`Invalid beer data: ${validation.errors.join(', ')}`);
    }

    await StorageService.setItem(this.STORAGE_KEY, beers);
  }

  static async deleteImportedBeer(id: string): Promise<void> {
    const beers = await this.getImportedBeers();
    const filteredBeers = beers.filter(beer => beer.id !== id);

    if (filteredBeers.length === beers.length) {
      throw new Error(`Beer with id ${id} not found`);
    }

    await StorageService.setItem(this.STORAGE_KEY, filteredBeers);
  }

  static async getImportedBeer(id: string): Promise<ImportedBeer | null> {
    const beers = await this.getImportedBeers();
    return beers.find(beer => beer.id === id) || null;
  }

  static async filterBeers(filter: BeerFilter): Promise<ImportedBeer[]> {
    const beers = await this.getImportedBeers();

    return beers.filter(beer => {
      // Style filter
      if (filter.styles && filter.styles.length > 0) {
        if (!filter.styles.includes(beer.style)) {
          return false;
        }
      }

      // Brewery filter
      if (filter.breweries && filter.breweries.length > 0) {
        if (!filter.breweries.includes(beer.brewery)) {
          return false;
        }
      }

      // Rating range filter
      if (filter.ratingRange) {
        if (beer.rating < filter.ratingRange.min || beer.rating > filter.ratingRange.max) {
          return false;
        }
      }

      // Date range filter
      if (filter.dateRange) {
        const checkinDate = beer.checkinDate ? new Date(beer.checkinDate) : new Date(beer.importedAt);
        if (checkinDate < filter.dateRange.start || checkinDate > filter.dateRange.end) {
          return false;
        }
      }

      // Source filter
      if (filter.sources && filter.sources.length > 0) {
        if (!filter.sources.includes(beer.source)) {
          return false;
        }
      }

      // Search text filter
      if (filter.searchText) {
        const searchText = filter.searchText.toLowerCase();
        const searchableText = [
          beer.name,
          beer.brewery,
          beer.style,
          beer.notes || '',
          ...beer.tags,
        ].join(' ').toLowerCase();

        if (!searchableText.includes(searchText)) {
          return false;
        }
      }

      return true;
    });
  }

  static async getUniqueStyles(): Promise<string[]> {
    const beers = await this.getImportedBeers();
    const styles = new Set(beers.map(beer => beer.style));
    return Array.from(styles).sort();
  }

  static async getUniqueBreweries(): Promise<string[]> {
    const beers = await this.getImportedBeers();
    const breweries = new Set(beers.map(beer => beer.brewery));
    return Array.from(breweries).sort();
  }

  static async getBeerStats(): Promise<{
    totalCount: number;
    averageRating: number;
    topBreweries: Array<{name: string; count: number}>;
    topStyles: Array<{name: string; count: number}>;
  }> {
    const beers = await this.getImportedBeers();

    if (beers.length === 0) {
      return {
        totalCount: 0,
        averageRating: 0,
        topBreweries: [],
        topStyles: [],
      };
    }

    // Calculate average rating
    const averageRating = beers.reduce((sum, beer) => sum + beer.rating, 0) / beers.length;

    // Count breweries
    const breweryCounts = new Map<string, number>();
    beers.forEach(beer => {
      breweryCounts.set(beer.brewery, (breweryCounts.get(beer.brewery) || 0) + 1);
    });

    // Count styles
    const styleCounts = new Map<string, number>();
    beers.forEach(beer => {
      styleCounts.set(beer.style, (styleCounts.get(beer.style) || 0) + 1);
    });

    // Sort and get top 5
    const topBreweries = Array.from(breweryCounts.entries())
      .map(([name, count]) => ({name, count}))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topStyles = Array.from(styleCounts.entries())
      .map(([name, count]) => ({name, count}))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalCount: beers.length,
      averageRating: Math.round(averageRating * 10) / 10,
      topBreweries,
      topStyles,
    };
  }

  static async clearAllBeers(): Promise<void> {
    await StorageService.removeItem(this.STORAGE_KEY);
  }

  private static validateImportedBeer(beer: ImportedBeer): ValidationResult {
    const errors: string[] = [];

    if (!beer.id) {
      errors.push('Beer ID is required');
    }

    if (!beer.name || beer.name.trim() === '') {
      errors.push('Beer name is required');
    }

    if (!beer.brewery || beer.brewery.trim() === '') {
      errors.push('Brewery name is required');
    }

    if (!beer.style || beer.style.trim() === '') {
      errors.push('Beer style is required');
    }

    if (typeof beer.rating !== 'number' || beer.rating < 0 || beer.rating > 5) {
      errors.push('Rating must be a number between 0 and 5');
    }

    if (beer.abv !== undefined && (typeof beer.abv !== 'number' || beer.abv < 0 || beer.abv > 100)) {
      errors.push('ABV must be a number between 0 and 100');
    }

    if (beer.ibu !== undefined && (typeof beer.ibu !== 'number' || beer.ibu < 0)) {
      errors.push('IBU must be a positive number');
    }

    if (!Object.values(ImportSource).includes(beer.source)) {
      errors.push('Invalid import source');
    }

    if (!beer.tags || !Array.isArray(beer.tags)) {
      errors.push('Tags must be an array');
    }

    if (!beer.importedAt) {
      errors.push('Import date is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}