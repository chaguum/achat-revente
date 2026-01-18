import { TradeOperation, OperationStatus } from '../../domain/models/trade-operation';

export interface OperationRepository {
  addMany(operations: TradeOperation[]): Promise<void>;
  update(operation: TradeOperation): Promise<void>;
  delete(id: number): Promise<void>;
  getById(id: number): Promise<TradeOperation | undefined>;
  listByStatus(status: OperationStatus): Promise<TradeOperation[]>;
  listAll(): Promise<TradeOperation[]>;
  listItemNames(): Promise<string[]>;
  replaceAll(operations: TradeOperation[]): Promise<void>;
}