import { BRANDS, type BrandEntry } from '../data/brands';
import { BRAND } from '../constants';

export type BrandMatch =
  | { matched: true; brand: BrandEntry }
  | { matched: false };

// 输店名 → 模糊匹配品牌库（别名包含即命中）
export function matchBrand(name: string): BrandMatch {
  if (!name) return { matched: false };
  const n = name.toLowerCase();
  for (const b of BRANDS) {
    if (b.aliases.some((a) => a && n.includes(a.toLowerCase()))) {
      return { matched: true, brand: b };
    }
  }
  return { matched: false };
}

// 色块头像上的文字：品牌缩写优先，否则店名首字
export function avatarText(name: string): string {
  const m = matchBrand(name);
  if (m.matched) return m.brand.short;
  return name.trim().charAt(0) || '?';
}

// 色块头像底色：品牌色优先，否则主题橙
export function avatarColor(name: string): string {
  const m = matchBrand(name);
  if (m.matched) return m.brand.color;
  return BRAND.accent;
}

// 简单亮度判断：浅底用深字，深底用白字
export function isLightHex(hex: string): boolean {
  const h = hex.replace('#', '');
  if (h.length < 6) return false;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6;
}
