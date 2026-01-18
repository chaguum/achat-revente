const EMPTY = '';

export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function normalizeItemName(value: unknown): string {
  if (value === null || value === undefined) {
    return EMPTY;
  }

  const text = typeof value === 'string' ? value : String(value);
  return normalizeWhitespace(text);
}

export function normalizeServerName(value: unknown): string {
  if (value === null || value === undefined) {
    return EMPTY;
  }

  const text = typeof value === 'string' ? value : String(value);
  return normalizeWhitespace(text);
}

export function normalizeFilterText(value: string): string {
  return normalizeWhitespace(value).toLowerCase();
}

export function parsePriceValue(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? Math.trunc(value) : null;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    const digits = trimmed.replace(/[^0-9]/g, '');
    if (!digits) {
      return null;
    }

    const parsed = Number.parseInt(digits, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

