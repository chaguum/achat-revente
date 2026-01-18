import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { Opportunity } from '../../../domain/models/market.models';

@Component({
  selector: 'app-mini-chart',
  standalone: true,
  imports: [CommonModule, ChartModule],
  templateUrl: './mini-chart.component.html',
  styleUrl: './mini-chart.component.scss'
})
export class MiniChartComponent {
  @Input({ required: true }) opportunities: Opportunity[] = [];

  get chartData() {
    const top = this.opportunities.slice(0, 10);
    return {
      labels: top.map((row) => row.itemName),
      datasets: [
        {
          label: 'Net spread',
          data: top.map((row) => row.netSpread),
          backgroundColor: 'rgba(21, 150, 125, 0.4)',
          borderColor: 'rgba(15, 111, 93, 1)',
          borderWidth: 1
        }
      ]
    };
  }

  readonly chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: {
        ticks: { color: '#56616d', maxRotation: 40, minRotation: 20 }
      },
      y: {
        ticks: { color: '#56616d' }
      }
    }
  };
}
