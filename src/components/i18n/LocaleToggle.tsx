import React from "react";
import { Languages } from "lucide-react";
import { useLocale } from "../../i18n";
import type { Locale } from "../../i18n/translations";

const locales: { key: Locale; label: string }[] = [
  { key: "zh", label: "中" },
  { key: "en", label: "EN" },
];

export default function LocaleToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
      <Languages className="w-3.5 h-3.5 text-muted-foreground ml-1.5" />
      {locales.map((l) => (
        <button key={l.key} type="button" onClick={() => setLocale(l.key)}
          className={"text-[11px] font-semibold px-1.5 py-0.5 rounded-md transition-all " +
            (locale === l.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
          {l.label}
        </button>
      ))}
    </div>
  );
}
