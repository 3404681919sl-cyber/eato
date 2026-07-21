import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import type { Place, Category, DealsResult, CalendarSlots } from "../types";
import type { DataService } from "./types";
import { MockDataService } from "./mockDataService";

/**
 * Toggle this to switch between mock and real API.
 * When your backend is ready, change to `new ApiDataService()`.
 */
function createService(): DataService {
  // ⚡ Switch here: new ApiDataService() when backend is ready
  return new MockDataService();
}

interface DataContextType {
  service: DataService;
  places: Place[];
  slots: CalendarSlots;
  setPlaces: (places: Place[] | ((prev: Place[]) => Place[])) => void;
  setSlots: (slots: CalendarSlots | ((prev: CalendarSlots) => CalendarSlots)) => void;
  resetAll: () => void;
  searchDeals: (name: string, cat: Category) => Promise<DealsResult>;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const serviceRef = useMemo(() => createService(), []);

  const [places, internalSetPlaces] = useState<Place[]>(() => serviceRef.getPlaces());
  const [slots, internalSetSlots] = useState<CalendarSlots>(() => serviceRef.getSlots());

  const setPlaces = useCallback((updater: Place[] | ((prev: Place[]) => Place[])) => {
    internalSetPlaces((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      serviceRef.savePlaces(next);
      return next;
    });
  }, [serviceRef]);

  const setSlots = useCallback((updater: CalendarSlots | ((prev: CalendarSlots) => CalendarSlots)) => {
    internalSetSlots((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      serviceRef.saveSlots(next);
      return next;
    });
  }, [serviceRef]);

  const resetAll = useCallback(() => {
    serviceRef.resetAll();
    internalSetPlaces(serviceRef.getPlaces());
    internalSetSlots(serviceRef.getSlots());
  }, [serviceRef]);

  const searchDeals = useCallback(async (name: string, cat: Category): Promise<DealsResult> => {
    return serviceRef.searchDeals(name, cat);
  }, [serviceRef]);

  const value = useMemo(() => ({
    service: serviceRef, places, slots, setPlaces, setSlots, resetAll, searchDeals,
  }), [serviceRef, places, slots, setPlaces, setSlots, resetAll, searchDeals]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextType {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within a DataProvider");
  return ctx;
}
