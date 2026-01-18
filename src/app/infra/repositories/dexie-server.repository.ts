import { Injectable } from '@angular/core';
import { ServerRepository } from '../../application/ports/server-repository';
import { GameServer } from '../../domain/models/server';
import { DexieDbService } from '../dexie/dexie-db.service';
import { mapServerDomainToEntity, mapServerEntityToDomain } from '../mappers/server-mapper';

@Injectable({ providedIn: 'root' })
export class DexieServerRepository implements ServerRepository {
  constructor(private readonly dbService: DexieDbService) {}

  async list(): Promise<GameServer[]> {
    const entities = await this.dbService.db.servers.toArray();
    return entities.map(mapServerEntityToDomain);
  }

  async upsert(server: GameServer): Promise<void> {
    await this.dbService.db.servers.put(mapServerDomainToEntity(server));
  }

  async delete(id: string): Promise<void> {
    await this.dbService.db.servers.delete(id);
  }

  async replaceAll(servers: GameServer[]): Promise<void> {
    const entities = servers.map(mapServerDomainToEntity);
    await this.dbService.db.transaction('rw', this.dbService.db.servers, async () => {
      await this.dbService.db.servers.clear();
      if (entities.length > 0) {
        await this.dbService.db.servers.bulkAdd(entities);
      }
    });
  }
}