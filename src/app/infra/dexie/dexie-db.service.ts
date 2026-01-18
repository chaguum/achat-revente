import { Injectable } from '@angular/core';
import { DofusTradesDb } from './dofus-db';

@Injectable({ providedIn: 'root' })
export class DexieDbService {
  readonly db = new DofusTradesDb();
}