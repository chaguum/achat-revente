import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FileUploadModule, FileUploadHandlerEvent } from 'primeng/fileupload';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ImportStore } from '../../../application/stores/import.store';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-import-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ButtonModule,
    CardModule,
    FileUploadModule,
    MessageModule,
    SelectModule,
    TagModule
  ],
  templateUrl: './import.page.html',
  styleUrl: './import.page.scss'
})
export class ImportPageComponent {
  readonly importStore = inject(ImportStore);
  readonly sheetOptions = computed(() =>
    this.importStore.sheetNames().map((name) => ({ label: name, value: name }))
  );

  readonly autoLoadUrl = environment.excelAutoLoadUrl;
  readonly mockDataUrl = environment.mockDataUrl;

  private autoLoadTried = false;

  async ngOnInit(): Promise<void> {
    if (!this.autoLoadUrl || this.autoLoadTried) {
      return;
    }

    this.autoLoadTried = true;
    const ok = await this.importStore.loadFromUrl(this.autoLoadUrl, 'auto');
    if (!ok && this.mockDataUrl) {
      await this.importStore.loadFromUrl(this.mockDataUrl, 'mock');
    }
  }

  async loadAuto(): Promise<void> {
    if (!this.autoLoadUrl) {
      return;
    }

    const ok = await this.importStore.loadFromUrl(this.autoLoadUrl, 'auto');
    if (!ok && this.mockDataUrl) {
      await this.importStore.loadFromUrl(this.mockDataUrl, 'mock');
    }
  }

  async handleUpload(event: FileUploadHandlerEvent): Promise<void> {
    const file = event.files?.[0];
    if (!file) {
      return;
    }

    await this.importStore.loadFromFile(file);
  }

  onSheetChange(sheetName: string): void {
    if (sheetName) {
      this.importStore.selectSheet(sheetName);
    }
  }
}

