export interface ItemPriceRow {
  itemName: string;
  pricesByServer: Record<string, number | null>;
}

export interface SheetData {
  sheetName: string;
  servers: string[];
  rows: ItemPriceRow[];
}

export interface Opportunity {
  itemName: string;
  sourceServer: string;
  targetServer: string;
  sourcePrice: number;
  targetPrice: number;
  netSpread: number;
  profitPercent: number;
}

export interface ItemRowView extends ItemPriceRow {
  sourceServer: string | null;
  targetServer: string | null;
  sourcePrice: number | null;
  targetPrice: number | null;
  netSpread: number | null;
  profitPercent: number | null;
}

export interface KpiStats {
  topNetSpread: number;
  averageNetSpread: number;
  profitableCount: number;
  totalCount: number;
}

