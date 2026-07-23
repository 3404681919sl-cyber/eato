import type { Place, Category, DealsResult, CalendarSlots } from "@/types";
import type { DataService } from "./types";
import { API_BASE_URL, USERS } from "@/constants";
import { generateDeals } from "@/data/catalog";

/**
 * API implementation of DataService.
 *
 * Restaurants / calendar / users intentionally stay on the local (localStorage)
 * service — only deal comparison is routed to the back-end when VITE_API_BASE
 * is configured. On any failure the deal search falls back to the local mock
 * generator instead of throwing, so the UI never whites out.
 */
export class ApiDataService implements DataService {
  private base: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.base = baseUrl;
  }

  // ── Restaurants ──

  getPlaces(): Place[] {
    // Restaurants are always served from localStorage.
    console.warn("ApiDataService.getPlaces: using empty fallback");
    return [];
  }

  savePlaces(_places: Place[]): void {
    console.warn("ApiDataService.savePlaces: not implemented");
  }

  addPlace(place: Place): Place {
    console.warn("ApiDataService.addPlace: stub");
    return place;
  }

  updatePlace(id: string, patch: Partial<Place>): Place | null {
    console.warn("ApiDataService.updatePlace: stub", id, patch);
    return null;
  }

  deletePlace(id: string): boolean {
    console.warn("ApiDataService.deletePlace: stub", id);
    return false;
  }

  // ── Calendar ──

  getSlots(): CalendarSlots {
    console.warn("ApiDataService.getSlots: stub");
    return {};
  }

  saveSlots(_slots: CalendarSlots): void {
    console.warn("ApiDataService.saveSlots: stub");
  }

  toggleSlot(day: string, time: string, userId: string): string[] {
    console.warn("ApiDataService.toggleSlot: stub", { day, time, userId });
    return [];
  }

  // ── Deals ──

  async searchDeals(placeName: string, category: Category): Promise<DealsResult> {
    try {
      const res = await fetch(`${this.base}/api/deals?place=${encodeURIComponent(placeName)}&category=${category}`);
      if (!res.ok) throw new Error("bad status " + res.status);
      return await res.json();
    } catch (e) {
      console.warn("[ApiDataService] deals 失败，回退本地生成", e);
      // Deterministic local fallback — never throw to the UI.
      return generateDeals(placeName, category);
    }
  }

  // ── Users ──

  getUsers(): { id: string; name: string; color: string }[] {
    return USERS;
  }

  // ── Lifecycle ──

  resetAll(): void {
    console.warn("ApiDataService.resetAll: stub");
  }
}
