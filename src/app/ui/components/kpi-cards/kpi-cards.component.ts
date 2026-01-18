import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { KpiStats } from '../../../domain/models/market.models';
import { PricePipe } from '../../pipes/price.pipe';

@Component({
  selector: 'app-kpi-cards',
  standalone: true,
  imports: [CommonModule, CardModule, PricePipe],
  templateUrl: './kpi-cards.component.html',
  styleUrl: './kpi-cards.component.scss'
})
export class KpiCardsComponent {
  @Input({ required: true }) kpis: KpiStats = {
    topNetSpread: 0,
    averageNetSpread: 0,
    profitableCount: 0,
    totalCount: 0
  };
}
