import type { Place, Category, DealsResult, CalendarSlots } from "@/types";

/**
 * DataService interface - single source of truth for all data operations.
 * MockDataService implements this with in-memory/localStorage data.
 * ApiDataService (future) implements this with real HTTP calls.
 * Components only depend on this interface, never on concrete implementations.
 */
export interface DataService {
  // ── Restaurants / Places ──
  getPlaces(): Place[];
  savePlaces(places: Place[]): void;
  addPlace(place: Place): Place;
  updatePlace(id: string, patch: Partial<Place>): Place | null;
  deletePlace(id: string): boolean;

  // ── Calendar Slots ──
  getSlots(): CalendarSlots;
  saveSlots(slots: CalendarSlots): void;
  toggleSlot(day: string, time: string, userId: string): string[];

  // ── Deals ──
  searchDeals(placeName: string, category: Category): Promise<DealsResult>;

  // ── Users ──
  getUsers(): { id: string; name: string; color: string }[];

  // ── Lifecycle ──
  resetAll(): void;
}
