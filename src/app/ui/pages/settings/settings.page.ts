import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { SettingsStore } from '../../../application/stores/settings.store';
import { BackupPayload } from '../../../application/use-cases/import-export.use-cases';
import { OpenOperationsStore } from '../../../application/stores/open-operations.store';
import { SoldOperationsStore } from '../../../application/stores/sold-operations.store';
import { AnalyticsStore } from '../../../application/stores/analytics.store';

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

const downloadFile = (content: string, filename: string, type: string): void => {
  const blob = new Blob([content], { type });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule],
  templateUrl: './settings.page.html',
  styleUrl: './settings.page.scss'
})
export class SettingsPageComponent implements OnInit {
  readonly store = inject(SettingsStore);
  readonly openStore = inject(OpenOperationsStore);
  readonly soldStore = inject(SoldOperationsStore);
  readonly analyticsStore = inject(AnalyticsStore);

  readonly newServerName = signal('');

  ngOnInit(): void {
    this.store.load();
  }

  async addServer(): Promise<void> {
    const name = this.newServerName().trim();
    if (!name) {
      return;
    }
    await this.store.saveServer({ id: slugify(name), name });
    this.newServerName.set('');
  }

  async deleteServer(id: string): Promise<void> {
    const confirmed = window.confirm(
      'Supprimer ce serveur ? Les operations existantes garderont leur serveur.'
    );
    if (!confirmed) {
      return;
    }
    await this.store.deleteServer(id);
  }

  async exportJson(): Promise<void> {
    const payload = await this.store.exportJson();
    const data = JSON.stringify(payload, null, 2);
    downloadFile(data, `dofus-ledger-backup-${Date.now()}.json`, 'application/json');
  }

  async importJsonFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    const confirmed = window.confirm(
      'Importer le JSON remplacera les donnees actuelles. Continuer ?'
    );
    if (!confirmed) {
      return;
    }
    const content = await file.text();
    const payload = JSON.parse(content) as BackupPayload;
    await this.store.importJson(payload);
    await this.refreshAll();
    input.value = '';
  }

  async exportCsv(): Promise<void> {
    const csv = await this.store.exportCsv();
    downloadFile(csv, `dofus-ledger-export-${Date.now()}.csv`, 'text/csv');
  }

  async importDefaultDataset(): Promise<void> {
    const confirmed = window.confirm(
      'Charger le fichier Excel par defaut va remplacer toutes les donnees. Continuer ?'
    );
    if (!confirmed) {
      return;
    }
    await this.store.importDefaultDataset();
    await this.refreshAll();
  }

  async importExcelFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    await this.store.importExcel(file);
    await this.refreshAll();
    input.value = '';
  }

  private async refreshAll(): Promise<void> {
    await Promise.all([this.store.load(), this.openStore.load(), this.soldStore.load(), this.analyticsStore.load()]);
  }
}
