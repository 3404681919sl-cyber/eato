import React, { useState, Suspense, lazy } from "react";
import {
  Utensils, Calendar, BarChart2, MapPin,
} from "lucide-react";

import type { Tab } from "@/types";
import { USERS } from "@/constants";
import { useData } from "@/services/DataProvider";
import TableView from "@/pages/TableView";
import CalendarView from "@/pages/CalendarView";

// Recharts is heavy — load it only when the analytics tab is opened,
// keeping it out of the initial bundle.
const AnalyticsView = lazy(() => import("@/pages/AnalyticsView"));

// ─── AppShell ────────────────────────────────────────────────────────────────

export default function AppShell() {
  const [tab, setTab] = useState<Tab>("table");
  const { places, setPlaces, slots, setSlots } = useData();

  const checked = places.flatMap((p) => p.visits.filter((v) => v.checkedIn)).length;
  const total = places.flatMap((p) => p.visits).length;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "table",     label: "打卡表",    icon: <Utensils className="w-3.5 h-3.5" /> },
    { id: "calendar",  label: "约饭时间",   icon: <Calendar className="w-3.5 h-3.5" /> },
    { id: "analytics", label: "数据分析",   icon: <BarChart2 className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "DM Sans, sans-serif" }}>
      <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-6">
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-sm">
              <MapPin className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground" style={{ fontFamily: "Playfair Display, serif" }}>Eato</span>
          </div>
          <nav className="flex gap-1">
            {tabs.map((t) => (
              <button key={t.id} type="button" onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                {t.icon}{t.label}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: total > 0 ? `${(checked / total) * 100}%` : "0%" }} />
              </div>
              <span className="text-xs text-muted-foreground" style={{ fontFamily: "DM Mono, monospace" }}>{checked}/{total}</span>
            </div>
            <div className="flex -space-x-2">
              {USERS.map((u) => (
                <div key={u.id} className="w-7 h-7 rounded-full border-2 border-card flex items-center justify-center text-white text-[11px] font-bold shadow-sm"
                  style={{ backgroundColor: u.color }} title={u.name}>{u.name[0]}</div>
              ))}
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {tab === "table"     && <TableView places={places} setPlaces={setPlaces} />}
        {tab === "calendar"  && <CalendarView slots={slots} setSlots={setSlots} />}
        {tab === "analytics" && (
          <Suspense fallback={<div className="py-16 text-center text-sm text-muted-foreground">加载图表…</div>}>
            <AnalyticsView places={places} />
          </Suspense>
        )}
      </main>
    </div>
  );
}
