import { Injectable } from '@angular/core';
import { OperationRepository } from '../../application/ports/operation-repository';
import { TradeOperation, OperationStatus } from '../../domain/models/trade-operation';
import { DexieDbService } from '../dexie/dexie-db.service';
import { mapOperationDomainToEntity, mapOperationEntityToDomain } from '../mappers/operation-mapper';

@Injectable({ providedIn: 'root' })
export class DexieOperationRepository implements OperationRepository {
  constructor(private readonly dbService: DexieDbService) {}

  async addMany(operations: TradeOperation[]): Promise<void> {
    const entities = operations.map(mapOperationDomainToEntity);
    await this.dbService.db.operations.bulkAdd(entities);
  }

  async update(operation: TradeOperation): Promise<void> {
    await this.dbService.db.operations.put(mapOperationDomainToEntity(operation));
  }

  async delete(id: number): Promise<void> {
    await this.dbService.db.operations.delete(id);
  }

  async getById(id: number): Promise<TradeOperation | undefined> {
    const entity = await this.dbService.db.operations.get(id);
    return entity ? mapOperationEntityToDomain(entity) : undefined;
  }

  async listByStatus(status: OperationStatus): Promise<TradeOperation[]> {
    const entities = await this.dbService.db.operations.where('status').equals(status).toArray();
    return entities.map(mapOperationEntityToDomain);
  }

  async listAll(): Promise<TradeOperation[]> {
    const entities = await this.dbService.db.operations.toArray();
    return entities.map(mapOperationEntityToDomain);
  }

  async listItemNames(): Promise<string[]> {
    const keys = await this.dbService.db.operations.orderBy('itemName').uniqueKeys();
    return keys.map((key) => `${key}`);
  }

  async replaceAll(operations: TradeOperation[]): Promise<void> {
    const entities = operations.map(mapOperationDomainToEntity);
    await this.dbService.db.transaction('rw', this.dbService.db.operations, async () => {
      await this.dbService.db.operations.clear();
      if (entities.length > 0) {
        await this.dbService.db.operations.bulkAdd(entities);
      }
    });
  }
}