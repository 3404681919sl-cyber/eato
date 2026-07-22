import type { Place, Category, DealsResult, CalendarSlots } from "@/types";
import type { DataService } from "./types";
import { API_BASE_URL, USERS } from "@/constants";

/**
 * API implementation of DataService.
 * Stub ready for real backend integration.
 * Uncomment the fetch calls when the backend is ready.
 */
export class ApiDataService implements DataService {
  private base: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.base = baseUrl;
  }

  // ── Restaurants ──

  getPlaces(): Place[] {
    // TODO: fetch(`${this.base}/api/restaurants`).then(r => r.json())
    console.warn("ApiDataService.getPlaces: using empty fallback");
    return [];
  }

  savePlaces(_places: Place[]): void {
    // TODO: POST/PUT to backend
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
      if (res.ok) return res.json();
    } catch (e) {
      console.warn("ApiDataService.searchDeals: fetch failed", e);
    }
    throw new Error("Deal search failed");
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
