// ── App state ──
export type AppState = "landing" | "auth" | "app";
export type AuthMode = "login" | "signup";
export type Tab = "table" | "calendar" | "analytics";
export type Screen = AppState;

// ── Dining categories & moods ──
export type Category = "hotpot" | "cafe" | "noodles" | "sushi" | "western" | "bbq" | "local" | "other";
export type Mood = "must" | "excited" | "curious" | "casual";

export const CATEGORY_LIST: Category[] = ["hotpot","cafe","noodles","sushi","western","bbq","local","other"];
export const MOOD_LIST: Mood[] = ["must","excited","curious","casual"];

// ── Data models ──
export type Visit = {
  id: string;
  date: string;
  time: string;
  checkedIn: boolean;
  spending: string;
  review: string;
};

export type Place = {
  id: string;
  name: string;
  image: string;
  stars: number;
  category: Category;
  mood: Mood;
  plannedMenu: string;
  visits: Visit[];
};

export type User = {
  id: string;
  name: string;
  color: string;
};

// ── Calendar ──
export type IntervalLabel = "午餐" | "下午茶" | "晚餐";
export type DayLabel = "周一" | "周二" | "周三" | "周四" | "周五" | "周六" | "周日";

export type CalendarSlot = {
  day: DayLabel;
  time: string;
  userIds: string[];
};

export type CalendarSlots = Record<string, string[]>;  // key: "周一_11:00"

export type IntervalDef = {
  label: IntervalLabel;
  start: string;
  end: string;
  color: string;
  icon: string;
};

// ── Deals ──
export type DealStatus = "idle" | "loading" | "done";

export type PlatformId = "meituan" | "douyin" | "dianping" | "taobao" | "xianyu";

export type PlatformConfig = {
  name: string;
  color: string;
  bg: string;
  textColor: string;
  searchUrl: string;
};

export type Deal = {
  platform: string;
  platformName?: string;
  platformColor?: string;
  description: string;
  price: number;
  originalPrice: number;
  discount?: number;
  tag?: string;
  isBest?: boolean;
  deepLink?: string;
};

export type DealsResult = {
  deals: Deal[];
  bestStack: string;
  saving: number;
  finalPrice: number;
  bestUrl?: string;
  keyword?: string;
};

// ── Analytics ──
export type StatCardDef = {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  bg: string;
};

export type AnalyticsData = {
  checked: number;
  pending: number;
  totalSpent: number;
  avgPer: number;
  byPlace: { name: string; value: number; color: string; emoji: string }[];
  monthly: { name: string; spent: number }[];
  pairs: { pair: string[]; count: number; color: string }[];
};

// ── UI helpers ──
export type WithId<T> = T & { id: string };
export type Nullable<T> = T | null;
export type AsyncState<T> = { loading: boolean; data: Nullable<T>; error: Nullable<string> };

export type SortDir = "asc" | "desc";

export type ColorHex = string;
