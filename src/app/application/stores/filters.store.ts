import { effect, inject } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { ImportStore } from './import.store';

interface FiltersState {
  selectedServers: string[];
  sourceServer: string | null;
  targetServer: string | null;
}

const initialState: FiltersState = {
  selectedServers: [],
  sourceServer: null,
  targetServer: null
};

const sameArray = (a: string[], b: string[]) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

export const FiltersStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    setSelectedServers(selectedServers: string[]) {
      patchState(store, { selectedServers });
    },
    setSourceServer(sourceServer: string | null) {
      patchState(store, { sourceServer });
    },
    setTargetServer(targetServer: string | null) {
      patchState(store, { targetServer });
    },
    swapServers() {
      const sourceServer = store.sourceServer();
      const targetServer = store.targetServer();
      patchState(store, { sourceServer: targetServer, targetServer: sourceServer });
    }
  })),
  withHooks({
    onInit(store) {
      const importStore = inject(ImportStore);

      effect(() => {
        const servers = importStore.servers();
        if (!servers.length) {
          if (
            store.selectedServers().length ||
            store.sourceServer() !== null ||
            store.targetServer() !== null
          ) {
            patchState(store, { selectedServers: [], sourceServer: null, targetServer: null });
          }
          return;
        }

        let sourceServer = store.sourceServer();
        if (!sourceServer || !servers.includes(sourceServer)) {
          sourceServer = servers[0];
        }

        let targetServer = store.targetServer();
        if (!targetServer || !servers.includes(targetServer)) {
          targetServer = servers[1] ?? servers[0];
        }

        if (sourceServer === targetServer && servers.length > 1) {
          targetServer = servers.find((server) => server !== sourceServer) ?? sourceServer;
        }

        const selected = store.selectedServers().filter((server) => servers.includes(server));
        const selectedSet = new Set(selected);
        selectedSet.add(sourceServer);
        selectedSet.add(targetServer);

        const nextSelected = servers.filter((server) => selectedSet.has(server));
        const patch: Partial<FiltersState> = {};

        if (!sameArray(store.selectedServers(), nextSelected)) {
          patch.selectedServers = nextSelected;
        }

        if (store.sourceServer() !== sourceServer) {
          patch.sourceServer = sourceServer;
        }

        if (store.targetServer() !== targetServer) {
          patch.targetServer = targetServer;
        }

        if (Object.keys(patch).length) {
          patchState(store, patch);
        }
      });
    }
  })
);
