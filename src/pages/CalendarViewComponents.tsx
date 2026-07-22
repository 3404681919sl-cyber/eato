import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { CalendarSlots } from "@/types";
import { DAYS, USERS } from "@/constants";

// ─── CalendarHeader ───────────────────────────────────────────────────────────

interface CalendarHeaderProps {
  weekRangeText: string;
  interval: 30 | 60;
  currentUser: string;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onThisWeek: () => void;
  onSetInterval: (iv: 30 | 60) => void;
  onSetCurrentUser: (id: string) => void;
}

export function CalendarHeader({
  weekRangeText, interval, currentUser,
  onPrevWeek, onNextWeek, onThisWeek,
  onSetInterval, onSetCurrentUser,
}: CalendarHeaderProps) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground leading-tight" style={{ fontFamily: "Playfair Display, serif" }}>
          约饭时间协调
        </h2>
        <p className="text-sm text-muted-foreground mt-1.5">
          {weekRangeText} · 点击格子选择你有空的时间，颜色越深代表重叠人数越多 ✨
        </p>
      </div>
      <div className="flex items-center gap-3">
        {/* Week navigator */}
        <div className="flex items-center rounded-xl border border-border overflow-hidden text-xs">
          <button type="button" onClick={onPrevWeek} className="px-2.5 py-1.5 text-muted-foreground hover:bg-secondary transition-colors" title="上一周">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button type="button" onClick={onThisWeek} className="px-3 py-1.5 font-medium text-muted-foreground hover:bg-secondary transition-colors border-x border-border">
            今天
          </button>
          <button type="button" onClick={onNextWeek} className="px-2.5 py-1.5 text-muted-foreground hover:bg-secondary transition-colors" title="下一周">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        {/* Interval toggle */}
        <div className="flex rounded-xl border border-border overflow-hidden text-xs">
          {([30, 60] as const).map((iv) => (
            <button key={iv} type="button" onClick={() => onSetInterval(iv)}
              className={`px-3 py-1.5 font-medium transition-colors ${interval === iv ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>
              {iv === 30 ? "30分钟" : "1小时"}
            </button>
          ))}
        </div>
        {/* Current user selector */}
        <div className="flex gap-1.5">
          {USERS.map((u) => (
            <button key={u.id} type="button" onClick={() => onSetCurrentUser(u.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${currentUser === u.id ? "text-white shadow-sm" : "border-border text-muted-foreground hover:border-foreground/20"}`}
              style={currentUser === u.id ? { backgroundColor: u.color, borderColor: u.color } : {}}>
              {u.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── CalendarGrid ─────────────────────────────────────────────────────────────

interface CalendarGridProps {
  weekDays: { label: string; date: Date }[];
  timeSlots: string[];
  slots: CalendarSlots;
  currentUser: string;
  rowHeight: (time: string) => string;
  onToggle: (day: string, time: string) => void;
  formatDateShort: (d: Date) => string;
}

export function CalendarGrid({
  weekDays, timeSlots, slots, currentUser, rowHeight, onToggle, formatDateShort,
}: CalendarGridProps) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-auto">
      <div className="min-w-[700px]">
        {/* Header row */}
        <div className="grid border-b border-border sticky top-0 bg-card z-10" style={{ gridTemplateColumns: "64px repeat(7, 1fr)" }}>
          <div className="p-3" />
          {weekDays.map((day) => (
            <div key={day.label} className="p-3 text-center border-l border-border">
              <p className="text-xs font-bold text-foreground">{day.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5" style={{ fontFamily: "DM Mono, monospace" }}>
                {formatDateShort(day.date)}
              </p>
            </div>
          ))}
        </div>

        {/* Time rows */}
        {timeSlots.map((time) => (
          <div key={time} className={`grid border-b border-border/40`} style={{ gridTemplateColumns: "64px repeat(7, 1fr)" }}>
            {/* Time label */}
            <div className={`flex items-center justify-end pr-3 ${rowHeight(time)}`}>
              <span className="text-[11px] text-muted-foreground leading-none"
                style={{ fontFamily: "DM Mono, monospace" }}>
                {time}
              </span>
            </div>
            {/* Day cells */}
            {DAYS.map((day) => {
              const key = `${day}_${time}`;
              const cells = slots[key] || [];
              const isMine = cells.includes(currentUser);
              const count = cells.length;
              const cu = USERS.find((u) => u.id === currentUser)!;

              let bg = "transparent";
              let border = "transparent";
              if (count === 1) {
                const u = USERS.find((x) => x.id === cells[0])!;
                bg = u.color + "35";
                border = u.color + "60";
              } else if (count === 2) {
                bg = "#BF4E2A55";
                border = "#BF4E2A80";
              } else if (count >= 3) {
                bg = "#BF4E2A88";
                border = "#BF4E2A";
              }

              return (
                <button key={day} type="button" onClick={() => onToggle(day, time)}
                  className={`${rowHeight(time)} border-l border-border/40 relative transition-all hover:opacity-80 group`}
                  style={{ backgroundColor: bg, borderTopColor: border }}>
                  {/* User dots */}
                  {count > 0 && (
                    <div className="absolute bottom-1 left-1 flex gap-0.5 flex-wrap">
                      {cells.slice(0, 3).map((uid) => {
                        const u = USERS.find((x) => x.id === uid)!;
                        return <div key={uid} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: u.color }} />;
                      })}
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center`}
                    style={{ backgroundColor: isMine ? cu.color + "20" : cu.color + "15" }}>
                    {!isMine && <Plus className="w-3 h-3 text-foreground/30" />}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CalendarLegend ───────────────────────────────────────────────────────────

export function CalendarLegend() {
  return (
    <div className="flex items-center gap-6 mt-4 px-2">
      <p className="text-xs text-muted-foreground">图例：</p>
      {USERS.map((u) => (
        <div key={u.id} className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: u.color + "60" }} />
          <span className="text-xs text-muted-foreground">{u.name}</span>
        </div>
      ))}
      <div className="flex items-center gap-1.5 ml-auto">
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#BF4E2A88" }} />
        <span className="text-xs text-muted-foreground">3人重叠</span>
        <div className="w-3 h-3 rounded-sm ml-2" style={{ backgroundColor: "#BF4E2A55" }} />
        <span className="text-xs text-muted-foreground">2人重叠</span>
      </div>
    </div>
  );
}
