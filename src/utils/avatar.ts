import type { Category } from "../types";
import { BRAND_DB, CAT } from "../data/catalog";

export function brandAvatar(emoji: string, color: string, label?: string): string {
  let svg: string;
  if (label) {
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="${color}"/><text x="50" y="62" font-size="42" font-weight="bold" fill="white" text-anchor="middle">${label}</text><text x="78" y="28" font-size="26" text-anchor="middle">${emoji}</text></svg>`;
  } else {
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="${color}"/><text x="50" y="64" font-size="50" text-anchor="middle">${emoji}</text></svg>`;
  }
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function resolveBrand(name: string): { emoji: string; color: string; category: Category } | null {
  const n = name.toLowerCase();
  for (const b of BRAND_DB) {
    if (b.keywords.some((k) => n.includes(k.toLowerCase()))) return b;
  }
  return null;
}

export function resolvePlaceImage(name: string, category: Category, poiPhoto?: string): string {
  if (poiPhoto) return poiPhoto;
  const brand = resolveBrand(name);
  if (brand) return brandAvatar(brand.emoji, brand.color, name.charAt(0));
  const cat = CAT[category] ?? CAT.other;
  return brandAvatar(cat.emoji, cat.light);
}
