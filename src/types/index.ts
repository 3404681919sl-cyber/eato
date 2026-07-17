export type AppState = "landing" | "auth" | "app";
export type AuthMode = "login" | "signup";
export type Tab = "table" | "calendar" | "analytics";
export type Category = "hotpot" | "cafe" | "noodles" | "sushi" | "western" | "bbq" | "local" | "other";
export type Mood = "must" | "excited" | "curious" | "casual";

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

export type DealStatus = "idle" | "loading" | "done";

export type Deal = {
  platform: string;
  description: string;
  price: number;
  originalPrice: number;
  tag?: string;
  isBest?: boolean;
};

export type DealsResult = {
  deals: Deal[];
  bestStack: string;
  saving: number;
  finalPrice: number;
};
