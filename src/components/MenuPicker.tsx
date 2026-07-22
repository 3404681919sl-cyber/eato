import React, { useState } from "react";
import { Star, Check } from "lucide-react";
import type { Category } from "../types";
import { DISH_DB, CAT } from "../data/catalog";
import { brandAvatar } from "../utils/avatar";

export function MenuPicker({ category, initial, onConfirm, onClose }: {
  category: Category; initial: string; onConfirm: (dishes: string[]) => void; onClose: () => void;
}) {
  const [selected, setSelected] = useState<string[]>(initial ? initial.split(" · ").filter(Boolean) : []);
  const dishes = DISH_DB[category] || [];
  const catCfg = CAT[category] ?? CAT.other;
  const toggle = (name: string) =>
    setSelected((s) => (s.includes(name) ? s.filter((x) => x !== name) : [...s, name]));
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card rounded-2xl w-full max-w-3xl max-h-[88vh] overflow-hidden flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">选择拟定菜品</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{catCfg.emoji} {catCfg.label} · 共 {dishes.length} 道 · 点选菜品加入菜单</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground text-lg leading-none">✕</button>
        </div>
        <div className="p-5 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-3">
          {dishes.map((d) => {
            const isSel = selected.includes(d.name);
            return (
              <button key={d.id} type="button" onClick={() => toggle(d.name)}
                className={`overflow-hidden rounded-xl border text-left transition-all ${isSel ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/40"}`}>
                <div className="relative h-28 bg-gray-100 flex items-center justify-center overflow-hidden">
                  <span className="text-4xl opacity-20">{catCfg.emoji}</span>
                  <img src={d.image} alt={d.name} loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      const el = e.currentTarget;
                      el.onerror = null;
                      el.src = brandAvatar(d.emoji, catCfg.light);
                    }} />
                  <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 bg-white/90 backdrop-blur-sm rounded-full px-1.5 py-0.5 shadow-sm">
                    <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                    <span className="text-[11px] font-bold text-amber-700">{d.rating}</span>
                  </div>
                  {isSel && (
                    <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-sm font-semibold text-foreground line-clamp-1">{d.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{d.reviewCount.toLocaleString()} 条评价</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {d.sentiments.map((s, i) => (
                      <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">{s.percent}% {s.text}</span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <div className="px-5 py-4 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground">已选 <b className="text-foreground">{selected.length}</b> 道菜</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setSelected([])} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors">清空</button>
            <button onClick={() => onConfirm(selected)} className="text-xs font-semibold px-4 py-1.5 rounded-lg text-white transition-opacity hover:opacity-90" style={{ backgroundColor: "#BF4E2A" }}>确定</button>
          </div>
        </div>
      </div>
    </div>
  );
}
