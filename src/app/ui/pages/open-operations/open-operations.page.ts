import { CommonModule, DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { OpenOperationsStore } from '../../../application/stores/open-operations.store';
import { SoldOperationsStore } from '../../../application/stores/sold-operations.store';
import { AnalyticsStore } from '../../../application/stores/analytics.store';
import { AcquisitionType, TradeOperation } from '../../../domain/models/trade-operation';
import { DefaultFeePolicy } from '../../../domain/services/fee-policy';
import { computeOperationMetrics, OperationMetrics } from '../../../domain/services/operation-calculators';
import { KamasPipe } from '../../pipes/kamas.pipe';

interface QuickAddLine {
  buyPrice: number | null;
  targetPrice: number | null;
  comment: string;
}

interface QuickAddState {
  server: string;
  itemName: string;
  acquisitionType: AcquisitionType;
  quantity: number;
  lines: QuickAddLine[];
}

interface SaleDraft {
  sellPrice: number | null;
  soldAt: Date;
  priceModified: boolean;
  comment: string;
}

type ColumnKey =
  | 'boughtAt'
  | 'server'
  | 'itemName'
  | 'acquisitionType'
  | 'buyPrice'
  | 'sellPrice'
  | 'expectedProfit'
  | 'expectedMargin'
  | 'comment'
  | 'daysOnMarket';

interface EditDraft {
  server: string;
  itemName: string;
  acquisitionType: AcquisitionType;
  buyPrice: number | null;
  boughtAt: Date;
  sellPrice: number | null;
  comment: string;
}

@Component({
  selector: 'app-open-operations-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    SelectModule,
    AutoCompleteModule,
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
  templateUrl: './open-operations.page.html',
  styleUrl: './open-operations.page.scss'
})
export class OpenOperationsPageComponent implements OnInit {
  private readonly storageKey = 'open-operations.visibleColumns';
  private readonly feePolicy = new DefaultFeePolicy();

  readonly store = inject(OpenOperationsStore);
  readonly soldStore = inject(SoldOperationsStore);
  readonly analyticsStore = inject(AnalyticsStore);

  readonly quickAddOpen = signal(false);
  readonly saleDialogOpen = signal(false);
  readonly editDialogOpen = signal(false);

  readonly filteredItems = signal<string[]>([]);

  readonly selectedOperation = signal<TradeOperation | null>(null);

  readonly quickAddState = signal<QuickAddState>({
    server: '',
    itemName: '',
    acquisitionType: 'BUY',
    quantity: 1,
    lines: [{ buyPrice: null, targetPrice: null, comment: '' }]
  });

  readonly saleDraft = signal<SaleDraft>({
    sellPrice: null,
    soldAt: new Date(),
    priceModified: false,
    comment: ''
  });

  readonly editDraft = signal<EditDraft>({
    server: '',
    itemName: '',
    acquisitionType: 'BUY',
    buyPrice: null,
    boughtAt: new Date(),
    sellPrice: null,
    comment: ''
  });

  readonly columnOptions: Array<{ label: string; value: ColumnKey }> = [
    { label: 'Date achat', value: 'boughtAt' },
    { label: 'Serveur', value: 'server' },
    { label: 'Item', value: 'itemName' },
    { label: 'Type', value: 'acquisitionType' },
    { label: 'Prix achat', value: 'buyPrice' },
    { label: 'Prix cible', value: 'sellPrice' },
    { label: 'Profit attendu', value: 'expectedProfit' },
    { label: 'Marge attendue', value: 'expectedMargin' },
    { label: 'Commentaire', value: 'comment' },
    { label: 'En vente depuis', value: 'daysOnMarket' }
  ];

  readonly visibleColumns = signal<ColumnKey[]>(this.loadVisibleColumns());

  readonly acquisitionOptions: Array<{ label: string; value: AcquisitionType }> = [
    { label: 'Achat', value: 'BUY' },
    { label: 'Craft', value: 'CRAFT' }
  ];

  readonly openRows = computed(() =>
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
    const options: Array<{ label: string; value: AcquisitionType }> = [];
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

  readonly targetPriceFilterOptions = computed(() =>
    this.buildFilterOptions(
      this.store.operations().map((operation) =>
        operation.sellPrice !== null && operation.sellPrice !== undefined ? operation.sellPrice : null
      )
    )
  );

  readonly salePreview = computed<OperationMetrics | null>(() => {
    const selected = this.selectedOperation();
    if (!selected) {
      return null;
    }
    const draft = this.saleDraft();
    const preview: TradeOperation = {
      ...selected,
      status: 'SOLD',
      sellPrice: draft.sellPrice ?? null,
      soldAt: draft.soldAt,
      priceModified: draft.priceModified,
      comment: draft.comment
    };
    return computeOperationMetrics(preview, this.feePolicy);
  });

  readonly canSubmitQuickAdd = computed(() => {
    const state = this.quickAddState();
    if (!state.server || !state.itemName.trim()) {
      return false;
    }
    return state.lines.every((line) => {
      const buyOk = line.buyPrice !== null && line.buyPrice >= 0;
      const targetOk = line.targetPrice === null || line.targetPrice >= 0;
      return buyOk && targetOk;
    });
  });

  readonly canConfirmSale = computed(() => {
    const draft = this.saleDraft();
    return draft.sellPrice !== null && draft.sellPrice >= 0;
  });

  readonly canSaveEdit = computed(() => {
    const draft = this.editDraft();
    return Boolean(draft.server && draft.itemName.trim()) && (draft.buyPrice ?? -1) >= 0;
  });

  ngOnInit(): void {
    this.store.load();
  }

  openQuickAdd(): void {
    const servers = this.store.servers();
    const defaultServer = servers.length > 0 ? servers[0].name : '';
    this.quickAddState.set({
      server: defaultServer,
      itemName: '',
      acquisitionType: 'BUY',
      quantity: 1,
      lines: [{ buyPrice: null, targetPrice: null, comment: '' }]
    });
    this.filteredItems.set(this.store.itemNames());
    this.quickAddOpen.set(true);
  }

  closeQuickAdd(): void {
    this.quickAddOpen.set(false);
  }

  updateQuickAddField<K extends keyof QuickAddState>(key: K, value: QuickAddState[K]): void {
    this.quickAddState.update((state) => ({ ...state, [key]: value }));
  }

  updateQuantity(value: number | null): void {
    const quantity = Math.max(1, Math.floor(value ?? 1));
    this.quickAddState.update((state) => {
      const nextLines = Array.from({ length: quantity }, (_, index) =>
        state.lines[index] ?? { buyPrice: null, targetPrice: null, comment: '' }
      );
      return { ...state, quantity, lines: nextLines };
    });
  }

  updateLine(index: number, patch: Partial<QuickAddLine>): void {
    this.quickAddState.update((state) => {
      const lines = state.lines.map((line, lineIndex) =>
        lineIndex === index ? { ...line, ...patch } : line
      );
      return { ...state, lines };
    });
  }

  formatAcquisitionLabel(type: AcquisitionType): string {
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

  updateSaleDraft(patch: Partial<SaleDraft>): void {
    this.saleDraft.update((state) => ({ ...state, ...patch }));
  }

  updateEditDraft(patch: Partial<EditDraft>): void {
    this.editDraft.update((state) => ({ ...state, ...patch }));
  }

  filterItemNames(event: { query: string }): void {
    const query = event.query.toLowerCase();
    const filtered = this.store
      .itemNames()
      .filter((item) => item.toLowerCase().includes(query));
    this.filteredItems.set(filtered);
  }

  async submitQuickAdd(): Promise<void> {
    if (!this.canSubmitQuickAdd()) {
      return;
    }
    const state = this.quickAddState();
    const now = new Date();
    const operations: TradeOperation[] = state.lines.map((line) => ({
      server: state.server,
      itemName: state.itemName.trim(),
      acquisitionType: state.acquisitionType,
      buyPrice: line.buyPrice ?? 0,
      boughtAt: now,
      comment: line.comment.trim() ? line.comment.trim() : undefined,
      status: 'OPEN',
      soldAt: null,
      sellPrice: line.targetPrice ?? null,
      priceModified: false
    }));
    await this.store.addOperations(operations);
    this.closeQuickAdd();
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
  }

  openSaleDialog(operation: TradeOperation): void {
    this.selectedOperation.set(operation);
    this.saleDraft.set({
      sellPrice: operation.sellPrice ?? null,
      soldAt: new Date(),
      priceModified: operation.priceModified ?? false,
      comment: operation.comment ?? ''
    });
    this.saleDialogOpen.set(true);
  }

  closeSaleDialog(): void {
    this.saleDialogOpen.set(false);
    this.selectedOperation.set(null);
  }

  openEdit(operation: TradeOperation): void {
    this.selectedOperation.set(operation);
    this.editDraft.set({
      server: operation.server,
      itemName: operation.itemName,
      acquisitionType: operation.acquisitionType,
      buyPrice: operation.buyPrice,
      boughtAt: operation.boughtAt,
      sellPrice: operation.sellPrice ?? null,
      comment: operation.comment ?? ''
    });
    this.filteredItems.set(this.store.itemNames());
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
      server: draft.server,
      itemName: draft.itemName.trim(),
      acquisitionType: draft.acquisitionType,
      buyPrice: draft.buyPrice ?? 0,
      boughtAt: draft.boughtAt,
      sellPrice: draft.sellPrice,
      comment: draft.comment.trim() ? draft.comment.trim() : undefined,
      status: 'OPEN',
      soldAt: null
    };
    await this.store.updateOperation(updated);
    this.closeEdit();
  }

  async confirmSale(): Promise<void> {
    const selected = this.selectedOperation();
    const draft = this.saleDraft();
    if (!selected?.id || draft.sellPrice === null) {
      return;
    }
    await this.store.validateSale({
      id: selected.id,
      sellPrice: draft.sellPrice,
      soldAt: draft.soldAt,
      priceModified: draft.priceModified,
      comment: draft.comment
    });
    await this.soldStore.load();
    await this.analyticsStore.load();
    this.closeSaleDialog();
  }

  updateVisibleColumns(values: ColumnKey[] | null): void {
    const selected = values ?? [];
    const ordered = this.columnOptions
      .map((option) => option.value)
      .filter((value) => selected.includes(value));
    this.visibleColumns.set(ordered.length ? ordered : this.defaultColumns());
    this.persistVisibleColumns(this.visibleColumns());
  }

  isColumnVisible(column: ColumnKey): boolean {
    return this.visibleColumns().includes(column);
  }

  private defaultColumns(): ColumnKey[] {
    return this.columnOptions.map((option) => option.value);
  }

  private loadVisibleColumns(): ColumnKey[] {
    if (typeof localStorage === 'undefined') {
      return this.defaultColumns();
    }
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return this.defaultColumns();
    }
    try {
      const parsed = JSON.parse(raw) as ColumnKey[];
      const allowed = new Set(this.columnOptions.map((option) => option.value));
      const filtered = parsed.filter((value) => allowed.has(value));
      return filtered.length ? filtered : this.defaultColumns();
    } catch {
      return this.defaultColumns();
    }
  }

  private persistVisibleColumns(columns: ColumnKey[]): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    localStorage.setItem(this.storageKey, JSON.stringify(columns));
  }
}
