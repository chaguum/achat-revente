import { CommonModule, DecimalPipe, PercentPipe } from '@angular/common';
import { Component, OnInit, computed, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { AnalyticsStore } from '../../../application/stores/analytics.store';
import { KpiCardComponent } from '../../components/kpi-card/kpi-card.component';
import { ProfitChartComponent } from '../../components/profit-chart/profit-chart.component';
import { KamasPipe } from '../../pipes/kamas.pipe';

@Component({
  selector: 'app-analytics-page',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TableModule,
    DecimalPipe,
    PercentPipe,
    KamasPipe,
    KpiCardComponent,
    ProfitChartComponent
  ],
  templateUrl: './analytics.page.html',
  styleUrl: './analytics.page.scss'
})
export class AnalyticsPageComponent implements OnInit {
  readonly store = inject(AnalyticsStore);

  readonly bestMargin = computed(() => this.store.snapshot().topMargins.at(0));
  readonly bestProfit = computed(() => this.store.snapshot().topProfits.at(0));
  readonly topSold = computed(() => this.store.snapshot().mostSold.at(0));

  ngOnInit(): void {
    this.store.load();
  }
}
