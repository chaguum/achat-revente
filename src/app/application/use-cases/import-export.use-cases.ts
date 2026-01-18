import { inject, Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { AcquisitionType, TradeOperation } from '../../domain/models/trade-operation';
import { GameServer } from '../../domain/models/server';
import { OPERATION_REPOSITORY, SERVER_REPOSITORY } from '../../core/tokens/repositories';

export interface BackupPayload {
  version: number;
  exportedAt: string;
  operations: Array<{
    id?: number;
    server: string;
    itemName: string;
    acquisitionType: 'BUY' | 'CRAFT';
    buyPrice: number;
    boughtAt: string;
    comment?: string;
    status: 'OPEN' | 'SOLD';
    soldAt?: string | null;
    sellPrice?: number | null;
    priceModified?: boolean;
  }>;
  servers: GameServer[];
}

const normalizeHeader = (value: string): string => {
  return value
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/['?]/g, '');
};

const parseNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.floor(value);
  }
  if (typeof value === 'string') {
    const normalized = value.replace(/\s+/g, '').replace(',', '.');
    const parsed = Number(normalized);
    if (Number.isFinite(parsed)) {
      return Math.floor(parsed);
    }
  }
  return null;
};

const parseExcelDate = (value: unknown): Date | null => {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === 'number') {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) {
      return null;
    }
    return new Date(parsed.y, parsed.m - 1, parsed.d, parsed.H, parsed.M, parsed.S);
  }
  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return null;
};

@Injectable({ providedIn: 'root' })
export class ImportExportUseCases {
  private readonly operationRepository = inject(OPERATION_REPOSITORY);
  private readonly serverRepository = inject(SERVER_REPOSITORY);

  async exportJson(): Promise<BackupPayload> {
    const operations = await this.operationRepository.listAll();
    const servers = await this.serverRepository.list();
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      operations: operations.map((operation) => ({
        ...operation,
        boughtAt: operation.boughtAt.toISOString(),
        soldAt: operation.soldAt ? operation.soldAt.toISOString() : null
      })),
      servers
    };
  }

  async importJson(payload: BackupPayload): Promise<void> {
    const operations: TradeOperation[] = payload.operations.map((operation) => ({
      ...operation,
      boughtAt: new Date(operation.boughtAt),
      soldAt: operation.soldAt ? new Date(operation.soldAt) : null
    }));
    await this.operationRepository.replaceAll(operations);
    await this.serverRepository.replaceAll(payload.servers);
  }

  async importExcel(file: File): Promise<TradeOperation[]> {
    const buffer = await file.arrayBuffer();
    return this.importExcelBuffer(buffer);
  }

  async importExcelBuffer(
    buffer: ArrayBuffer,
    options?: { serverNameOverride?: string; acquisitionTypeOverride?: AcquisitionType }
  ): Promise<TradeOperation[]> {
    const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
    const { operations, servers } = this.parseWorkbook(workbook, options);

    const existingServers = await this.serverRepository.list();
    const existingNames = new Set(existingServers.map((server) => server.name));
    const newServers: GameServer[] = [];
    servers.forEach((name) => {
      if (!existingNames.has(name)) {
        newServers.push({ id: name.toLowerCase().replace(/\s+/g, '-'), name });
      }
    });

    for (const server of newServers) {
      await this.serverRepository.upsert(server);
    }

    await this.operationRepository.addMany(operations);

    return operations;
  }

  async importExcelBufferReplace(
    buffer: ArrayBuffer,
    options?: { serverNameOverride?: string; acquisitionTypeOverride?: AcquisitionType }
  ): Promise<TradeOperation[]> {
    const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
    const { operations, servers } = this.parseWorkbook(workbook, options);
    const serverList: GameServer[] = Array.from(servers).map((name) => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name
    }));

    await this.operationRepository.replaceAll(operations);
    await this.serverRepository.replaceAll(serverList);

    return operations;
  }

  async exportCsv(): Promise<string> {
    const operations = await this.operationRepository.listAll();
    const headers = [
      'server',
      'itemName',
      'acquisitionType',
      'buyPrice',
      'boughtAt',
      'comment',
      'status',
      'soldAt',
      'sellPrice',
      'priceModified'
    ];
    const rows = operations.map((operation) => [
      operation.server,
      operation.itemName,
      operation.acquisitionType,
      `${operation.buyPrice}`,
      operation.boughtAt.toISOString(),
      operation.comment ?? '',
      operation.status,
      operation.soldAt ? operation.soldAt.toISOString() : '',
      operation.sellPrice !== null && operation.sellPrice !== undefined ? `${operation.sellPrice}` : '',
      operation.priceModified ? 'true' : 'false'
    ]);

    const lines = [headers.join(','), ...rows.map((row) => row.map((value) => `"${value}"`).join(','))];
    return lines.join('\n');
  }

  private parseWorkbook(
    workbook: XLSX.WorkBook,
    options?: { serverNameOverride?: string; acquisitionTypeOverride?: AcquisitionType }
  ): { operations: TradeOperation[]; servers: Set<string> } {
    const operations: TradeOperation[] = [];
    const servers = new Set<string>();
    const acquisitionType = options?.acquisitionTypeOverride ?? 'BUY';

    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) {
        return;
      }
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: null
      });
      const serverName = options?.serverNameOverride ?? sheetName;
      servers.add(serverName);

      rows.forEach((row) => {
        const normalizedRow = new Map<string, unknown>();
        Object.entries(row).forEach(([key, value]) => {
          normalizedRow.set(normalizeHeader(key), value);
        });

        const itemName = normalizedRow.get('nomdelitem');
        if (typeof itemName !== 'string' || itemName.trim().length === 0) {
          return;
        }

        const boughtAtRaw = normalizedRow.get('datedachat');
        const boughtAt = parseExcelDate(boughtAtRaw) ?? new Date();
        const statusRaw = normalizedRow.get('itemvendu');
        const statusValue = typeof statusRaw === 'string' ? statusRaw.trim().toLowerCase() : '';
        const isSold =
          statusRaw === true ||
          statusRaw === 1 ||
          statusValue === 'oui' ||
          statusValue === 'yes' ||
          statusValue === 'true';

        const buyPrice = parseNumber(normalizedRow.get('prixachat')) ?? 0;
        const sellPrice = isSold ? parseNumber(normalizedRow.get('prixvente')) : null;
        const commentValue = normalizedRow.get('notes');
        const comment = typeof commentValue === 'string' ? commentValue : undefined;

        operations.push({
          server: serverName,
          itemName: itemName.trim(),
          acquisitionType,
          buyPrice,
          boughtAt,
          comment,
          status: isSold ? 'SOLD' : 'OPEN',
          soldAt: isSold ? boughtAt : null,
          sellPrice,
          priceModified: false
        });
      });
    });

    return { operations, servers };
  }
}
