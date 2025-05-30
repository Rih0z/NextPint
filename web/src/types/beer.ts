export interface ImportedBeer {
  id: string;
  name: string;
  brewery: string;
  style: string;
  rating: number;
  abv?: number;
  ibu?: number;
  notes?: string;
  imageUrl?: string;
  source: ImportSource;
  sourceId?: string;
  checkinDate?: Date;
  location?: string;
  venue?: string;
  tags: string[];
  importedAt: Date;
  updatedAt: Date;
}

export enum ImportSource {
  UNTAPPD = 'untappd',
  RATEBEER = 'ratebeer',
  BEERADVOCATE = 'beeradvocate',
  MANUAL = 'manual',
}

export interface BeerFilter {
  styles?: string[];
  breweries?: string[];
  ratingRange?: {min: number; max: number};
  dateRange?: {start: Date; end: Date};
  sources?: ImportSource[];
  searchText?: string;
}