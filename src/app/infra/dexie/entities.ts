export interface OperationEntity {
  id?: number;
  server: string;
  itemName: string;
  acquisitionType: 'BUY' | 'CRAFT';
  buyPrice: number;
  boughtAt: string;
  comment?: string;
  status: 'OPEN' | 'SOLD';
  soldAt?: string | null;
  sellPrice?: number | null;
  priceModified?: boolean;
}

export interface ServerEntity {
  id: string;
  name: string;
}