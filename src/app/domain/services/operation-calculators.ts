import { TradeOperation } from '../models/trade-operation';
import { normalizeKamas } from '../models/money';
import { FeePolicy } from './fee-policy';

export interface OperationMetrics {
  saleFee: number | null;
  feeRate: number | null;
  netProfit: number | null;
  margin: number | null;
  expectedProfit: number | null;
  expectedMargin: number | null;
  daysOnMarket: number;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const computeSaleFee = (
  sellPrice: number,
  feePolicy: FeePolicy,
  priceModified?: boolean
): number => {
  return feePolicy.calculateFee(normalizeKamas(sellPrice), priceModified);
};

export const computeNetProfit = (
  sellPrice: number,
  buyPrice: number,
  saleFee: number
): number => {
  return normalizeKamas(sellPrice) - normalizeKamas(buyPrice) - normalizeKamas(saleFee);
};

export const computeMargin = (netProfit: number, buyPrice: number): number | null => {
  const normalizedBuy = normalizeKamas(buyPrice);
  if (normalizedBuy <= 0) {
    return null;
  }
  return netProfit / normalizedBuy;
};

export const computeDaysOnMarket = (operation: TradeOperation, now = new Date()): number => {
  const start = operation.boughtAt;
  const end = operation.status === 'SOLD' && operation.soldAt ? operation.soldAt : now;
  const diff = end.getTime() - start.getTime();
  return Math.max(0, diff / MS_PER_DAY);
};

export const computeOperationMetrics = (
  operation: TradeOperation,
  feePolicy: FeePolicy,
  now = new Date()
): OperationMetrics => {
  const hasSellPrice = typeof operation.sellPrice === 'number';
  const saleFee = hasSellPrice
    ? computeSaleFee(operation.sellPrice ?? 0, feePolicy, operation.priceModified)
    : null;
  const feeRate = hasSellPrice ? feePolicy.getFeeRate(operation.priceModified) : null;

  let netProfit: number | null = null;
  let margin: number | null = null;
  let expectedProfit: number | null = null;
  let expectedMargin: number | null = null;

  if (hasSellPrice && saleFee !== null) {
    const computedProfit = computeNetProfit(operation.sellPrice ?? 0, operation.buyPrice, saleFee);
    if (operation.status === 'SOLD') {
      netProfit = computedProfit;
      margin = computeMargin(computedProfit, operation.buyPrice);
    } else {
      expectedProfit = computedProfit;
      expectedMargin = computeMargin(computedProfit, operation.buyPrice);
    }
  }

  return {
    saleFee,
    feeRate,
    netProfit,
    margin,
    expectedProfit,
    expectedMargin,
    daysOnMarket: computeDaysOnMarket(operation, now)
  };
};