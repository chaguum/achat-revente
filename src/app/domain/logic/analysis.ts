import { ItemPriceRow, ItemRowView, Opportunity } from '../models/market.models';

export interface SourceTargetMetrics {
  sourcePrice: number | null;
  targetPrice: number | null;
  netSpread: number | null;
  profitPercent: number | null;
}

export function computeSourceTargetMetrics(
  row: ItemPriceRow,
  sourceServer: string | null,
  targetServer: string | null
): SourceTargetMetrics {
  const sourcePrice = sourceServer ? row.pricesByServer[sourceServer] ?? null : null;
  const targetPrice = targetServer ? row.pricesByServer[targetServer] ?? null : null;

  if (sourcePrice === null || targetPrice === null) {
    return {
      sourcePrice,
      targetPrice,
      netSpread: null,
      profitPercent: null
    };
  }

  const netSpread = targetPrice - sourcePrice;
  const profitPercent = sourcePrice > 0 ? netSpread / sourcePrice : null;

  return { sourcePrice, targetPrice, netSpread, profitPercent };
}

export function computeOpportunity(
  row: ItemPriceRow,
  sourceServer: string | null,
  targetServer: string | null
): Opportunity | null {
  if (!sourceServer || !targetServer) {
    return null;
  }

  const metrics = computeSourceTargetMetrics(row, sourceServer, targetServer);
  if (
    metrics.sourcePrice === null ||
    metrics.targetPrice === null ||
    metrics.netSpread === null ||
    metrics.profitPercent === null
  ) {
    return null;
  }

  return {
    itemName: row.itemName,
    sourceServer,
    targetServer,
    sourcePrice: metrics.sourcePrice,
    targetPrice: metrics.targetPrice,
    netSpread: metrics.netSpread,
    profitPercent: metrics.profitPercent
  };
}

export function buildRowView(
  row: ItemPriceRow,
  sourceServer: string | null,
  targetServer: string | null
): ItemRowView {
  const metrics = computeSourceTargetMetrics(row, sourceServer, targetServer);

  return {
    ...row,
    sourceServer,
    targetServer,
    sourcePrice: metrics.sourcePrice,
    targetPrice: metrics.targetPrice,
    netSpread: metrics.netSpread,
    profitPercent: metrics.profitPercent
  };
}
