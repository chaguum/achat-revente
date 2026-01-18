import { AnalyticsSnapshot, ItemCountStat, ItemMarginStat, ItemProfitStat, ItemSpeedStat, ProfitSeriesPoint } from '../models/analytics';
import { TradeOperation } from '../models/trade-operation';
import { FeePolicy } from './fee-policy';
import { computeOperationMetrics } from './operation-calculators';

const clampTop = <T>(items: T[], top = 5): T[] => items.slice(0, top);

const formatPeriod = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  return `${year}-${month}`;
};

export const computeAnalyticsSnapshot = (
  operations: TradeOperation[],
  feePolicy: FeePolicy
): AnalyticsSnapshot => {
  const soldOperations = operations.filter((operation) => operation.status === 'SOLD');
  if (soldOperations.length === 0) {
    return {
      totalSold: 0,
      averageDaysToSell: 0,
      mostSold: [],
      fastestToSell: [],
      topMargins: [],
      topProfits: [],
      profitSeries: []
    };
  }

  const itemCountMap = new Map<string, number>();
  const itemDaysMap = new Map<string, { totalDays: number; count: number }>();
  const itemMarginMap = new Map<string, { totalMargin: number; count: number }>();
  const itemProfitMap = new Map<string, number>();
  const profitSeriesMap = new Map<string, number>();

  let totalDays = 0;
  let totalSold = 0;

  for (const operation of soldOperations) {
    if (operation.sellPrice === null || operation.sellPrice === undefined) {
      continue;
    }
    const metrics = computeOperationMetrics(operation, feePolicy);
    totalSold += 1;
    totalDays += metrics.daysOnMarket;

    const itemName = operation.itemName;
    itemCountMap.set(itemName, (itemCountMap.get(itemName) ?? 0) + 1);

    const daysEntry = itemDaysMap.get(itemName) ?? { totalDays: 0, count: 0 };
    daysEntry.totalDays += metrics.daysOnMarket;
    daysEntry.count += 1;
    itemDaysMap.set(itemName, daysEntry);

    if (metrics.margin !== null) {
      const marginEntry = itemMarginMap.get(itemName) ?? { totalMargin: 0, count: 0 };
      marginEntry.totalMargin += metrics.margin;
      marginEntry.count += 1;
      itemMarginMap.set(itemName, marginEntry);
    }

    if (metrics.netProfit !== null) {
      itemProfitMap.set(itemName, (itemProfitMap.get(itemName) ?? 0) + metrics.netProfit);
    }

    if (operation.soldAt) {
      const period = formatPeriod(operation.soldAt);
      const current = profitSeriesMap.get(period) ?? 0;
      profitSeriesMap.set(period, current + (metrics.netProfit ?? 0));
    }
  }

  const mostSold: ItemCountStat[] = clampTop(
    [...itemCountMap.entries()]
      .map(([itemName, count]) => ({ itemName, count }))
      .sort((a, b) => b.count - a.count)
  );

  const fastestToSell: ItemSpeedStat[] = clampTop(
    [...itemDaysMap.entries()]
      .map(([itemName, data]) => ({ itemName, avgDaysToSell: data.totalDays / data.count }))
      .sort((a, b) => a.avgDaysToSell - b.avgDaysToSell)
  );

  const topMargins: ItemMarginStat[] = clampTop(
    [...itemMarginMap.entries()]
      .map(([itemName, data]) => ({ itemName, margin: data.totalMargin / data.count }))
      .sort((a, b) => b.margin - a.margin)
  );

  const topProfits: ItemProfitStat[] = clampTop(
    [...itemProfitMap.entries()]
      .map(([itemName, netProfit]) => ({ itemName, netProfit }))
      .sort((a, b) => b.netProfit - a.netProfit)
  );

  const profitSeries: ProfitSeriesPoint[] = [...profitSeriesMap.entries()]
    .map(([period, totalProfit]) => ({ period, totalProfit }))
    .sort((a, b) => a.period.localeCompare(b.period));

  return {
    totalSold,
    averageDaysToSell: totalSold > 0 ? totalDays / totalSold : 0,
    mostSold,
    fastestToSell,
    topMargins,
    topProfits,
    profitSeries
  };
};