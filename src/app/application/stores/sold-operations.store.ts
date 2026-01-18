import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { TradeOperation } from '../../domain/models/trade-operation';
import { OperationsUseCases } from '../use-cases/operations.use-cases';

interface SoldOperationsState {
  operations: TradeOperation[];
  loading: boolean;
  error: string | null;
}

const initialState: SoldOperationsState = {
  operations: [],
  loading: false,
  error: null
};

export const SoldOperationsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const operationsUseCases = inject(OperationsUseCases);

    const load = async () => {
      patchState(store, { loading: true, error: null });
      try {
        const operations = await operationsUseCases.listSold();
        patchState(store, { operations, loading: false });
      } catch (error) {
        patchState(store, { loading: false, error: (error as Error).message });
      }
    };

    const updateOperation = async (operation: TradeOperation) => {
      patchState(store, { loading: true, error: null });
      try {
        await operationsUseCases.updateOperation(operation);
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

    return {
      load,
      updateOperation,
      deleteOperation
    };
  })
);