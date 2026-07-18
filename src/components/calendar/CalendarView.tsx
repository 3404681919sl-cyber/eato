import React, { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { DAYS, USERS } from '../../constants';

export default function CalendarView({ slots, setSlots }: { slots: Record<string, string[]>; setSlots: (s: Record<string, string[]> | ((prev: Record<string, string[]>) => Record<string, string[]>)) => void }) {
  const [currentUser, setCurrentUser] = useState("a");
  const [interval, setInterval] = useState<30 | 60>(60);

  const timeSlots = useMemo(() => {
    const result: string[] = [];
    for (let h = 10; h <= 21; h++) {
      result.push(`${h}:00`);
      if (interval === 30 && h < 21) result.push(`${h}:30`);
    }
    return result;
  }, [interval]);

  const toggle = (day: string, time: string) => {
    const key = `${day}_${time}`;
    setSlots((prev) => {
      const cur = prev[key] || [];
      const updated = cur.includes(currentUser) ? cur.filter((u) => u !== currentUser) : [...cur, currentUser];
      return { ...prev, [key]: updated };
    });
  };

  const hotSlots = useMemo(() => {
    return Object.entries(slots)
      .filter(([, users]) => users.length >= 2)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 3);
  }, [slots]);

  const cellHeight = interval === 30 ? "h-6" : "h-10";

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground leading-tight" style={{ fontFamily: "Playfair Display, serif" }}>
            约饭时间协调
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5">点击格子选择你有空的时间，颜色越深代表重叠人数越多 ✨</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl border border-border overflow-hidden text-xs">
            {([30, 60] as const).map((iv) => (
              <button key={iv} type="button" onClick={() => setInterval(iv)}
                className={`px-3 py-1.5 font-medium transition-colors ${interval === iv ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>
                {iv === 30 ? "30分钟" : "1小时"}
              </button>
            ))}
          </div>
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

      {hotSlots.length > 0 && (
        <div className="mb-5 flex gap-3 flex-wrap">
          {hotSlots.map(([key, users]) => {
            const [day, time] = key.split("_");
            return (
              <div key={key} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
                style={{ backgroundColor: "#BF4E2A12", border: "1px solid #BF4E2A30" }}>
                <span className="text-primary font-semibold">{day} {time}</span>
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

      <div className="bg-card border border-border rounded-2xl overflow-auto">
        <div className="min-w-[700px]">
          <div className="grid border-b border-border sticky top-0 bg-card z-10" style={{ gridTemplateColumns: "64px repeat(7, 1fr)" }}>
            <div className="p-3" />
            {DAYS.map((day) => (
              <div key={day} className="p-3 text-center border-l border-border">
                <p className="text-xs font-bold text-foreground">{day}</p>
              </div>
            ))}
          </div>

          {timeSlots.map((time) => (
            <div key={time} className={`grid border-b border-border/40`} style={{ gridTemplateColumns: "64px repeat(7, 1fr)" }}>
              <div className={`flex items-center justify-end pr-3 ${cellHeight}`}>
                <span className="text-[11px] text-muted-foreground leading-none" style={{ fontFamily: "DM Mono, monospace" }}>
                  {time}
                </span>
              </div>
              {DAYS.map((day) => {
                const key = `${day}_${time}`;
                const users = slots[key] || [];
                const isMine = users.includes(currentUser);
                const count = users.length;
                const cu = USERS.find((u) => u.id === currentUser)!;

                let bg = "transparent";
                let border = "transparent";
                if (count === 1) {
                  const u = USERS.find((x) => x.id === users[0])!;
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
                    className={`${cellHeight} border-l border-border/40 relative transition-all hover:opacity-80 group`}
                    style={{ backgroundColor: bg, borderTopColor: border }}>
                    {count > 0 && (
                      <div className="absolute bottom-1 left-1 flex gap-0.5 flex-wrap">
                        {users.slice(0, 3).map((uid) => {
                          const u = USERS.find((x) => x.id === uid)!;
                          return <div key={uid} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: u.color }} />;
                        })}
                      </div>
                    )}
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
