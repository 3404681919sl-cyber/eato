import React, { useState, useRef, useEffect } from "react";
import {
  Search, Plus, Utensils, Clock, ChevronDown, Check,
  BadgePercent, Loader2,
} from "lucide-react";
import type { Place, Visit, Category } from "@/types";
import { CAT, DAYS } from "@/constants";
import { gaodeJSONP } from "@/utils/poi";
import StarRow from "@/components/ui/StarRow";
import MoodPicker from "@/components/ui/MoodPicker";
import CategoryPicker from "@/components/ui/CategoryPicker";
import PlaceAvatar from "@/components/PlaceAvatar";
import DealsPanel from "@/components/DealsPanel";
import { MenuPicker } from "@/components/MenuPicker";

// ─── PlaceSearchAdd ───────────────────────────────────────────────────────────

interface PlaceSearchAddProps {
  newName: string;
  setNewName: (v: string) => void;
  suggestions: Array<{ name: string; address: string; photo?: string }>;
  suggestOpen: boolean;
  suggestLoading: boolean;
  onAddPlace: () => void;
  onAddSuggested: (item: { name: string; address: string; photo?: string }) => void;
  onFocus: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

export function PlaceSearchAdd({
  newName, setNewName, suggestions, suggestOpen, suggestLoading,
  onAddPlace, onAddSuggested, onFocus, onKeyDown, inputRef,
}: PlaceSearchAddProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none z-10" />
        <input
          ref={inputRef}
          type="text" placeholder="输入店名新增打卡点…" value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          className="pl-9 pr-4 py-2 text-sm border border-border rounded-xl bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 w-56 placeholder:text-muted-foreground/60 relative"
        />
        {suggestOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto py-1">
            {suggestLoading && suggestions.length === 0 && (
              <div className="px-3 py-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" /> 搜索中…
              </div>
            )}
            {suggestions.map((s, i) => (
              <button key={i} type="button" onClick={() => onAddSuggested(s)}
                className="w-full text-left px-3 py-2 hover:bg-secondary flex items-center gap-3 transition-colors">
                {s.photo ? (
                  <img src={s.photo} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0 bg-muted" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Utensils className="w-3.5 h-3.5 text-muted-foreground/50" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{s.address || "地址未知"}</p>
                </div>
              </button>
            ))}
            {suggestions.length === 0 && !suggestLoading && (
              <div className="px-3 py-2 text-xs text-muted-foreground">暂无推荐，按回车直接添加</div>
            )}
          </div>
        )}
      </div>
      <button onClick={onAddPlace} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center gap-1.5">
        <Plus className="w-3.5 h-3.5" /> 添加
      </button>
    </div>
  );
}

// ─── EditableField ────────────────────────────────────────────────────────────

interface EditableFieldProps {
  value: string;
  onSave: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export function EditableField({ value, onSave, placeholder, className }: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const handleBlur = () => {
    setEditing(false);
    if (draft !== value) onSave(draft);
  };

  if (!editing) {
    return (
      <p
        onClick={() => { setDraft(value); setEditing(true); }}
        className={`text-xs text-muted-foreground cursor-text hover:text-foreground transition-colors truncate max-w-[180px] ${className || ""}`}
        title={value}
      >
        {value || <span className="italic opacity-35">{placeholder || "点击添加…"}</span>}
      </p>
    );
  }

  return (
    <input
      autoFocus
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={(e) => e.key === "Enter" && handleBlur()}
      className="w-full text-xs bg-secondary border border-primary/30 rounded-lg px-2 py-1.5 focus:outline-none"
      placeholder={placeholder}
    />
  );
}

// ─── PlaceRow ─────────────────────────────────────────────────────────────────

interface PlaceRowProps {
  place: Place;
  visit: Visit;
  visitIndex: number;
  isLast: boolean;
  editingReview: string | null;
  expandedDeals: string | null;
  onMutPlace: (id: string, patch: Partial<Place>) => void;
  onMutVisit: (pid: string, vid: string, patch: Partial<Visit>) => void;
  onAddVisit: (pid: string) => void;
  onSetMenuPicker: (val: { placeId: string; category: Category } | null) => void;
  onSetEditingReview: (val: string | null) => void;
  onSetExpandedDeals: (val: string | null) => void;
}

export function PlaceRow({
  place, visit, visitIndex, isLast,
  editingReview, expandedDeals,
  onMutPlace, onMutVisit, onAddVisit,
  onSetMenuPicker, onSetEditingReview, onSetExpandedDeals,
}: PlaceRowProps) {
  const checked = visit.checkedIn;
  const cat = CAT[place.category] ?? CAT.other;

  const nowTime = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <React.Fragment>
      <tr
        className={`border-b border-border/40 transition-colors ${checked ? "bg-muted/15" : "hover:bg-secondary/25"}`}>
        {/* Date + Time */}
        <td className={`px-4 py-3 ${checked ? "opacity-35 pointer-events-none" : ""}`}>
          <div className="flex flex-col gap-1">
            <div className="relative">
              <select value={visit.date} onChange={(e) => onMutVisit(place.id, visit.id, { date: e.target.value })}
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
                onChange={(e) => onMutVisit(place.id, visit.id, { time: e.target.value })}
                className="text-xs text-muted-foreground bg-transparent border-none focus:outline-none w-20"
                style={{ fontFamily: "DM Mono, monospace" }}
              />
              <button
                type="button" title="设为当前时间"
                onClick={() => onMutVisit(place.id, visit.id, { time: nowTime() })}
                className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium leading-none">
                NOW
              </button>
            </div>
          </div>
        </td>

        {/* Place */}
        <td className={`px-4 py-3 ${checked ? "opacity-35" : ""}`}>
          <div className="flex items-center gap-3">
            <PlaceAvatar
              name={place.name}
              category={place.category}
              image={place.image}
              checked={checked}
              visitIndex={visitIndex}
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{place.name}</p>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <StarRow value={place.stars} onChange={(s) => onMutPlace(place.id, { stars: s })} disabled={checked} />
                <CategoryPicker value={place.category} onChange={(c) => onMutPlace(place.id, { category: c })} disabled={checked} />
              </div>
            </div>
          </div>
        </td>

        {/* Mood */}
        <td className={`px-4 py-3 ${checked ? "opacity-35 pointer-events-none" : ""}`}>
          <MoodPicker value={place.mood} onChange={(m) => onMutPlace(place.id, { mood: m })} disabled={checked} />
        </td>

        {/* Menu */}
        <td className={`px-4 py-3 ${checked ? "opacity-35 pointer-events-none" : ""}`}>
          <button type="button" onClick={() => !checked && onSetMenuPicker({ placeId: place.id, category: place.category })}
            className="text-left text-xs text-muted-foreground line-clamp-2 leading-relaxed hover:text-foreground transition-colors w-full">
            {place.plannedMenu || <span className="italic opacity-40">点击选择菜品…</span>}
          </button>
        </td>

        {/* Deals */}
        <td className="px-4 py-3">
          <button
            type="button"
            onClick={() => onSetExpandedDeals(expandedDeals === visit.id ? null : visit.id)}
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

        {/* Check-in */}
        <td className="px-4 py-3 text-center">
          <button type="button" onClick={() => onMutVisit(place.id, visit.id, { checkedIn: !checked })}
            title={checked ? "点击取消打卡" : "点击打卡"}
            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center mx-auto transition-all duration-200 ${checked ? "border-primary bg-primary text-primary-foreground scale-110" : "border-border hover:border-primary/60 hover:bg-primary/5"}`}>
            {checked && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
          </button>
        </td>

        {/* Spending */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground" style={{ fontFamily: "DM Mono, monospace" }}>¥</span>
            <input type="number" value={visit.spending} onChange={(e) => onMutVisit(place.id, visit.id, { spending: e.target.value })}
              placeholder="—" min="0"
              className="w-16 text-sm text-foreground bg-transparent border-none focus:outline-none placeholder:text-muted-foreground/40"
              style={{ fontFamily: "DM Mono, monospace" }} />
          </div>
        </td>

        {/* Review */}
        <td className="px-4 py-3">
          {editingReview === visit.id ? (
            <input autoFocus value={visit.review} onChange={(e) => onMutVisit(place.id, visit.id, { review: e.target.value })}
              onBlur={() => onSetEditingReview(null)} onKeyDown={(e) => e.key === "Enter" && onSetEditingReview(null)}
              className="w-full text-xs bg-secondary border border-primary/30 rounded-lg px-2 py-1.5 focus:outline-none" placeholder="写下你的感受…" />
          ) : (
            <p onClick={() => onSetEditingReview(visit.id)}
              className="text-xs text-muted-foreground cursor-text hover:text-foreground transition-colors truncate max-w-[180px]" title={visit.review}>
              {visit.review || <span className="italic opacity-35">点击添加评价…</span>}
            </p>
          )}
        </td>

        {/* Add */}
        <td className="px-4 py-3 text-center">
          {isLast && (
            <button type="button" onClick={() => onAddVisit(place.id)} title="再约一次"
              className="w-6 h-6 rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary flex items-center justify-center mx-auto transition-all">
              <Plus className="w-3 h-3" />
            </button>
          )}
        </td>
      </tr>

      {/* Expanded deals row */}
      {expandedDeals === visit.id && (
        <tr className="border-b border-border/40">
          <td colSpan={9} className="px-4" style={{ backgroundColor: "rgba(242,233,213,0.2)" }}>
            <DealsPanel
              category={place.category}
              placeName={place.name}
              onClose={() => onSetExpandedDeals(null)}
            />
          </td>
        </tr>
      )}
    </React.Fragment>
  );
}
