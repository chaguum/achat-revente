export interface FeePolicy {
  getFeeRate(priceModified?: boolean): number;
  calculateFee(sellPrice: number, priceModified?: boolean): number;
}

export class DefaultFeePolicy implements FeePolicy {
  private readonly baseRate = 0.02;
  private readonly modifiedExtra = 0.01;

  getFeeRate(priceModified?: boolean): number {
    return priceModified ? this.baseRate + this.modifiedExtra : this.baseRate;
  }

  calculateFee(sellPrice: number, priceModified?: boolean): number {
    const rate = this.getFeeRate(priceModified);
    return Math.floor(sellPrice * rate);
  }
}