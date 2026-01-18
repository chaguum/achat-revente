import { inject, Injectable } from '@angular/core';
import { ImportExportUseCases } from './import-export.use-cases';
import { OPERATION_REPOSITORY } from '../../core/tokens/repositories';

@Injectable({ providedIn: 'root' })
export class SeedDefaultUseCases {
  private readonly operationRepository = inject(OPERATION_REPOSITORY);
  private readonly importExportUseCases = inject(ImportExportUseCases);

  async seedIfEmpty(): Promise<void> {
    const existing = await this.operationRepository.listAll();
    if (existing.length > 0) {
      return;
    }

    await this.seedFromDefault({ replace: false });
  }

  async seedFromDefault(options: { replace: boolean }): Promise<void> {
    try {
      const response = await fetch(new URL('craft-revente.xlsx', document.baseURI));
      if (!response.ok) {
        return;
      }
      const buffer = await response.arrayBuffer();
      if (options.replace) {
        await this.importExportUseCases.importExcelBufferReplace(buffer, {
          serverNameOverride: 'Orukam',
          acquisitionTypeOverride: 'CRAFT'
        });
      } else {
        await this.importExportUseCases.importExcelBuffer(buffer, {
          serverNameOverride: 'Orukam',
          acquisitionTypeOverride: 'CRAFT'
        });
      }
    } catch (error) {
      console.warn('Default seed import failed', error);
    }
  }
}
