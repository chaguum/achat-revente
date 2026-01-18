import { InjectionToken } from '@angular/core';
import { OperationRepository } from '../../application/ports/operation-repository';
import { ServerRepository } from '../../application/ports/server-repository';

export const OPERATION_REPOSITORY = new InjectionToken<OperationRepository>('OperationRepository');
export const SERVER_REPOSITORY = new InjectionToken<ServerRepository>('ServerRepository');