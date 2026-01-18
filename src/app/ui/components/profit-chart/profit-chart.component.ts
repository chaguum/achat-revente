import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import Chart from 'chart.js/auto';
import { ProfitSeriesPoint } from '../../../domain/models/analytics';

@Component({
  selector: 'app-profit-chart',
  standalone: true,
  templateUrl: './profit-chart.component.html',
  styleUrl: './profit-chart.component.scss'
})
export class ProfitChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() series: ProfitSeriesPoint[] = [];
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;

  ngAfterViewInit(): void {
    this.buildChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['series'] && this.chart) {
      this.updateChart();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
    this.chart = null;
  }

  private buildChart(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    const { labels, values } = this.getChartData();
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Profit net',
            data: values,
            backgroundColor: 'rgba(212, 106, 46, 0.65)',
            borderColor: 'rgba(140, 62, 19, 0.9)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.04)'
            },
            ticks: {
              color: '#a2a8b3'
            }
          },
          y: {
            ticks: {
              callback: (value) => `${value}`,
              color: '#a2a8b3'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.06)'
            }
          }
        }
      }
    });
  }

  private updateChart(): void {
    if (!this.chart) {
      return;
    }
    const { labels, values } = this.getChartData();
    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = values;
    this.chart.update();
  }

  private getChartData(): { labels: string[]; values: number[] } {
    return {
      labels: this.series.map((point) => point.period),
      values: this.series.map((point) => point.totalProfit)
    };
  }
}
