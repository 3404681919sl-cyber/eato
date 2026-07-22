import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import type { Category } from "@/types";
import { CAT } from "@/constants";

interface CategoryPickerProps {
  value: Category;
  onChange: (c: Category) => void;
  disabled?: boolean;
}

export default function CategoryPicker({ value, onChange, disabled }: CategoryPickerProps) {
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

  const cat = CAT[value];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border transition-all ${
          disabled ? "cursor-default" : "cursor-pointer hover:opacity-80"
        }`}
        style={{
          backgroundColor: cat.light,
          color: cat.color,
          borderColor: cat.color + "40",
        }}
      >
        <span>{cat.emoji}</span>
        <span>{cat.label}</span>
        {!disabled && <ChevronDown className="w-2.5 h-2.5 ml-0.5 opacity-60" />}
      </button>
      {open && (
        <div className="absolute top-7 left-0 z-30 bg-card border border-border rounded-xl p-1.5 shadow-xl grid grid-cols-2 gap-0.5 w-48">
          {(Object.entries(CAT) as [Category, (typeof CAT)[Category]][]).map(([key, cfg]) => (
            <button
              key={key}
              type="button"
              onClick={() => { onChange(key); setOpen(false); }}
              className={`flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-lg transition-colors ${
                value === key ? "font-semibold" : "text-muted-foreground hover:bg-secondary"
              }`}
              style={value === key ? { backgroundColor: cfg.light, color: cfg.color } : {}}
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
