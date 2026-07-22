import { describe, it, expect, beforeEach } from "vitest";
import { MockDataService } from "../mockDataService";
import { STORAGE_KEYS } from "@/constants";
import type { Place, CalendarSlots } from "@/types";

describe("MockDataService", () => {
  let service: MockDataService;

  beforeEach(() => {
    localStorage.clear();
    service = new MockDataService();
  });

  // ─── Places CRUD ────────────────────────────────────────────

  describe("getPlaces / savePlaces", () => {
    it("should return seed data on first call", () => {
      const places = service.getPlaces();
      expect(Array.isArray(places)).toBe(true);
      expect(places.length).toBeGreaterThan(0);
      places.forEach((p) => {
        expect(p).toHaveProperty("id");
        expect(p).toHaveProperty("name");
        expect(p).toHaveProperty("category");
      });
    });

    it("should persist places to localStorage after savePlaces", () => {
      const places = service.getPlaces();
      places[0].name = "Updated Name";
      service.savePlaces(places);

      const raw = localStorage.getItem(STORAGE_KEYS.PLACES);
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!);
      expect(parsed[0].name).toBe("Updated Name");
    });

    it("should return consistent data on repeated calls (cached)", () => {
      const p1 = service.getPlaces();
      const p2 = service.getPlaces();
      expect(p1).toEqual(p2); // same data (structurally equal)
    });
  });

  describe("addPlace", () => {
    it("should add a new place to the list and persist", () => {
      const newPlace: Place = {
        id: "test-1",
        name: "Test Restaurant",
        image: "",
        stars: 4,
        category: "chinese",
        mood: "excited",
        plannedMenu: "",
        visits: [],
      };
      const result = service.addPlace(newPlace);
      expect(result).toEqual(newPlace);

      const places = service.getPlaces();
      expect(places.find((p) => p.id === "test-1")).toBeDefined();
    });
  });

  describe("updatePlace", () => {
    it("should update an existing place", () => {
      const places = service.getPlaces();
      const firstId = places[0].id;
      const updated = service.updatePlace(firstId, { stars: 5, mood: "must" });
      expect(updated).not.toBeNull();
      expect(updated!.stars).toBe(5);
      expect(updated!.mood).toBe("must");
    });

    it("should return null for non-existent id", () => {
      const result = service.updatePlace("non-existent", { stars: 3 });
      expect(result).toBeNull();
    });
  });

  describe("deletePlace", () => {
    it("should delete an existing place and return true", () => {
      const places = service.getPlaces();
      const firstId = places[0].id;
      const result = service.deletePlace(firstId);
      expect(result).toBe(true);

      const updatedPlaces = service.getPlaces();
      expect(updatedPlaces.find((p) => p.id === firstId)).toBeUndefined();
    });

    it("should return false for non-existent id", () => {
      const result = service.deletePlace("non-existent");
      expect(result).toBe(false);
    });
  });

  // ─── Calendar Slots ─────────────────────────────────────────

  describe("getSlots / saveSlots", () => {
    it("should return seed calendar data on first call", () => {
      const slots = service.getSlots();
      expect(slots).toBeDefined();
      expect(typeof slots).toBe("object");
    });
  });

  describe("toggleSlot", () => {
    it("should add a user to a slot", () => {
      const result = service.toggleSlot("周一", "12:00", "a");
      expect(result).toContain("a");
    });

    it("should remove a user from a slot if already present", () => {
      service.toggleSlot("周一", "12:00", "a");
      const result = service.toggleSlot("周一", "12:00", "a");
      expect(result).not.toContain("a");
    });

    it("should persist toggled slots to localStorage", () => {
      service.toggleSlot("周二", "18:00", "b");
      const raw = localStorage.getItem(STORAGE_KEYS.SLOTS);
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!);
      expect(parsed["周二_18:00"]).toContain("b");
    });
  });

  // ─── Users ──────────────────────────────────────────────────

  describe("getUsers", () => {
    it("should return the predefined users array", () => {
      const users = service.getUsers();
      expect(users).toHaveLength(3);
      expect(users[0]).toHaveProperty("id");
      expect(users[0]).toHaveProperty("name");
      expect(users[0]).toHaveProperty("color");
    });
  });

  // ─── Lifecycle ──────────────────────────────────────────────

  describe("resetAll", () => {
    it("should clear localStorage and reset caches", () => {
      // Make some changes first
      service.addPlace({
        id: "temp", name: "Temp", image: "",
        stars: 3, category: "other", mood: "casual",
        plannedMenu: "", visits: [],
      });
      service.toggleSlot("周三", "09:00", "c");

      service.resetAll();

      // localStorage should be cleared
      expect(localStorage.getItem(STORAGE_KEYS.PLACES)).toBeNull();
      expect(localStorage.getItem(STORAGE_KEYS.SLOTS)).toBeNull();

      // Caches reset → fresh seed data
      const places = service.getPlaces();
      expect(places.find((p) => p.id === "temp")).toBeUndefined();
    });
  });

  // ─── Deals ──────────────────────────────────────────────────

  describe("searchDeals", () => {
    it("should return a DealsResult with deals array", async () => {
      const result = await service.searchDeals("Test", "chinese");
      expect(result).toHaveProperty("deals");
      expect(Array.isArray(result.deals)).toBe(true);
      expect(result).toHaveProperty("bestStack");
      expect(result).toHaveProperty("saving");
      expect(result).toHaveProperty("finalPrice");
    });

    it("should return deals for each category without error", async () => {
      const categories = ["hotpot", "chinese", "fastfood", "asian", "western", "bbq", "dessert", "seafood", "other"] as const;
      for (const cat of categories) {
        const result = await service.searchDeals("Any", cat);
        expect(result.deals.length).toBeGreaterThan(0);
      }
    });
  });
});
