import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { GameServer } from '../../domain/models/server';
import { ImportExportUseCases, BackupPayload } from '../use-cases/import-export.use-cases';
import { ServersUseCases } from '../use-cases/servers.use-cases';
import { SeedDefaultUseCases } from '../use-cases/seed-default.use-cases';

interface SettingsState {
  servers: GameServer[];
  loading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  servers: [],
  loading: false,
  error: null
};

export const SettingsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const serversUseCases = inject(ServersUseCases);
    const importExportUseCases = inject(ImportExportUseCases);
    const seedDefaultUseCases = inject(SeedDefaultUseCases);

    const load = async () => {
      patchState(store, { loading: true, error: null });
      try {
        const servers = await serversUseCases.ensureDefault({ id: 'orukam', name: 'Orukam' });
        patchState(store, { servers, loading: false });
      } catch (error) {
        patchState(store, { loading: false, error: (error as Error).message });
      }
    };

    const saveServer = async (server: GameServer) => {
      patchState(store, { loading: true, error: null });
      try {
        await serversUseCases.upsert(server);
        await load();
      } catch (error) {
        patchState(store, { loading: false, error: (error as Error).message });
      }
    };

    const deleteServer = async (id: string) => {
      patchState(store, { loading: true, error: null });
      try {
        await serversUseCases.delete(id);
        await load();
      } catch (error) {
        patchState(store, { loading: false, error: (error as Error).message });
      }
    };

    const exportJson = () => importExportUseCases.exportJson();

    const importJson = (payload: BackupPayload) => importExportUseCases.importJson(payload);

    const importExcel = (file: File) => importExportUseCases.importExcel(file);

    const exportCsv = () => importExportUseCases.exportCsv();

    const importDefaultDataset = () => seedDefaultUseCases.seedFromDefault({ replace: true });

    return {
      load,
      saveServer,
      deleteServer,
      exportJson,
      importJson,
      importExcel,
      exportCsv,
      importDefaultDataset
    };
  })
);
