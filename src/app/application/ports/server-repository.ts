import { GameServer } from '../../domain/models/server';

export interface ServerRepository {
  list(): Promise<GameServer[]>;
  upsert(server: GameServer): Promise<void>;
  delete(id: string): Promise<void>;
  replaceAll(servers: GameServer[]): Promise<void>;
}