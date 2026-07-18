import React, { useState, useMemo } from 'react';
import { Search, Plus, ChevronDown, Clock, BadgePercent, Check, Utensils } from 'lucide-react';
import type { Place, Visit } from '../../types';
import { CAT, DAYS } from '../../constants';
import { StarRow, MoodPicker, CategoryPicker } from '../../utils';
import DealsPanel from '../deals/DealsPanel';

export default function TableView({ places, setPlaces }: { places: Place[]; setPlaces: (p: Place[] | ((prev: Place[]) => Place[])) => void }) {
  const [newName, setNewName] = useState("");
  const [editingMenu, setEditingMenu] = useState<string | null>(null);
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [expandedDeals, setExpandedDeals] = useState<string | null>(null);

  const rows = useMemo(() => {
    const out: Array<{ place: Place; visit: Visit; visitIndex: number; isLast: boolean }> = [];
    for (const place of places) {
      place.visits.forEach((v, i) => out.push({ place, visit: v, visitIndex: i, isLast: i === place.visits.length - 1 }));
    }
    return out;
  }, [places]);

  const totals = useMemo(() => {
    const all = places.flatMap((p) => p.visits);
    return { checked: all.filter((v) => v.checkedIn).length, total: all.length };
  }, [places]);

  const mutPlace = (id: string, patch: Partial<Place>) =>
    setPlaces((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const mutVisit = (pid: string, vid: string, patch: Partial<Visit>) =>
    setPlaces((prev) => prev.map((p) => p.id !== pid ? p : {
      ...p, visits: p.visits.map((v) => v.id !== vid ? v : { ...v, ...patch }),
    }));

  const addVisit = (pid: string) =>
    setPlaces((prev) => prev.map((p) => p.id !== pid ? p : {
      ...p, visits: [...p.visits, { id: `${pid}-${Date.now()}`, date: "", time: "", checkedIn: false, spending: "", review: "" }],
    }));

  const addPlace = () => {
    if (!newName.trim()) return;
    const id = Date.now().toString();
    setPlaces((prev) => [...prev, {
      id, name: newName.trim(), image: "", stars: 3, category: "other", mood: "curious",
      plannedMenu: "",
      visits: [{ id: `${id}-1`, date: "", time: "", checkedIn: false, spending: "", review: "" }],
    }]);
    setNewName("");
  };

  const nowTime = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground leading-tight" style={{ fontFamily: "Playfair Display, serif" }}>
            我们的打卡清单
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5">
            共 {totals.total} 条 · <span className="text-primary font-medium">{totals.checked} 已打卡</span> · {totals.total - totals.checked} 待探索
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text" placeholder="输入店名新增打卡点…" value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addPlace()}
              className="pl-9 pr-4 py-2 text-sm border border-border rounded-xl bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 w-56 placeholder:text-muted-foreground/60"
            />
          </div>
          <button onClick={addPlace} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> 添加
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full" style={{ minWidth: "1220px" }}>
          <thead>
            <tr className="border-b border-border" style={{ backgroundColor: "rgba(242,233,213,0.5)" }}>
              {[
                { l: "日期 & 时间", w: "w-36" }, { l: "待打卡点", w: "w-60" }, { l: "心情", w: "w-24" },
                { l: "拟定菜单", w: "w-48" },
                { l: "优惠比对", w: "w-28" },
                { l: "✓ 打卡", w: "w-16 text-center" },
                { l: "花费 (元)", w: "w-24" }, { l: "评价留言", w: "" }, { l: "+", w: "w-10 text-center" },
              ].map(({ l, w }) => (
                <th key={l} className={`px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider ${w}`}
                  style={{ fontFamily: "DM Mono, monospace" }}>
                  {l}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ place, visit, visitIndex, isLast }) => {
              const checked = visit.checkedIn;
              const cat = CAT[place.category];
              return (
                <React.Fragment key={visit.id}>
                <tr
                  className={`border-b border-border/40 transition-colors ${checked ? "bg-muted/15" : "hover:bg-secondary/25"}`}>
                  <td className={`px-4 py-3 ${checked ? "opacity-35 pointer-events-none" : ""}`}>
                    <div className="flex flex-col gap-1">
                      <div className="relative">
                        <select value={visit.date} onChange={(e) => mutVisit(place.id, visit.id, { date: e.target.value })}
                          className="appearance-none text-sm text-foreground bg-transparent border-none focus:outline-none cursor-pointer pr-5 font-medium w-full"
                          style={{ fontFamily: "DM Mono, monospace" }}>
                          <option value="">选择日期</option>
                          {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        <input
                          type="time" value={visit.time}
                          onChange={(e) => mutVisit(place.id, visit.id, { time: e.target.value })}
                          className="text-xs text-muted-foreground bg-transparent border-none focus:outline-none w-20"
                          style={{ fontFamily: "DM Mono, monospace" }}
                        />
                        <button
                          type="button" title="设为当前时间"
                          onClick={() => mutVisit(place.id, visit.id, { time: nowTime() })}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium leading-none">
                          NOW
                        </button>
                      </div>
                    </div>
                  </td>

                  <td className={`px-4 py-3 ${checked ? "opacity-35" : ""}`}>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        {place.image ? (
                          <img src={place.image} alt={place.name} className={`w-12 h-12 rounded-xl object-cover ${checked ? "grayscale" : ""}`} />
                        ) : (
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: cat.light }}>
                            {cat.emoji}
                          </div>
                        )}
                        {visitIndex > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none"
                            style={{ backgroundColor: cat.color }}>
                            #{visitIndex + 1}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{place.name}</p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <StarRow value={place.stars} onChange={(s) => mutPlace(place.id, { stars: s })} disabled={checked} />
                          <CategoryPicker value={place.category} onChange={(c) => mutPlace(place.id, { category: c })} disabled={checked} />
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className={`px-4 py-3 ${checked ? "opacity-35 pointer-events-none" : ""}`}>
                    <MoodPicker value={place.mood} onChange={(m) => mutPlace(place.id, { mood: m })} disabled={checked} />
                  </td>

                  <td className={`px-4 py-3 ${checked ? "opacity-35 pointer-events-none" : ""}`}>
                    {editingMenu === visit.id ? (
                      <input autoFocus value={place.plannedMenu} onChange={(e) => mutPlace(place.id, { plannedMenu: e.target.value })}
                        onBlur={() => setEditingMenu(null)} onKeyDown={(e) => e.key === "Enter" && setEditingMenu(null)}
                        className="w-full text-xs bg-secondary border border-primary/30 rounded-lg px-2 py-1.5 focus:outline-none" placeholder="输入菜单…" />
                    ) : (
                      <p onClick={() => !checked && setEditingMenu(visit.id)}
                        className={`text-xs text-muted-foreground line-clamp-2 leading-relaxed ${!checked ? "cursor-text hover:text-foreground transition-colors" : "cursor-default"}`}
                        title={place.plannedMenu}>
                        {place.plannedMenu || <span className="italic opacity-40">点击添加菜单…</span>}
                      </p>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setExpandedDeals(expandedDeals === visit.id ? null : visit.id)}
                      className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all ${
                        expandedDeals === visit.id
                          ? "border-primary/40 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/30 hover:text-primary"
                      }`}
                      style={expandedDeals === visit.id ? { backgroundColor: "#BF4E2A0D" } : {}}>
                      <BadgePercent className="w-3 h-3" />
                      {expandedDeals === visit.id ? "收起" : "查优惠"}
                      {expandedDeals !== visit.id && <ChevronDown className="w-3 h-3 opacity-50" />}
                    </button>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <button type="button" onClick={() => mutVisit(place.id, visit.id, { checkedIn: !checked })}
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center mx-auto transition-all duration-200 ${checked ? "border-primary bg-primary text-primary-foreground scale-110" : "border-border hover:border-primary/60"}`}>
                      {checked && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                    </button>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground" style={{ fontFamily: "DM Mono, monospace" }}>¥</span>
                      <input type="number" value={visit.spending} onChange={(e) => mutVisit(place.id, visit.id, { spending: e.target.value })}
                        placeholder="—" min="0"
                        className="w-16 text-sm text-foreground bg-transparent border-none focus:outline-none placeholder:text-muted-foreground/40"
                        style={{ fontFamily: "DM Mono, monospace" }} />
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    {editingReview === visit.id ? (
                      <input autoFocus value={visit.review} onChange={(e) => mutVisit(place.id, visit.id, { review: e.target.value })}
                        onBlur={() => setEditingReview(null)} onKeyDown={(e) => e.key === "Enter" && setEditingReview(null)}
                        className="w-full text-xs bg-secondary border border-primary/30 rounded-lg px-2 py-1.5 focus:outline-none" placeholder="写下你的感受…" />
                    ) : (
                      <p onClick={() => setEditingReview(visit.id)}
                        className="text-xs text-muted-foreground cursor-text hover:text-foreground transition-colors truncate max-w-[180px]" title={visit.review}>
                        {visit.review || <span className="italic opacity-35">点击添加评价…</span>}
                      </p>
                    )}
                  </td>

                  <td className="px-4 py-3 text-center">
                    {isLast && (
                      <button type="button" onClick={() => addVisit(place.id)} title="再约一次"
                        className="w-6 h-6 rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary flex items-center justify-center mx-auto transition-all">
                        <Plus className="w-3 h-3" />
                      </button>
                    )}
                  </td>
                </tr>

                {expandedDeals === visit.id && (
                  <tr className="border-b border-border/40">
                    <td colSpan={9} className="px-4" style={{ backgroundColor: "rgba(242,233,213,0.2)" }}>
                      <DealsPanel
                        category={place.category}
                        onClose={() => setExpandedDeals(null)}
                      />
                    </td>
                  </tr>
                )}
                </React.Fragment>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={9} className="py-16 text-center">
                <Utensils className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">还没有打卡点，搜索添加你们的第一站吧！</p>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
