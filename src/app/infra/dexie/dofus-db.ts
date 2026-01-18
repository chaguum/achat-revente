import Dexie, { Table } from 'dexie';
import { OperationEntity, ServerEntity } from './entities';

export class DofusTradesDb extends Dexie {
  operations!: Table<OperationEntity, number>;
  servers!: Table<ServerEntity, string>;

  constructor() {
    super('dofus-trades-db');
    this.version(1).stores({
      operations: '++id, server, itemName, status, boughtAt, soldAt',
      servers: 'id, name'
    });
  }
}