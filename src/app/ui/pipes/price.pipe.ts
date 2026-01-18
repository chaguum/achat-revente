import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'price',
  standalone: true
})
export class PricePipe implements PipeTransform {
  private readonly formatter = new Intl.NumberFormat('fr-FR');

  transform(value: number | null | undefined, fallback = '-'): string {
    if (value === null || value === undefined) {
      return fallback;
    }

    return this.formatter.format(value);
  }
}

