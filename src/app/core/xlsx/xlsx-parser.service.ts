import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import * as XLSX from 'xlsx';
import { SheetData } from '../../domain/models/market.models';
import {
  normalizeItemName,
  normalizeServerName,
  parsePriceValue
} from '../../domain/logic/price-utils';

export type WorkbookRef = XLSX.WorkBook;

@Injectable({ providedIn: 'root' })
export class XlsxParserService {
  constructor(private readonly http: HttpClient) {}

  async loadWorkbookFromUrl(url: string): Promise<WorkbookRef> {
    const buffer = await firstValueFrom(
      this.http.get(url, { responseType: 'arraybuffer' })
    );
    return XLSX.read(buffer, { type: 'array' });
  }

  async loadWorkbookFromFile(file: File): Promise<WorkbookRef> {
    const buffer = await file.arrayBuffer();
    return XLSX.read(buffer, { type: 'array' });
  }

  getSheetNames(workbook: WorkbookRef): string[] {
    return [...workbook.SheetNames];
  }

  parseSheet(workbook: WorkbookRef, sheetName: string): SheetData {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      return { sheetName, servers: [], rows: [] };
    }

    const rawRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      defval: null,
      blankrows: false
    }) as unknown[][];

    if (!rawRows.length) {
      return { sheetName, servers: [], rows: [] };
    }

    const header = rawRows[0] ?? [];
    const serverColumns = header
      .slice(1)
      .map((cell, index) => ({
        name: normalizeServerName(cell),
        columnIndex: index + 1
      }))
      .filter((column) => column.name.length > 0);

    const servers = serverColumns.map((column) => column.name);
    const rows = rawRows.slice(1).reduce<SheetData['rows']>((acc, row) => {
      const itemName = normalizeItemName(row?.[0]);
      if (!itemName) {
        return acc;
      }

      const pricesByServer: Record<string, number | null> = {};
      for (const column of serverColumns) {
        pricesByServer[column.name] = parsePriceValue(row?.[column.columnIndex]);
      }

      acc.push({ itemName, pricesByServer });
      return acc;
    }, [] as SheetData['rows']);

    return { sheetName, servers, rows };
  }
}

