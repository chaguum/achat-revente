import { HttpClient } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { XlsxParserService, WorkbookRef } from '../../core/xlsx/xlsx-parser.service';
import { SheetData } from '../../domain/models/market.models';

export type ImportSource = 'auto' | 'upload' | 'mock' | null;
export type ImportStatus = 'idle' | 'loading' | 'ready' | 'error';

interface ImportState {
  status: ImportStatus;
  error: string | null;
  source: ImportSource;
  workbook: WorkbookRef | null;
  sheetCache: Record<string, SheetData>;
  sheetNames: string[];
  selectedSheet: string | null;
  rows: SheetData['rows'];
  servers: string[];
}

interface MockWorkbook {
  sheets: SheetData[];
}

const initialState: ImportState = {
  status: 'idle',
  error: null,
  source: null,
  workbook: null,
  sheetCache: {},
  sheetNames: [],
  selectedSheet: null,
  rows: [],
  servers: []
};

export const ImportStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    isReady: computed(() => store.status() === 'ready'),
    hasRows: computed(() => store.rows().length > 0)
  })),
  withMethods((store) => {
    const parser = inject(XlsxParserService);
    const http = inject(HttpClient);

    const selectSheet = (sheetName: string) => {
      const cache = store.sheetCache();
      const cached = cache[sheetName];
      if (cached) {
        patchState(store, {
          selectedSheet: sheetName,
          rows: cached.rows,
          servers: cached.servers,
          status: 'ready'
        });
        return;
      }

      const workbook = store.workbook();
      if (!workbook) {
        return;
      }

      const parsed = parser.parseSheet(workbook, sheetName);
      patchState(store, {
        sheetCache: { ...cache, [sheetName]: parsed },
        selectedSheet: sheetName,
        rows: parsed.rows,
        servers: parsed.servers,
        status: 'ready'
      });
    };

    const applySheetList = (sheetNames: string[]) => {
      patchState(store, {
        sheetNames,
        selectedSheet: sheetNames[0] ?? null,
        rows: [],
        servers: []
      });

      if (sheetNames[0]) {
        selectSheet(sheetNames[0]);
      }
    };

    const loadFromWorkbook = (workbook: WorkbookRef, source: ImportSource) => {
      patchState(store, {
        workbook,
        sheetCache: {},
        source,
        status: 'ready',
        error: null
      });

      const sheetNames = parser.getSheetNames(workbook);
      applySheetList(sheetNames);
    };

    const loadFromMock = (payload: MockWorkbook, source: ImportSource) => {
      const cache: Record<string, SheetData> = {};
      const orderedNames: string[] = [];
      for (const sheet of payload.sheets ?? []) {
        cache[sheet.sheetName] = sheet;
        orderedNames.push(sheet.sheetName);
      }

      const sheetNames = orderedNames.filter((name, index) => orderedNames.indexOf(name) === index);
      patchState(store, {
        workbook: null,
        sheetCache: cache,
        source,
        status: 'ready',
        error: null
      });

      applySheetList(sheetNames);
    };

    return {
      selectSheet,
      async loadFromUrl(url: string, source: ImportSource = 'auto'): Promise<boolean> {
        patchState(store, { status: 'loading', error: null, source });
        try {
          if (url.toLowerCase().endsWith('.json')) {
            const payload = await firstValueFrom(http.get<MockWorkbook>(url));
            loadFromMock(payload, source);
          } else {
            const workbook = await parser.loadWorkbookFromUrl(url);
            loadFromWorkbook(workbook, source);
          }

          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unable to load file';
          patchState(store, { status: 'error', error: message });
          return false;
        }
      },
      async loadFromFile(file: File): Promise<boolean> {
        patchState(store, { status: 'loading', error: null, source: 'upload' });
        try {
          const workbook = await parser.loadWorkbookFromFile(file);
          loadFromWorkbook(workbook, 'upload');
          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unable to parse file';
          patchState(store, { status: 'error', error: message });
          return false;
        }
      }
    };
  })
);

