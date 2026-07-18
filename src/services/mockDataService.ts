import type { Place, Category, DealsResult, CalendarSlots } from "../types";
import type { DataService } from "./types";
import { USERS } from "../constants";
import { SEED, buildSeedCalendar } from "../data";
import { generateDeals } from "../data";

const STORAGE_KEYS = {
  PLACES: "eato_places",
  SLOTS: "eato_slots",
} as const;

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key: string, data: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

/**
 * Mock implementation of DataService.
 * Uses localStorage for persistence, with in-memory fallback.
 * When switching to real API, replace this with ApiDataService.
 */
export class MockDataService implements DataService {
  private placesCache: Place[] | null = null;
  private slotsCache: CalendarSlots | null = null;

  getPlaces(): Place[] {
    if (!this.placesCache) {
      this.placesCache = loadJSON(STORAGE_KEYS.PLACES, SEED);
    }
    return this.placesCache;
  }

  savePlaces(places: Place[]): void {
    this.placesCache = places;
    saveJSON(STORAGE_KEYS.PLACES, places);
  }

  addPlace(place: Place): Place {
    const places = this.getPlaces();
    places.push(place);
    this.savePlaces(places);
    return place;
  }

  updatePlace(id: string, patch: Partial<Place>): Place | null {
    const places = this.getPlaces();
    const idx = places.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    places[idx] = { ...places[idx], ...patch };
    this.savePlaces(places);
    return places[idx];
  }

  deletePlace(id: string): boolean {
    const places = this.getPlaces();
    const idx = places.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    places.splice(idx, 1);
    this.savePlaces(places);
    return true;
  }

  getSlots(): CalendarSlots {
    if (!this.slotsCache) {
      this.slotsCache = loadJSON(STORAGE_KEYS.SLOTS, buildSeedCalendar());
    }
    return this.slotsCache;
  }

  saveSlots(slots: CalendarSlots): void {
    this.slotsCache = slots;
    saveJSON(STORAGE_KEYS.SLOTS, slots);
  }

  toggleSlot(day: string, time: string, userId: string): string[] {
    const slots = this.getSlots();
    const key = `${day}_${time}`;
    const cur = slots[key] || [];
    if (cur.includes(userId)) {
      slots[key] = cur.filter((u) => u !== userId);
    } else {
      slots[key] = [...cur, userId];
    }
    if (slots[key].length === 0) delete slots[key];
    this.saveSlots(slots);
    return slots[key] || [];
  }

  async searchDeals(placeName: string, category: Category): Promise<DealsResult> {
    return generateDeals(category);
  }

  getUsers(): { id: string; name: string; color: string }[] {
    return USERS;
  }

  resetAll(): void {
    localStorage.removeItem(STORAGE_KEYS.PLACES);
    localStorage.removeItem(STORAGE_KEYS.SLOTS);
    this.placesCache = null;
    this.slotsCache = null;
  }
}
