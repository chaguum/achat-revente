export type AcquisitionType = 'BUY' | 'CRAFT';
export type OperationStatus = 'OPEN' | 'SOLD';

export interface TradeOperation {
  id?: number;
  server: string;
  itemName: string;
  acquisitionType: AcquisitionType;
  buyPrice: number;
  boughtAt: Date;
  comment?: string;
  status: OperationStatus;
  soldAt?: Date | null;
  sellPrice?: number | null;
  priceModified?: boolean;
}