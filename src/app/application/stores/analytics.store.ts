import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { AnalyticsSnapshot } from '../../domain/models/analytics';
import { AnalyticsUseCases } from '../use-cases/analytics.use-cases';

interface AnalyticsState {
  snapshot: AnalyticsSnapshot;
  loading: boolean;
  error: string | null;
}

const emptySnapshot: AnalyticsSnapshot = {
  totalSold: 0,
  averageDaysToSell: 0,
  mostSold: [],
  fastestToSell: [],
  topMargins: [],
  topProfits: [],
  profitSeries: []
};

const initialState: AnalyticsState = {
  snapshot: emptySnapshot,
  loading: false,
  error: null
};

export const AnalyticsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const analyticsUseCases = inject(AnalyticsUseCases);

    const load = async () => {
      patchState(store, { loading: true, error: null });
      try {
        const snapshot = await analyticsUseCases.computeSnapshot();
        patchState(store, { snapshot, loading: false });
      } catch (error) {
        patchState(store, { loading: false, error: (error as Error).message });
      }
    };

    return { load };
  })
);