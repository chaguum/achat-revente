import { inject, Injectable } from '@angular/core';
import { GameServer } from '../../domain/models/server';
import { SERVER_REPOSITORY } from '../../core/tokens/repositories';

@Injectable({ providedIn: 'root' })
export class ServersUseCases {
  private readonly repository = inject(SERVER_REPOSITORY);

  list(): Promise<GameServer[]> {
    return this.repository.list();
  }

  upsert(server: GameServer): Promise<void> {
    return this.repository.upsert(server);
  }

  delete(id: string): Promise<void> {
    return this.repository.delete(id);
  }

  async ensureDefault(defaultServer: GameServer): Promise<GameServer[]> {
    const servers = await this.repository.list();
    if (servers.length === 0) {
      await this.repository.upsert(defaultServer);
      return [defaultServer];
    }
    return servers;
  }

  replaceAll(servers: GameServer[]): Promise<void> {
    return this.repository.replaceAll(servers);
  }
}