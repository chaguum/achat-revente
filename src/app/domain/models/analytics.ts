export interface ItemCountStat {
  itemName: string;
  count: number;
}

export interface ItemSpeedStat {
  itemName: string;
  avgDaysToSell: number;
}

export interface ItemMarginStat {
  itemName: string;
  margin: number;
}

export interface ItemProfitStat {
  itemName: string;
  netProfit: number;
}

export interface ProfitSeriesPoint {
  period: string;
  totalProfit: number;
}

export interface AnalyticsSnapshot {
  totalSold: number;
  averageDaysToSell: number;
  mostSold: ItemCountStat[];
  fastestToSell: ItemSpeedStat[];
  topMargins: ItemMarginStat[];
  topProfits: ItemProfitStat[];
  profitSeries: ProfitSeriesPoint[];
}