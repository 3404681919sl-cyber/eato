import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { Locale } from "./translations";
import { translations } from "./translations";

interface LocaleContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextType>({
  locale: "zh",
  setLocale: () => {},
  t: (key) => key,
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      return (localStorage.getItem("eato_locale") as Locale) || "zh";
    } catch {
      return "zh";
    }
  });

  useEffect(() => {
    try { localStorage.setItem("eato_locale", locale); } catch {}
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const dict = translations[locale] || translations.zh;
    let val = (dict as Record<string, unknown>)[key] as string | undefined;
    if (val === undefined) {
      val = (translations.zh as Record<string, unknown>)[key] as string | undefined;
    }
    if (val === undefined) return key;

    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        val = val!.replace(`{${k}}`, String(v));
      });
    }
    return val;
  }, [locale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
