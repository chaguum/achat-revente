import { ItemRowView } from '../models/market.models';
import { normalizeFilterText } from './price-utils';

export interface RowFilters {
  text: string;
  minPrice: number | null;
  maxPrice: number | null;
  excludeMissing: boolean;
  onlyProfitable: boolean;
}

export function matchesRowFilters(
  row: ItemRowView,
  servers: string[],
  filters: RowFilters
): boolean {
  const query = normalizeFilterText(filters.text);

  if (query && !normalizeFilterText(row.itemName).includes(query)) {
    return false;
  }

  if (filters.excludeMissing) {
    const hasAll = servers.every((server) => {
      const price = row.pricesByServer[server];
      return price !== null && price !== undefined;
    });

    if (!hasAll) {
      return false;
    }
  }

  if (filters.minPrice !== null) {
    if (row.sourcePrice === null || row.sourcePrice < filters.minPrice) {
      return false;
    }
  }

  if (filters.maxPrice !== null) {
    if (row.sourcePrice === null || row.sourcePrice > filters.maxPrice) {
      return false;
    }
  }

  if (filters.onlyProfitable) {
    if (row.netSpread === null || row.netSpread <= 0) {
      return false;
    }
  }

  return true;
}

