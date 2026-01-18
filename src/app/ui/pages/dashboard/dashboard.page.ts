import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageModule } from 'primeng/message';
import { AnalysisStore } from '../../../application/stores/analysis.store';
import { FiltersStore } from '../../../application/stores/filters.store';
import { ImportStore } from '../../../application/stores/import.store';
import { FilterPanelComponent } from '../../components/filter-panel/filter-panel.component';
import { PriceTableComponent } from '../../components/price-table/price-table.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, MessageModule, FilterPanelComponent, PriceTableComponent],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss'
})
export class DashboardPageComponent {
  readonly analysisStore = inject(AnalysisStore);
  readonly filtersStore = inject(FiltersStore);
  readonly importStore = inject(ImportStore);
}
