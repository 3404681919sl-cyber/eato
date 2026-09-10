import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { CalendarPlus, List } from "lucide-react";

import CreateMealEventView from "@/pages/CreateMealEventView";
import MealWorkspaceView from "@/pages/MealWorkspaceView";
import DashboardPage from "@/pages/DashboardPage";
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
import { useDeveloperMode } from "@/services/developerMode";
import { useData } from "@/services/DataProvider";

// ─── AppShell ────────────────────────────────────────────────────────────────

const TableView = lazy(() => import("@/pages/TableView"));
const CalendarView = lazy(() => import("@/pages/CalendarView"));
const AnalyticsView = lazy(() => import("@/pages/AnalyticsView"));

type DevLabTab = "table" | "calendar" | "analytics";

export default function AppShell() {
  const { developerMode, setDeveloperMode } = useDeveloperMode();
  const { places, setPlaces, slots, setSlots } = useData();
  const [showDevLab, setShowDevLab] = useState(false);
  const [devLabTab, setDevLabTab] = useState<DevLabTab | null>(null);
  const [showMealCreator, setShowMealCreator] = useState(false);
  const [showMealWorkspace, setShowMealWorkspace] = useState(false);
  const [workspaceEventId, setWorkspaceEventId] = useState<string>();
  const [workspaceVersion, setWorkspaceVersion] = useState(0);
  const localMealEventRepository = useMemo(() => new LocalMealEventRepository(), []);
  const [mealEventRepository, setMealEventRepository] = useState<MealEventRepository>(localMealEventRepository);
  const [mealRealtimeSync, setMealRealtimeSync] = useState<MealRealtimeSync | null>(null);
  const [mealInviteRepository, setMealInviteRepository] = useState<MealInviteRepository | null>(null);
  const [mealStoreMode, setMealStoreMode] = useState<"local" | "cloud" | "loading" | "error">("local");
  const [mealStoreError, setMealStoreError] = useState("");
  const [inviteAppUrl, setInviteAppUrl] = useState(() => currentInviteUrl());
  const identityService = useMemo(() => new IdentityService(loadSupabaseAuthPort), []);
  const identity = useIdentity(identityService);

  useEffect(() => {
    let active = true;
    const isCloudReady = identity.mode === "cloud-guest" && identity.status === "ready";

    if (isCloudReady) {
      setMealStoreMode("loading");
      setMealStoreError("");
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
    }

    if (developerMode) {
      // Dev Mode may use the local simulation as a usable product (no cloud session).
      // Local simulation is NEVER presented to normal users — see canShowProductUI below.
      setMealEventRepository(localMealEventRepository);
      setMealRealtimeSync(null);
      setMealInviteRepository(null);
      setMealStoreMode("local");
      setMealStoreError("");
      return () => { active = false; };
    }

    if (identity.status === "loading") {
      // Identity still initializing — wait. Never auto-fall back to local simulation for normal users.
      setMealEventRepository(localMealEventRepository);
      setMealRealtimeSync(null);
      setMealInviteRepository(null);
      setMealStoreMode("loading");
      setMealStoreError("");
      return () => { active = false; };
    }

    // Normal user without a cloud session: show a natural "temporarily unavailable" notice.
    // Do NOT present local simulation as a normal product experience.
    setMealEventRepository(localMealEventRepository);
    setMealRealtimeSync(null);
    setMealInviteRepository(null);
    setMealStoreMode("error");
    setMealStoreError(
      identity.mode === "local-simulation" && identity.status === "unconfigured"
        ? "云端饭局暂未开放"
        : "云端饭局暂不可用，请稍后重试",
    );
    return () => { active = false; };
  }, [identity.mode, identity.status, developerMode, localMealEventRepository]);

  // Normal users may only ever see the cloud product (or a waiting/unavailable notice).
  // The local simulation is gated behind Developer Mode, so a normal user never briefly
  // sees a local Dashboard / Create / Workspace during loading or error transitions.
  const canShowProductUI = mealStoreMode === "cloud" || (mealStoreMode === "local" && developerMode);

  const shouldShowInviteJoin = Boolean(inviteAppUrl && mealStoreMode === "cloud" && mealInviteRepository);

  const openJoinedMeal = (eventId: string) => {
    clearInviteFragment();
    setInviteAppUrl(null);
    setWorkspaceEventId(eventId);
    setWorkspaceVersion((current) => current + 1);
    setShowMealCreator(false);
    setShowMealWorkspace(true);
  };

  const openDashboard = () => {
    setShowMealCreator(false);
    setShowMealWorkspace(false);
  };

  const openEvent = (eventId: string) => {
    setWorkspaceEventId(eventId);
    setWorkspaceVersion((current) => current + 1);
    setShowMealWorkspace(true);
  };

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "DM Sans, sans-serif" }}>
      <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:gap-4 sm:px-6">
          <div className="flex flex-shrink-0 items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground" style={{ fontFamily: "Playfair Display, serif" }}>E</div>
            <span className="text-lg font-bold text-foreground" style={{ fontFamily: "Playfair Display, serif" }}>Eato</span>
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {developerMode && (
              <span role="status" aria-label={identity.status === "loading" ? "正在准备会话" : identity.mode === "cloud-guest" ? "云端访客" : "本地模拟"} className={`hidden rounded-full px-2.5 py-1 text-xs font-semibold sm:inline-flex ${identity.mode === "cloud-guest" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
                {identity.status === "loading" ? "正在准备会话" : identity.mode === "cloud-guest" ? "云端访客" : "本地模拟"}
              </span>
            )}
            <button
              type="button"
              aria-label="我的饭局"
              disabled={!canShowProductUI}
              onClick={openDashboard}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-border px-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-45"
            >
              <List className="h-4 w-4" aria-hidden="true" />
              <span className="ml-1.5 hidden sm:inline">我的饭局</span>
            </button>
            <button
              type="button"
              aria-label="发起饭局"
              disabled={!canShowProductUI}
              onClick={() => { setShowMealCreator(true); setShowMealWorkspace(false); }}
              className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-55"
            >
              <CalendarPlus className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">发起饭局</span>
            </button>
            {developerMode && (
              <>
                <button
                  type="button"
                  aria-label="开发者模式"
                  aria-pressed={developerMode}
                  onClick={() => { setDeveloperMode(false); setShowDevLab(false); setDevLabTab(null); }}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-amber-300 bg-amber-50 px-3 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100"
                >
                  开发者模式
                </button>
                <button
                  type="button"
                  aria-label="Dev Lab"
                  onClick={() => { setShowDevLab(true); setDevLabTab((current) => current ?? "table"); }}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-border px-3 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary"
                >
                  Dev Lab
                </button>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {mealStoreError && <p className="mb-4 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">{mealStoreError}</p>}
        {mealStoreMode === "loading" && <p className="py-14 text-center text-sm text-muted-foreground" role="status">正在准备会话…</p>}
        {shouldShowInviteJoin && inviteAppUrl && mealInviteRepository && <MealInviteJoinPanel appUrl={inviteAppUrl} repository={mealInviteRepository} onJoined={openJoinedMeal} />}
        {canShowProductUI && showMealCreator && !shouldShowInviteJoin && <CreateMealEventView developerMode={developerMode} repository={mealEventRepository} mode={mealStoreMode === "cloud" ? "cloud" : "local"} cloudCreatorId={mealStoreMode === "cloud" ? identity.userId ?? undefined : undefined} onCreated={(event) => { setWorkspaceEventId(event.id); setShowMealCreator(false); setShowMealWorkspace(true); }} />}
        {canShowProductUI && showMealWorkspace && !shouldShowInviteJoin && <MealWorkspaceView key={workspaceVersion} developerMode={developerMode} repository={mealEventRepository} realtimeSync={mealStoreMode === "cloud" ? mealRealtimeSync ?? undefined : undefined} mode={mealStoreMode === "cloud" ? "cloud" : "local"} initialEventId={workspaceEventId} cloudUserId={mealStoreMode === "cloud" ? identity.userId ?? undefined : undefined} inviteRepository={mealStoreMode === "cloud" ? mealInviteRepository ?? undefined : undefined} inviteAppUrl={currentAppUrl()} onCreate={openDashboard} />}
        {canShowProductUI && !showMealCreator && !showMealWorkspace && !shouldShowInviteJoin && (
          <DashboardPage
            repository={mealEventRepository}
            onOpenEvent={openEvent}
            onCreateEvent={() => { setShowMealCreator(true); setShowMealWorkspace(false); }}
          />
        )}

        {developerMode && <DevDebugPanel
          identityMode={identity.mode}
          identityStatus={identity.status}
          userId={identity.userId}
          storeMode={mealStoreMode}
          eventId={workspaceEventId}
          realtimeAvailable={mealStoreMode === "cloud" && mealRealtimeSync !== null}
        />}

        {developerMode && showDevLab && devLabTab && (
          <section className="mt-8 rounded-2xl border border-dashed border-amber-300 bg-amber-50/40 p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-amber-700">Dev Lab（ dead-code 页面，仅开发者可见）</span>
              <div className="ml-auto flex gap-2">
                {([["table", "表格视图"], ["calendar", "日历视图"], ["analytics", "分析视图"]] as const).map(([tab, label]) => (
                  <button key={tab} type="button" aria-label={label} onClick={() => setDevLabTab(tab)} className={`min-h-9 rounded-lg px-3 text-xs font-medium ${devLabTab === tab ? "bg-amber-600 text-white" : "border border-amber-300 text-amber-700 hover:bg-amber-100"}`}>{label}</button>
                ))}
                <button type="button" aria-label="关闭 Dev Lab" onClick={() => setShowDevLab(false)} className="min-h-9 rounded-lg border border-border px-3 text-xs font-medium text-muted-foreground hover:bg-secondary">关闭</button>
              </div>
            </div>
            <Suspense fallback={<p className="py-8 text-center text-sm text-muted-foreground">加载中…</p>}>
              {devLabTab === "table" && <TableView places={places} setPlaces={setPlaces} />}
              {devLabTab === "calendar" && <CalendarView slots={slots} setSlots={setSlots} />}
              {devLabTab === "analytics" && <AnalyticsView places={places} />}
            </Suspense>
          </section>
        )}
      </main>
    </div>
  );
}

function DevDebugPanel({ identityMode, identityStatus, userId, storeMode, eventId, realtimeAvailable }: {
  identityMode: string;
  identityStatus: string;
  userId?: string | null;
  storeMode: "local" | "cloud" | "loading" | "error";
  eventId?: string;
  realtimeAvailable: boolean;
}) {
  const truncate = (value?: string | null) => (value && value.length > 8 ? `${value.slice(0, 8)}…` : value ?? "—");
  return (
    <section className="mt-6 rounded-2xl border border-dashed border-amber-300 bg-amber-50/40 p-4 text-xs" aria-label="开发者调试面板">
      <p className="mb-2 font-semibold text-amber-700">Debug Panel（开发者可见，仅展示既有数据，不含任何密钥 / token / 凭证）</p>
      <dl className="grid gap-1.5 text-muted-foreground sm:grid-cols-3">
        <div><dt className="inline font-medium text-foreground">Identity: </dt><dd className="inline">{identityMode} · {identityStatus} · uid {truncate(userId)}</dd></div>
        <div><dt className="inline font-medium text-foreground">Meal Store: </dt><dd className="inline">{storeMode} · event {truncate(eventId)}</dd></div>
        <div><dt className="inline font-medium text-foreground">Realtime: </dt><dd className="inline">{realtimeAvailable ? "可用" : "不可用"}</dd></div>
      </dl>
    </section>
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
