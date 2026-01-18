import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { FiltersStore } from '../../../application/stores/filters.store';
import { ImportStore } from '../../../application/stores/import.store';

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, MultiSelectModule, SelectModule],
  templateUrl: './filter-panel.component.html',
  styleUrl: './filter-panel.component.scss'
})
export class FilterPanelComponent {
  readonly filtersStore = inject(FiltersStore);
  readonly importStore = inject(ImportStore);

  readonly serverOptions = computed(() =>
    this.importStore.servers().map((server) => ({ label: server, value: server }))
  );
}
