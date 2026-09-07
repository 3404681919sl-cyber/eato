import React, { useEffect, useMemo, useState, Suspense, lazy } from "react";
import {
  Utensils, Calendar, BarChart2, CalendarPlus, List, MapPin,
} from "lucide-react";

import type { Tab } from "@/types";
import { USERS } from "@/constants";
import { useData } from "@/services/DataProvider";
import TableView from "@/pages/TableView";
import CalendarView from "@/pages/CalendarView";
import CreateMealEventView from "@/pages/CreateMealEventView";
import MealWorkspaceView from "@/pages/MealWorkspaceView";
import { LocalMealEventRepository } from "@/services/localMealEventRepository";
import type { MealEventRepository } from "@/services/mealEventRepository";
import { CloudMealEventRepository } from "@/services/cloudMealEventRepository";
import { loadSupabaseMealEventDataPort } from "@/services/supabaseMealEventDataPort";
import { MealRealtimeSync } from "@/services/mealRealtimeSync";
import { loadSupabaseMealRealtimePort } from "@/services/supabaseMealRealtimePort";
import { IdentityService } from "@/services/identityService";
import { loadSupabaseAuthPort } from "@/services/supabaseClient";
import { useIdentity } from "@/hooks/useIdentity";
import { loadSupabaseMealInvitePort } from "@/services/supabaseMealInvitePort";
import { MealInviteRepository } from "@/services/mealInviteRepository";
import { parseMealInviteToken } from "@/services/mealInviteService";
import MealInviteJoinPanel from "@/components/meal/MealInviteJoinPanel";

// Recharts is heavy — load it only when the analytics tab is opened,
// keeping it out of the initial bundle.
const AnalyticsView = lazy(() => import("@/pages/AnalyticsView"));

// ─── AppShell ────────────────────────────────────────────────────────────────

export default function AppShell() {
  const [tab, setTab] = useState<Tab>("table");
  const [showMealCreator, setShowMealCreator] = useState(false);
  const [showMealWorkspace, setShowMealWorkspace] = useState(false);
  const [workspaceEventId, setWorkspaceEventId] = useState<string>();
  const { places, setPlaces, slots, setSlots } = useData();
  const localMealEventRepository = useMemo(() => new LocalMealEventRepository(), []);
  const [mealEventRepository, setMealEventRepository] = useState<MealEventRepository>(localMealEventRepository);
  const [mealRealtimeSync, setMealRealtimeSync] = useState<MealRealtimeSync | null>(null);
  const [mealInviteRepository, setMealInviteRepository] = useState<MealInviteRepository | null>(null);
  const [mealStoreMode, setMealStoreMode] = useState<"local" | "cloud" | "loading" | "error">("local");
  const [mealStoreError, setMealStoreError] = useState("");
  const [inviteAppUrl, setInviteAppUrl] = useState(() => currentInviteUrl());
  const [workspaceVersion, setWorkspaceVersion] = useState(0);
  const identityService = useMemo(() => new IdentityService(loadSupabaseAuthPort), []);
  const identity = useIdentity(identityService);

  useEffect(() => {
    let active = true;
    if (identity.mode !== "cloud-guest" || identity.status !== "ready") {
      setMealEventRepository(localMealEventRepository);
      setMealRealtimeSync(null);
      setMealInviteRepository(null);
      setMealStoreMode("local");
      setMealStoreError("");
      return () => { active = false; };
    }

    setMealStoreMode("loading");
    setMealStoreError("");
    setMealRealtimeSync(null);
    setMealInviteRepository(null);
    void Promise.all([loadSupabaseMealEventDataPort(), loadSupabaseMealRealtimePort(), loadSupabaseMealInvitePort()]).then(([dataPort, realtimePort, invitePort]) => {
      if (!active) return;
      if (!dataPort) {
        setMealStoreMode("error");
        setMealStoreError("云端饭局配置不完整");
        return;
      }
      setMealEventRepository(new CloudMealEventRepository(dataPort));
      setMealRealtimeSync(realtimePort ? new MealRealtimeSync(realtimePort) : null);
      setMealInviteRepository(invitePort ? new MealInviteRepository(invitePort) : null);
      setMealStoreMode("cloud");
    }).catch(() => {
      if (!active) return;
      setMealStoreMode("error");
      setMealStoreError("云端饭局服务暂不可用，请稍后重试");
    });

    return () => { active = false; };
  }, [identity.mode, identity.status, localMealEventRepository]);

  const checked = places.flatMap((p) => p.visits.filter((v) => v.checkedIn)).length;
  const total = places.flatMap((p) => p.visits).length;
  const shouldShowInviteJoin = Boolean(inviteAppUrl && mealStoreMode === "cloud" && mealInviteRepository);

  const openJoinedMeal = (eventId: string) => {
    clearInviteFragment();
    setInviteAppUrl(null);
    setWorkspaceEventId(eventId);
    setWorkspaceVersion((current) => current + 1);
    setShowMealCreator(false);
    setShowMealWorkspace(true);
  };

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
              <button key={t.id} type="button" onClick={() => { setTab(t.id); setShowMealCreator(false); setShowMealWorkspace(false); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                {t.icon}{t.label}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-4">
            <span role="status" aria-label={identity.status === "loading" ? "正在准备会话" : identity.mode === "cloud-guest" ? "云端访客" : "本地模拟"} className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${identity.mode === "cloud-guest" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
              {identity.status === "loading" ? "正在准备会话" : identity.mode === "cloud-guest" ? "云端访客" : "本地模拟"}
            </span>
            <button type="button" aria-label="我的饭局" disabled={mealStoreMode === "loading" || mealStoreMode === "error"} onClick={() => { setShowMealWorkspace(true); setShowMealCreator(false); }} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-border px-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-45">
              <List className="w-4 h-4" aria-hidden="true" />
              <span className="ml-1.5 hidden sm:inline">我的饭局</span>
            </button>
            <button
              type="button"
              aria-label="发起饭局"
              disabled={mealStoreMode === "loading" || mealStoreMode === "error"}
              onClick={() => { setShowMealCreator(true); setShowMealWorkspace(false); }}
              className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-55"
            >
              <CalendarPlus className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">发起饭局</span>
            </button>
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
        {mealStoreError && <p className="mb-4 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">{mealStoreError}</p>}
        {shouldShowInviteJoin && inviteAppUrl && mealInviteRepository && <MealInviteJoinPanel appUrl={inviteAppUrl} repository={mealInviteRepository} onJoined={openJoinedMeal} />}
        {showMealCreator && !shouldShowInviteJoin && <CreateMealEventView repository={mealEventRepository} mode={mealStoreMode === "cloud" ? "cloud" : "local"} cloudCreatorId={mealStoreMode === "cloud" ? identity.userId ?? undefined : undefined} onCreated={(event) => { setWorkspaceEventId(event.id); setShowMealCreator(false); setShowMealWorkspace(true); }} />}
        {showMealWorkspace && !shouldShowInviteJoin && <MealWorkspaceView key={workspaceVersion} repository={mealEventRepository} realtimeSync={mealStoreMode === "cloud" ? mealRealtimeSync ?? undefined : undefined} mode={mealStoreMode === "cloud" ? "cloud" : "local"} initialEventId={workspaceEventId} cloudUserId={mealStoreMode === "cloud" ? identity.userId ?? undefined : undefined} inviteRepository={mealStoreMode === "cloud" ? mealInviteRepository ?? undefined : undefined} inviteAppUrl={currentAppUrl()} onCreate={() => { setShowMealCreator(true); setShowMealWorkspace(false); }} />}
        {!showMealCreator && !showMealWorkspace && !shouldShowInviteJoin && tab === "table"     && <TableView places={places} setPlaces={setPlaces} />}
        {!showMealCreator && !showMealWorkspace && !shouldShowInviteJoin && tab === "calendar"  && <CalendarView slots={slots} setSlots={setSlots} />}
        {!showMealCreator && !showMealWorkspace && !shouldShowInviteJoin && tab === "analytics" && (
          <Suspense fallback={<div className="py-16 text-center text-sm text-muted-foreground">加载图表…</div>}>
            <AnalyticsView places={places} />
          </Suspense>
        )}
      </main>
    </div>
  );
}

function currentInviteUrl(): string | null {
  if (typeof window === "undefined") return null;
  return parseMealInviteToken(window.location.href) ? window.location.href : null;
}

function currentAppUrl(): string {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.href);
  url.hash = "";
  return url.toString();
}

function clearInviteFragment(): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.hash = "";
  window.history.replaceState(null, "", `${url.pathname}${url.search}`);
}
