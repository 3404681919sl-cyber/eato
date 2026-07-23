import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import type { Place, Category, DealsResult, CalendarSlots } from "@/types";
import type { DataService } from "./types";
import { MockDataService } from "./mockDataService";
import { ApiDataService } from "./apiDataService";

export interface DataContextType {
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
  // Local (localStorage) is the single source of truth for restaurants,
  // calendar and users. All non-deal operations always go through it.
  const local = useMemo(() => new MockDataService(), []);

  // Optional back-end, used ONLY for deal comparison when VITE_API_BASE is set.
  // When absent, `api` is null and deals are served locally (see searchDeals).
  const apiBase = import.meta.env.VITE_API_BASE as string | undefined;
  const api = useMemo(() => (apiBase ? new ApiDataService(apiBase) : null), [apiBase]);

  const [places, internalSetPlaces] = useState<Place[]>(() => local.getPlaces());
  const [slots, internalSetSlots] = useState<CalendarSlots>(() => local.getSlots());

  const setPlaces = useCallback((updater: Place[] | ((prev: Place[]) => Place[])) => {
    internalSetPlaces((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      local.savePlaces(next);
      return next;
    });
  }, [local]);

  const setSlots = useCallback((updater: CalendarSlots | ((prev: CalendarSlots) => CalendarSlots)) => {
    internalSetSlots((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      local.saveSlots(next);
      return next;
    });
  }, [local]);

  const resetAll = useCallback(() => {
    local.resetAll();
    internalSetPlaces(local.getPlaces());
    internalSetSlots(local.getSlots());
  }, [local]);

  // Composed deal search: try the back-end first, gracefully fall back to the
  // local mock generator on ANY failure. It never throws (no white screen).
  const searchDeals = useCallback(async (name: string, cat: Category): Promise<DealsResult> => {
    if (api) {
      try {
        return await api.searchDeals(name, cat);
      } catch (e) {
        console.warn("[deals] 后端失败，回退本地", e);
      }
    }
    return local.searchDeals(name, cat);
  }, [api, local]);

  const value = useMemo(() => ({
    service: local,
    places,
    slots,
    setPlaces,
    setSlots,
    resetAll,
    searchDeals,
  }), [local, api, places, slots, setPlaces, setSlots, resetAll, searchDeals]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextType {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within a DataProvider");
  return ctx;
}
