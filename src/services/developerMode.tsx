import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";

const STORAGE_KEY = "developerMode";

export type DeveloperModeContextValue = {
  developerMode: boolean;
  setDeveloperMode: (next: boolean) => void;
};

const DeveloperModeContext = createContext<DeveloperModeContextValue | null>(null);

/**
 * Developer Mode is an opt-in, frontend-only flag. It never adds a database
 * field, an auth role, or any backend concept — it only surfaces observability
 * UI (Debug Panel + Dev Lab) on top of the existing product surface.
 *
 * Activation: open `/app?dev=1` once. The flag is persisted to localStorage so
 * the developer can later turn it off from within the UI. Normal users never
 * see a Dev entry.
 */
export function DeveloperModeProvider({ children }: { children: ReactNode }) {
  const [developerMode, setDeveloperModeState] = useState<boolean>(() =>
    typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) === "true"
  );

  // Detect the `?dev=1` activation query once on mount and persist it.
  // Strip `?dev=1` from the URL immediately so a later refresh cannot reopen
  // Developer Mode on its own — after activation the flag is owned by localStorage.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("dev") === "1") {
      localStorage.setItem(STORAGE_KEY, "true");
      setDeveloperModeState(true);
      url.searchParams.delete("dev");
      window.history.replaceState({}, "", url.pathname + url.search + url.hash);
    }
  }, []);

  const setDeveloperMode = useCallback((next: boolean) => {
    if (typeof window !== "undefined") {
      if (next) localStorage.setItem(STORAGE_KEY, "true");
      else localStorage.removeItem(STORAGE_KEY);
    }
    setDeveloperModeState(next);
  }, []);

  return (
    <DeveloperModeContext.Provider value={{ developerMode, setDeveloperMode }}>
      {children}
    </DeveloperModeContext.Provider>
  );
}

/**
 * Returns the Developer Mode flag. Tolerant when rendered outside a provider
 * (returns the default "off" state) so isolated component tests don't crash.
 */
export function useDeveloperMode(): DeveloperModeContextValue {
  const ctx = useContext(DeveloperModeContext);
  if (!ctx) return { developerMode: false, setDeveloperMode: () => {} };
  return ctx;
}
