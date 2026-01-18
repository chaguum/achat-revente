import { Injectable } from '@angular/core';
import { Opportunity } from '../../domain/models/market.models';

@Injectable({ providedIn: 'root' })
export class CsvExportService {
  exportOpportunities(rows: Opportunity[], filename = 'opportunities.csv'): void {
    const headers = [
      'Item',
      'SourceServer',
      'TargetServer',
      'SourcePrice',
      'TargetPrice',
      'NetSpread',
      'ProfitPercent'
    ];

    const lines = [headers.join(';')];

    for (const row of rows) {
      lines.push(
        [
          row.itemName,
          row.sourceServer,
          row.targetServer,
          row.sourcePrice,
          row.targetPrice,
          row.netSpread,
          row.profitPercent.toFixed(4)
        ].join(';')
      );
    }

    const blob = new Blob([lines.join('\n')], {
      type: 'text/csv;charset=utf-8;'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}
