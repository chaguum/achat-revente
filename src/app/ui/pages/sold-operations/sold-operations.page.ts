import { CommonModule, DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SoldOperationsStore } from '../../../application/stores/sold-operations.store';
import { AnalyticsStore } from '../../../application/stores/analytics.store';
import { TradeOperation } from '../../../domain/models/trade-operation';
import { DefaultFeePolicy } from '../../../domain/services/fee-policy';
import { computeOperationMetrics } from '../../../domain/services/operation-calculators';
import { KamasPipe } from '../../pipes/kamas.pipe';

interface EditDraft {
  buyPrice: number | null;
  sellPrice: number | null;
  boughtAt: Date;
  soldAt: Date;
  comment: string;
  priceModified: boolean;
}

@Component({
  selector: 'app-sold-operations-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    DatePickerModule,
    CheckboxModule,
    MultiSelectModule,
    TagModule,
    DatePipe,
    DecimalPipe,
    PercentPipe,
    KamasPipe
  ],
  templateUrl: './sold-operations.page.html',
  styleUrl: './sold-operations.page.scss'
})
export class SoldOperationsPageComponent implements OnInit {
  private readonly feePolicy = new DefaultFeePolicy();
  readonly store = inject(SoldOperationsStore);
  readonly analyticsStore = inject(AnalyticsStore);

  readonly editDialogOpen = signal(false);
  readonly selectedOperation = signal<TradeOperation | null>(null);

  readonly editDraft = signal<EditDraft>({
    buyPrice: null,
    sellPrice: null,
    boughtAt: new Date(),
    soldAt: new Date(),
    comment: '',
    priceModified: false
  });

  readonly soldRows = computed(() =>
    this.store
      .operations()
      .map((operation) => ({
        operation,
        metrics: computeOperationMetrics(operation, this.feePolicy)
      }))
  );

  readonly serverFilterOptions = computed(() =>
    this.buildFilterOptions(this.store.operations().map((operation) => operation.server))
  );

  readonly itemFilterOptions = computed(() =>
    this.buildFilterOptions(this.store.operations().map((operation) => operation.itemName))
  );

  readonly typeFilterOptions = computed(() => {
    const types = new Set(this.store.operations().map((operation) => operation.acquisitionType));
    const options: Array<{ label: string; value: 'BUY' | 'CRAFT' }> = [];
    if (types.has('BUY')) {
      options.push({ label: 'Achat', value: 'BUY' });
    }
    if (types.has('CRAFT')) {
      options.push({ label: 'Craft', value: 'CRAFT' });
    }
    return options;
  });

  readonly buyPriceFilterOptions = computed(() =>
    this.buildFilterOptions(this.store.operations().map((operation) => operation.buyPrice))
  );

  readonly sellPriceFilterOptions = computed(() =>
    this.buildFilterOptions(
      this.store.operations().map((operation) =>
        operation.sellPrice !== null && operation.sellPrice !== undefined ? operation.sellPrice : null
      )
    )
  );

  readonly canSaveEdit = computed(() => {
    const draft = this.editDraft();
    const buyOk = draft.buyPrice !== null && draft.buyPrice >= 0;
    const sellOk = draft.sellPrice !== null && draft.sellPrice >= 0;
    return buyOk && sellOk;
  });

  updateEditDraft(patch: Partial<EditDraft>): void {
    this.editDraft.update((state) => ({ ...state, ...patch }));
  }

  formatAcquisitionLabel(type: 'BUY' | 'CRAFT'): string {
    return type === 'BUY' ? 'Achat' : 'Craft';
  }

  private buildFilterOptions(values: Array<string | number | null>): Array<{ label: string; value: string | number }> {
    const filtered = values.filter(
      (value): value is string | number => value !== null && value !== undefined
    );
    if (filtered.length === 0) {
      return [];
    }
    const isNumber = filtered.every((value) => typeof value === 'number');
    const uniqueValues = Array.from(new Set(filtered));
    const sorted = isNumber
      ? (uniqueValues as number[]).sort((a, b) => a - b)
      : (uniqueValues as string[]).sort((a, b) => a.localeCompare(b));
    const formatter = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
    return sorted.map((value) => ({
      label: typeof value === 'number' ? formatter.format(value) : value,
      value
    }));
  }

  ngOnInit(): void {
    this.store.load();
  }

  openEdit(operation: TradeOperation): void {
    this.selectedOperation.set(operation);
    this.editDraft.set({
      buyPrice: operation.buyPrice,
      sellPrice: operation.sellPrice ?? null,
      boughtAt: operation.boughtAt,
      soldAt: operation.soldAt ?? new Date(),
      comment: operation.comment ?? '',
      priceModified: operation.priceModified ?? false
    });
    this.editDialogOpen.set(true);
  }

  closeEdit(): void {
    this.editDialogOpen.set(false);
    this.selectedOperation.set(null);
  }

  async saveEdit(): Promise<void> {
    const selected = this.selectedOperation();
    const draft = this.editDraft();
    if (!selected?.id || !this.canSaveEdit()) {
      return;
    }
    const updated: TradeOperation = {
      ...selected,
      buyPrice: draft.buyPrice ?? 0,
      sellPrice: draft.sellPrice ?? null,
      boughtAt: draft.boughtAt,
      soldAt: draft.soldAt,
      comment: draft.comment.trim() ? draft.comment.trim() : undefined,
      priceModified: draft.priceModified
    };
    await this.store.updateOperation(updated);
    await this.analyticsStore.load();
    this.closeEdit();
  }

  async deleteOperation(operation: TradeOperation): Promise<void> {
    if (!operation.id) {
      return;
    }
    const confirmed = window.confirm('Supprimer cette operation ?');
    if (!confirmed) {
      return;
    }
    await this.store.deleteOperation(operation.id);
    await this.analyticsStore.load();
  }
}
