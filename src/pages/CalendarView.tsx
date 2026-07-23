import React, { useState, useMemo } from "react";
import {
  ChevronLeft, ChevronRight, Plus,
} from "lucide-react";
import type { CalendarSlots } from "@/types";
import { DAYS, USERS } from "@/constants";

interface CalendarViewProps {
  slots: CalendarSlots;
  setSlots: React.Dispatch<React.SetStateAction<CalendarSlots>>;
}

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDateLabel(d: Date): string {
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

function formatDateShort(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function CalendarView({ slots, setSlots }: CalendarViewProps) {
  const [currentUser, setCurrentUser] = useState("a");
  const [interval, setInterval] = useState<30 | 60>(60);
  const [weekStart, setWeekStart] = useState<Date>(() => getMonday(new Date()));

  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      days.push({ label: DAYS[i], date: d });
    }
    return days;
  }, [weekStart]);

  const weekRangeText = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(weekStart.getDate() + 6);
    const sameMonth = weekStart.getMonth() === end.getMonth();
    return `${weekStart.getFullYear()}年${weekStart.getMonth() + 1}月${weekStart.getDate()}日 - ${sameMonth ? "" : end.getMonth() + 1 + "月"}${end.getDate()}日`;
  }, [weekStart]);

  const timeSlots = useMemo(() => {
    const result: string[] = [];
    for (let h = 0; h < 24; h++) {
      result.push(`${h}:00`);
      if (interval === 30) result.push(`${h}:30`);
    }
    return result;
  }, [interval]);

  const hourHasSelection = useMemo(() => {
    const set = new Set<number>();
    Object.entries(slots).forEach(([key, users]) => {
      if (!users || users.length === 0) return;
      const time = key.split("_")[1];
      if (!time) return;
      const h = parseInt(time.split(":")[0], 10);
      if (!Number.isNaN(h)) set.add(h);
    });
    return set;
  }, [slots]);

  const rowHeight = (time: string) => {
    const h = parseInt(time.split(":")[0], 10);
    const selected = hourHasSelection.has(h);
    const active = h >= 7;
    if (active || selected) return interval === 30 ? "h-6" : "h-10";
    return "h-4";
  };

  const toggle = (day: string, time: string) => {
    const key = `${day}_${time}`;
    setSlots((prev) => {
      const cur = prev[key] || [];
      const updated = cur.includes(currentUser) ? cur.filter((u) => u !== currentUser) : [...cur, currentUser];
      return { ...prev, [key]: updated };
    });
  };

  // Find best overlap slots
  const hotSlots = useMemo(() => {
    return Object.entries(slots)
      .filter(([, users]) => users.length >= 2)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 3);
  }, [slots]);

  const goPrevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };
  const goNextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };
  const goThisWeek = () => setWeekStart(getMonday(new Date()));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground leading-tight" style={{ fontFamily: "Playfair Display, serif" }}>
            约饭时间协调
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5">
            {weekRangeText} · 点击格子选择你有空的时间，颜色越深代表重叠人数越多 ✨
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Week navigator */}
          <div className="flex items-center rounded-xl border border-border overflow-hidden text-xs">
            <button type="button" onClick={goPrevWeek} className="px-2.5 py-1.5 text-muted-foreground hover:bg-secondary transition-colors" title="上一周">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button type="button" onClick={goThisWeek} className="px-3 py-1.5 font-medium text-muted-foreground hover:bg-secondary transition-colors border-x border-border">
              今天
            </button>
            <button type="button" onClick={goNextWeek} className="px-2.5 py-1.5 text-muted-foreground hover:bg-secondary transition-colors" title="下一周">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {/* Interval toggle */}
          <div className="flex rounded-xl border border-border overflow-hidden text-xs">
            {([30, 60] as const).map((iv) => (
              <button key={iv} type="button" onClick={() => setInterval(iv)}
                className={`px-3 py-1.5 font-medium transition-colors ${interval === iv ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>
                {iv === 30 ? "30分钟" : "1小时"}
              </button>
            ))}
          </div>
          {/* Current user selector */}
          <div className="flex gap-1.5">
            {USERS.map((u) => (
              <button key={u.id} type="button" onClick={() => setCurrentUser(u.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${currentUser === u.id ? "text-white shadow-sm" : "border-border text-muted-foreground hover:border-foreground/20"}`}
                style={currentUser === u.id ? { backgroundColor: u.color, borderColor: u.color } : {}}>
                {u.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hot slots banner */}
      {hotSlots.length > 0 && (
        <div className="mb-5 flex gap-3 flex-wrap">
          {hotSlots.map(([key, users]) => {
            const [day, time] = key.split("_");
            const dayIndex = DAYS.indexOf(day as typeof DAYS[number]);
            const date = dayIndex >= 0 ? weekDays[dayIndex] : null;
            return (
              <div key={key} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
                style={{ backgroundColor: "#BF4E2A12", border: "1px solid #BF4E2A30" }}>
                <span className="text-primary font-semibold">
                  {date ? formatDateLabel(date.date) : day} {day} {time}
                </span>
                <div className="flex gap-0.5">
                  {users.map((uid) => {
                    const u = USERS.find((x) => x.id === uid)!;
                    return <div key={uid} className="w-5 h-5 rounded-full border-2 border-card flex items-center justify-center text-white text-[9px] font-bold"
                      style={{ backgroundColor: u.color }}>{u.name[0]}</div>;
                  })}
                </div>
                <span className="text-xs text-muted-foreground">{users.length}人可</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Calendar grid */}
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
                  <button key={day} type="button" onClick={() => toggle(day, time)}
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

      {/* Legend */}
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
    </div>
  );
}
