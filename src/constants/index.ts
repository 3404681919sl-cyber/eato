import type { Category, Mood, PlatformId, IntervalDef, DayLabel } from "../types";

// ── App branding ──
export const APP_NAME = "Eato";
export const APP_TAGLINE = "你的智能美食旅行规划助手";
export const APP_VERSION = "1.0.0";
export const APP_DESC = "和朋友一起打卡收藏的餐厅，安排聚餐时间，分析消费习惯。让每一顿都值得期待。";
export const APP_FONT = "'DM Sans', sans-serif";
export const APP_FONT_SERIF = "'Playfair Display', serif";
export const APP_FONT_MONO = "'DM Mono', monospace";

// ── Brand colors ──
export const BRAND = {
  primary: "#BF4E2A",
  primaryLight: "#E8963C",
  primaryDark: "#A04000",
  accent: "#BF4E2A",
  success: "#16A34A",
  warning: "#D97706",
  info: "#2563EB",
  danger: "#DC2626",
  bg: "#0C0805",
  card: "#FFFFFF",
} as const;

// ── Storage ──
export const STORAGE_KEYS = {
  PLACES: "eato_places",
  SLOTS: "eato_slots",
} as const;

// ── API ──
export const API_BASE_URL = "http://localhost:3001";

// ── Grid layout ──
export const TABLE_ROW_GRID = { gridTemplateColumns: "180px 100px 80px 70px 1fr 120px 60px" };

// ── Category config ──
export type CategoryConfig = { label: string; emoji: string; color: string; light: string };

export const CAT: Record<Category, CategoryConfig> = {
  hotpot:  { label: "火锅",  emoji: "🍲", color: "#DC2626", light: "#FEE2E2" },
  cafe:    { label: "茶咖",  emoji: "☕", color: "#2563EB", light: "#DBEAFE" },
  noodles: { label: "汤面",  emoji: "🍻", color: "#16A34A", light: "#DCFCE7" },
  sushi:   { label: "寿司",  emoji: "🍆", color: "#92400E", light: "#FEF3C7" },
  western: { label: "西餐",  emoji: "🍈", color: "#CA8A04", light: "#FEF9C3" },
  bbq:     { label: "烧烤",  emoji: "🍯", color: "#EA580C", light: "#FFEDD5" },
  local:   { label: "本帮菜", emoji: "🍱", color: "#7C3AED", light: "#EDE9FE" },
  other:   { label: "其他",  emoji: "🍍", color: "#6B7280", light: "#F3F4F6" },
};

export const CATEGORY_IMAGES: Record<string, string> = {
  hotpot: "/brands/category-hotpot.png",
  sushi: "/brands/category-sushi.png",
  noodles: "/brands/category-noodles.png",
  cafe: "/brands/category-cafe.png",
  western: "/brands/category-western.png",
  bbq: "/brands/category-bbq.png",
  local: "/brands/category-local.png",
  other: "/brands/category-other.png",
};

// ── Mood config ──
export type MoodConfig = { label: string; emoji: string; color: string };

export const MOOD: Record<Mood, MoodConfig> = {
  must:    { label: "超想去", emoji: "🔥", color: "#DC2626" },
  excited: { label: "很期待", emoji: "🌟", color: "#D97706" },
  curious: { label: "想试试", emoji: "🎠", color: "#2563EB" },
  casual:  { label: "随便吃", emoji: "🍔", color: "#6B7280" },
};

// ── Platform config ──
export type PlatformConfig = { name: string; color: string; bg: string; textColor: string };

export const PLATFORMS: Record<PlatformId, PlatformConfig> = {
  meituan:  { name: "美团",     color: "#FFCC00", bg: "#FFFBE6", textColor: "#664D00" },
  douyin:   { name: "抖音",     color: "#161823", bg: "#F0F0F2", textColor: "#161823" },
  dianping: { name: "大众点评", color: "#FC5531", bg: "#FFF0ED", textColor: "#C03010" },
  taobao:   { name: "淘宝闪购", color: "#FF4400", bg: "#FFF3EE", textColor: "#C03010" },
  xianyu:   { name: "闲鱼",     color: "#00B8C8", bg: "#E8FAFC", textColor: "#007080" },
};

export const PLATFORM_KEYS: PlatformId[] = ["meituan","douyin","dianping","taobao","xianyu"];

// ── Calendar ──
export const DAYS: DayLabel[] = ["周一","周二","周三","周四","周五","周六","周日"];

export const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = Math.floor(i / 2) + 10;
  const m = i % 2 === 0 ? "00" : "30";
  return h + ":" + m;
}).slice(0, 24);

export const INTERVALS: IntervalDef[] = [
  { label: "午餐",   start: "11:00", end: "14:00", color: "#BF4E2A", icon: "☀️" },
  { label: "下午茶", start: "14:00", end: "17:00", color: "#D97706", icon: "🍵" },
  { label: "晚餐",   start: "17:00", end: "21:30", color: "#2563EB", icon: "🌙" },
];

// ── Users ──
export const USERS = [
  { id: "a", name: "小美", color: "#BF4E2A" },
  { id: "b", name: "阿帅", color: "#2563EB" },
  { id: "c", name: "阿豪", color: "#16A34A" },
];

// ── Chart ──
export const PIE_COLORS = ["#BF4E2A", "#E8963C", "#7DC88A", "#6B8FD9", "#A78BFA", "#FB7185"];

// ── Months ──
export const MONTHS = ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"];


