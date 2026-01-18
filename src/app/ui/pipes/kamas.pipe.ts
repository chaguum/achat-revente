import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'kamas',
  standalone: true
})
export class KamasPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return '-';
    }
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value);
  }
}
