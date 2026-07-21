// ── App state ──
export type AppState = "landing" | "auth" | "app";
export type AuthMode = "login" | "signup";
export type Tab = "table" | "calendar" | "analytics";

// ── Dining categories & moods (canonical 9-category system) ──
export type Category =
  | "hotpot" | "chinese" | "fastfood" | "asian"
  | "western" | "bbq" | "dessert" | "seafood" | "other";
export type Mood = "must" | "excited" | "curious" | "casual";

export const CATEGORY_LIST: Category[] = [
  "hotpot","chinese","fastfood","asian","western","bbq","dessert","seafood","other",
];
export const MOOD_LIST: Mood[] = ["must","excited","curious","casual"];

// ── Data models ──
export type Visit = {
  id: string; date: string; time: string;
  checkedIn: boolean; spending: string; review: string;
};
export type Place = {
  id: string; name: string; image: string;
  stars: number; category: Category; mood: Mood;
  plannedMenu: string; visits: Visit[];
};
export type Dish = {
  id: string; name: string; image: string; emoji: string;
  rating: number; reviewCount: number;
  sentiments: Array<{ percent: number; text: string }>;
};
export type DealStatus = "idle" | "loading" | "done";
export type Deal = {
  platform: string; description: string;
  price: number; originalPrice: number;
  tag?: string; isBest?: boolean;
};
export type DealsResult = {
  deals: Deal[]; bestStack: string; saving: number; finalPrice: number;
};
