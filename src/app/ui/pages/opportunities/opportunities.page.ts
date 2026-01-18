import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { AnalysisStore } from '../../../application/stores/analysis.store';
import { ImportStore } from '../../../application/stores/import.store';
import { CsvExportService } from '../../../core/export/csv-export.service';
import { OpportunitiesTableComponent } from '../../components/opportunities-table/opportunities-table.component';

@Component({
  selector: 'app-opportunities-page',
  standalone: true,
  imports: [CommonModule, ButtonModule, MessageModule, OpportunitiesTableComponent],
  templateUrl: './opportunities.page.html',
  styleUrl: './opportunities.page.scss'
})
export class OpportunitiesPageComponent {
  readonly analysisStore = inject(AnalysisStore);
  readonly importStore = inject(ImportStore);
  private readonly exporter = inject(CsvExportService);

  exportCsv(): void {
    const rows = this.analysisStore.opportunities();
    if (!rows.length) {
      return;
    }

    this.exporter.exportOpportunities(rows);
  }
}

