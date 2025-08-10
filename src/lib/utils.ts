export function calcPrice(base: number, enableExcise: boolean): number {
  if (Number.isNaN(base) || base < 0) return 0;
  const vat = base * 0.07;
  const excise = enableExcise ? base * 0.088 : 0;
  return Math.round((base + vat + excise) * 100) / 100;
}

export function needsUpdate(lastVerifiedAt: string, now: Date = new Date()): boolean {
  const last = new Date(lastVerifiedAt);
  if (Number.isNaN(last.getTime())) return true;
  const sixMonthsMs = 1000 * 60 * 60 * 24 * 30 * 6;
  return now.getTime() - last.getTime() > sixMonthsMs;
}

export function normalizeText(input: string): string {
  return (input || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .trim();
}

export function isSaleReadySupplier(lastVerifiedAt: string, isRecommended: boolean): boolean {
  return isRecommended && !needsUpdate(lastVerifiedAt);
}