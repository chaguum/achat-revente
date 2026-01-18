import { TradeOperation } from '../../domain/models/trade-operation';
import { OperationEntity } from '../dexie/entities';

export const mapOperationEntityToDomain = (entity: OperationEntity): TradeOperation => ({
  id: entity.id,
  server: entity.server,
  itemName: entity.itemName,
  acquisitionType: entity.acquisitionType,
  buyPrice: entity.buyPrice,
  boughtAt: new Date(entity.boughtAt),
  comment: entity.comment,
  status: entity.status,
  soldAt: entity.soldAt ? new Date(entity.soldAt) : null,
  sellPrice: entity.sellPrice ?? null,
  priceModified: entity.priceModified ?? false
});

export const mapOperationDomainToEntity = (operation: TradeOperation): OperationEntity => ({
  id: operation.id,
  server: operation.server,
  itemName: operation.itemName,
  acquisitionType: operation.acquisitionType,
  buyPrice: operation.buyPrice,
  boughtAt: operation.boughtAt.toISOString(),
  comment: operation.comment,
  status: operation.status,
  soldAt: operation.soldAt ? operation.soldAt.toISOString() : null,
  sellPrice: operation.sellPrice ?? null,
  priceModified: operation.priceModified ?? false
});