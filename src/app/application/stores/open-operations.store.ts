import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { TradeOperation } from '../../domain/models/trade-operation';
import { GameServer } from '../../domain/models/server';
import { OperationsUseCases } from '../use-cases/operations.use-cases';
import { ServersUseCases } from '../use-cases/servers.use-cases';

interface OpenOperationsState {
  operations: TradeOperation[];
  servers: GameServer[];
  itemNames: string[];
  loading: boolean;
  error: string | null;
}

const initialState: OpenOperationsState = {
  operations: [],
  servers: [],
  itemNames: [],
  loading: false,
  error: null
};

export const OpenOperationsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    openCount: computed(() => store.operations().length)
  })),
  withMethods((store) => {
    const operationsUseCases = inject(OperationsUseCases);
    const serversUseCases = inject(ServersUseCases);

    const load = async () => {
      patchState(store, { loading: true, error: null });
      try {
        const [operations, servers, itemNames] = await Promise.all([
          operationsUseCases.listOpen(),
          serversUseCases.ensureDefault({ id: 'orukam', name: 'Orukam' }),
          operationsUseCases.listItemNames()
        ]);
        patchState(store, { operations, servers, itemNames, loading: false });
      } catch (error) {
        patchState(store, { loading: false, error: (error as Error).message });
      }
    };

    const addOperations = async (operations: TradeOperation[]) => {
      patchState(store, { loading: true, error: null });
      try {
        await operationsUseCases.addOperations(operations);
        await load();
      } catch (error) {
        patchState(store, { loading: false, error: (error as Error).message });
      }
    };

    const deleteOperation = async (id: number) => {
      patchState(store, { loading: true, error: null });
      try {
        await operationsUseCases.deleteOperation(id);
        await load();
      } catch (error) {
        patchState(store, { loading: false, error: (error as Error).message });
      }
    };

    const validateSale = async (payload: {
      id: number;
      sellPrice: number;
      soldAt: Date;
      priceModified?: boolean;
      comment?: string | null;
    }) => {
      patchState(store, { loading: true, error: null });
      try {
        await operationsUseCases.validateSale(payload.id, payload);
        await load();
      } catch (error) {
        patchState(store, { loading: false, error: (error as Error).message });
      }
    };

    return {
      load,
      addOperations,
      deleteOperation,
      validateSale
    };
  })
);