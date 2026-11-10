// European number formatting: thousands separator = space (U+202F narrow nbsp),
// decimal = comma. Numbers ≥ 1 000 compact to k/m/b/t when compact=true.

const NBSP = "\u202F"; // narrow no-break space

export function fmtNumber(n: number | null | undefined, decimals = 0): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  const fixed = n.toFixed(decimals);
  const [intPart, decPart] = fixed.split(".");
  const withSep = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  return decPart ? `${withSep},${decPart}` : withSep;
}

export function fmtEur(n: number | null | undefined, decimals = 0): string {
  return `${fmtNumber(n, decimals)}${NBSP}€`;
}

export function fmtCompact(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000_000) return `${fmtNumber(n / 1e12, 1)}${NBSP}t`;
  if (abs >= 1_000_000_000) return `${fmtNumber(n / 1e9, 1)}${NBSP}b`;
  if (abs >= 1_000_000) return `${fmtNumber(n / 1e6, 1)}${NBSP}m`;
  if (abs >= 1_000) return `${fmtNumber(n / 1e3, 1)}${NBSP}k`;
  return fmtNumber(n, 0);
}

export function fmtEurCompact(n: number | null | undefined): string {
  return `${fmtCompact(n)}${NBSP}€`;
}

export function fmtQty(n: number | null | undefined, unit?: string | null): string {
  const decimals = n != null && Math.abs(n) < 100 && n % 1 !== 0 ? 2 : 0;
  const base = fmtNumber(n, decimals);
  return unit ? `${base}${NBSP}${unit}` : base;
}

export function parseNumberInput(s: string): number {
  if (!s) return 0;
  const cleaned = s.replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}
