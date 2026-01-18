import { GameServer } from '../../domain/models/server';
import { ServerEntity } from '../dexie/entities';

export const mapServerEntityToDomain = (entity: ServerEntity): GameServer => ({
  id: entity.id,
  name: entity.name
});

export const mapServerDomainToEntity = (server: GameServer): ServerEntity => ({
  id: server.id,
  name: server.name
});