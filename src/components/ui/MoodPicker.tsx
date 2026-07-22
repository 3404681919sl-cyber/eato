import { useState, useRef, useEffect } from "react";
import type { Mood } from "@/types";
import { MOOD } from "@/constants";

interface MoodPickerProps {
  value: Mood;
  onChange: (m: Mood) => void;
  disabled?: boolean;
}

export default function MoodPicker({ value, onChange, disabled }: MoodPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const m = MOOD[value];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-full transition-colors ${
          disabled ? "cursor-default opacity-60" : "cursor-pointer hover:opacity-80"
        }`}
        style={{ backgroundColor: m.color + "20", color: m.color }}
      >
        <span>{m.emoji}</span>
        <span>{m.label}</span>
      </button>
      {open && (
        <div className="absolute top-7 left-0 z-30 bg-card border border-border rounded-xl p-1.5 shadow-xl flex flex-col gap-0.5 w-28">
          {(Object.entries(MOOD) as [Mood, (typeof MOOD)[Mood]][]).map(([key, cfg]) => (
            <button
              key={key}
              type="button"
              onClick={() => { onChange(key); setOpen(false); }}
              className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg transition-colors ${
                value === key ? "font-semibold" : "text-muted-foreground hover:bg-secondary"
              }`}
              style={value === key ? { backgroundColor: cfg.color + "15", color: cfg.color } : {}}
            >
              <span>{cfg.emoji}</span>
              <span>{cfg.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
