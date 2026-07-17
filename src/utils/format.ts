// ── Price formatting ──

/** Format a number to ¥ price string: 12800 -> "¥12,800" */
export function formatPrice(value: number | string): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(n)) return "¥0";
  return "¥" + n.toLocaleString("zh-CN");
}

/** Calculate discount percentage: original=200, current=150 -> 25 */
export function discountPercent(original: number, current: number): number {
  if (original <= 0) return 0;
  return Math.round(((original - current) / original) * 100);
}

/** Format large number with unit: 1234 -> "1.2k", 1234567 -> "1.2M" */
export function compactNumber(value: number): string {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + "M";
  if (value >= 1_000) return (value / 1_000).toFixed(1) + "k";
  return String(value);
}

// ── Date / Time formatting ──

/** Get today"s date as YYYY-MM-DD */
export function today(): string {
  const d = new Date();
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}

/** Get current time as HH:MM */
export function now(): string {
  const d = new Date();
  return pad(d.getHours()) + ":" + pad(d.getMinutes());
}

/** Format a Date to "YYYY年MM月DD日" */
export function formatDateCN(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + d.getDate() + "日";
}

/** Format a time string to "HH:MM" */
export function formatTime(time: string): string {
  if (!time) return "";
  const parts = time.split(":");
  if (parts.length < 2) return time;
  return pad(parseInt(parts[0])) + ":" + pad(parseInt(parts[1]));
}

// ── Helpers ──

function pad(n: number): string {
  return n < 10 ? "0" + n : String(n);
}
