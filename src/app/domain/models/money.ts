export type Kamas = number;

export const normalizeKamas = (value: number | null | undefined): Kamas => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 0;
  }
  return Math.max(0, Math.floor(value));
};