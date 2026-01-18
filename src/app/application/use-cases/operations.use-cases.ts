import { inject, Injectable } from '@angular/core';
import { TradeOperation } from '../../domain/models/trade-operation';
import { OPERATION_REPOSITORY } from '../../core/tokens/repositories';

@Injectable({ providedIn: 'root' })
export class OperationsUseCases {
  private readonly repository = inject(OPERATION_REPOSITORY);

  listOpen(): Promise<TradeOperation[]> {
    return this.repository.listByStatus('OPEN');
  }

  listSold(): Promise<TradeOperation[]> {
    return this.repository.listByStatus('SOLD');
  }

  listAll(): Promise<TradeOperation[]> {
    return this.repository.listAll();
  }

  listItemNames(): Promise<string[]> {
    return this.repository.listItemNames();
  }

  addOperations(operations: TradeOperation[]): Promise<void> {
    const normalized = operations.map((operation) => this.normalizeOperation(operation));
    return this.repository.addMany(normalized);
  }

  updateOperation(operation: TradeOperation): Promise<void> {
    return this.repository.update(this.normalizeOperation(operation));
  }

  deleteOperation(id: number): Promise<void> {
    return this.repository.delete(id);
  }

  async validateSale(
    id: number,
    payload: {
      sellPrice: number;
      soldAt: Date;
      priceModified?: boolean;
      comment?: string | null;
    }
  ): Promise<TradeOperation> {
    const existing = await this.repository.getById(id);
    if (!existing) {
      throw new Error('Operation not found');
    }
    const updated: TradeOperation = {
      ...existing,
      status: 'SOLD',
      sellPrice: payload.sellPrice,
      soldAt: payload.soldAt,
      priceModified: payload.priceModified ?? false,
      comment: payload.comment ?? existing.comment
    };
    await this.repository.update(this.normalizeOperation(updated));
    return updated;
  }

  private normalizeOperation(operation: TradeOperation): TradeOperation {
    const buyPrice = Math.max(0, Math.floor(operation.buyPrice));
    const sellPrice =
      operation.sellPrice === null || operation.sellPrice === undefined
        ? null
        : Math.max(0, Math.floor(operation.sellPrice));
    const comment = operation.comment?.trim();
    return {
      ...operation,
      buyPrice,
      sellPrice,
      comment: comment ? comment : undefined
    };
  }
}
