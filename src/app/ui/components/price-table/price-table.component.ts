import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SortEvent } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ItemRowView } from '../../../domain/models/market.models';
import { PricePipe } from '../../pipes/price.pipe';

@Component({
  selector: 'app-price-table',
  standalone: true,
  imports: [CommonModule, TableModule, PricePipe],
  templateUrl: './price-table.component.html',
  styleUrl: './price-table.component.scss'
})
export class PriceTableComponent {
  @Input({ required: true }) rows: ItemRowView[] = [];
  @Input({ required: true }) servers: string[] = [];
  @Input() sourceServer: string | null = null;
  @Input() targetServer: string | null = null;

  get useVirtualScroll(): boolean {
    return this.rows.length > 200;
  }

  cellClass(row: ItemRowView, server: string): Record<string, boolean> {
    return {
      'source-cell': this.sourceServer === server,
      'target-cell': this.targetServer === server
    };
  }

  profitStyle(row: ItemRowView): Record<string, string> | null {
    if (row.profitPercent === null) {
      return null;
    }

    const clamped = Math.max(-0.5, Math.min(0.5, row.profitPercent));
    const ratio = (clamped + 0.5) / 1;
    const hue = 0 + ratio * 120;
    const background = `hsl(${hue}deg 70% 92%)`;
    const color = `hsl(${hue}deg 45% 30%)`;

    return {
      background,
      color,
      fontWeight: '600'
    };
  }

  onSort(event: SortEvent): void {
    if (!event.field || !event.data) {
      return;
    }

    const field = event.field;
    const order = event.order ?? 1;

    event.data.sort((a: ItemRowView, b: ItemRowView) => {
      const valueA = this.resolveSortValue(a, field);
      const valueB = this.resolveSortValue(b, field);

      if (valueA === null && valueB === null) {
        return 0;
      }
      if (valueA === null) {
        return 1;
      }
      if (valueB === null) {
        return -1;
      }

      if (typeof valueA === 'string' || typeof valueB === 'string') {
        return String(valueA).localeCompare(String(valueB)) * order;
      }

      return (Number(valueA) - Number(valueB)) * order;
    });
  }

  private resolveSortValue(row: ItemRowView, field: string): string | number | null {
    if (field.startsWith('server:')) {
      const server = field.slice('server:'.length);
      return row.pricesByServer[server] ?? null;
    }

    switch (field) {
      case 'itemName':
        return row.itemName;
      case 'sourcePrice':
        return row.sourcePrice;
      case 'targetPrice':
        return row.targetPrice;
      case 'netSpread':
        return row.netSpread;
      case 'profitPercent':
        return row.profitPercent;
      default:
        return null;
    }
  }
}
