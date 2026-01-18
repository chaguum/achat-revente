import { computed, inject } from '@angular/core';
import { signalStore, withComputed } from '@ngrx/signals';
import { buildRowView, computeOpportunity } from '../../domain/logic/analysis';
import { KpiStats, Opportunity } from '../../domain/models/market.models';
import { FiltersStore } from './filters.store';
import { ImportStore } from './import.store';

const emptyKpis: KpiStats = {
  topNetSpread: 0,
  averageNetSpread: 0,
  profitableCount: 0,
  totalCount: 0
};

export const AnalysisStore = signalStore(
  { providedIn: 'root' },
  withComputed(() => {
    const importStore = inject(ImportStore);
    const filtersStore = inject(FiltersStore);

    const visibleServers = computed(() => {
      const selected = filtersStore.selectedServers();
      return selected.length ? selected : importStore.servers();
    });

    const sourceServer = computed(() => filtersStore.sourceServer());
    const targetServer = computed(() => filtersStore.targetServer());

    const rowViews = computed(() => {
      const rows = importStore.rows();
      const source = sourceServer();
      const target = targetServer();
      return rows.map((row) => buildRowView(row, source, target));
    });

    const filteredRows = computed(() => rowViews());

    const opportunities = computed<Opportunity[]>(() => {
      const source = sourceServer();
      const target = targetServer();
      return rowViews()
        .map((row) => computeOpportunity(row, source, target))
        .filter((row): row is Opportunity => row !== null);
    });

    const profitableOpportunities = computed(() =>
      opportunities().filter((row) => row.netSpread > 0)
    );

    const kpis = computed<KpiStats>(() => {
      const list = profitableOpportunities();
      if (!list.length) {
        return { ...emptyKpis, totalCount: opportunities().length };
      }

      const totalSpread = list.reduce((sum, row) => sum + row.netSpread, 0);
      const topNetSpread = Math.max(...list.map((row) => row.netSpread));

      return {
        topNetSpread,
        averageNetSpread: totalSpread / list.length,
        profitableCount: list.length,
        totalCount: opportunities().length
      };
    });

    const topOpportunities = computed(() =>
      [...profitableOpportunities()]
        .sort((a, b) => b.netSpread - a.netSpread)
        .slice(0, 10)
    );

    return {
      visibleServers,
      sourceServer,
      targetServer,
      rowViews,
      filteredRows,
      opportunities,
      profitableOpportunities,
      kpis,
      topOpportunities
    };
  })
);
