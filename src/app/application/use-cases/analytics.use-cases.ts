import { inject, Injectable } from '@angular/core';
import { DefaultFeePolicy } from '../../domain/services/fee-policy';
import { computeAnalyticsSnapshot } from '../../domain/services/analytics-calculator';
import { AnalyticsSnapshot } from '../../domain/models/analytics';
import { OPERATION_REPOSITORY } from '../../core/tokens/repositories';

@Injectable({ providedIn: 'root' })
export class AnalyticsUseCases {
  private readonly repository = inject(OPERATION_REPOSITORY);
  private readonly feePolicy = new DefaultFeePolicy();

  async computeSnapshot(): Promise<AnalyticsSnapshot> {
    const operations = await this.repository.listByStatus('SOLD');
    return computeAnalyticsSnapshot(operations, this.feePolicy);
  }
}