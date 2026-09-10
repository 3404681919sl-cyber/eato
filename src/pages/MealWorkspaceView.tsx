import { useEffect, useState } from "react";
import { Users } from "lucide-react";

import type { MealEvent, MealStatus } from "@/domain/meal";
import type { MealEventRepository } from "@/services/mealEventRepository";
import type { MealRealtimeSync } from "@/services/mealRealtimeSync";
import { rankMealOptions } from "@/domain/decisionEngine";
import MealCollectionPanel from "@/components/meal/MealCollectionPanel";
import DecisionOptionsPanel from "@/components/meal/DecisionOptionsPanel";
import MealHistoryPanel from "@/components/meal/MealHistoryPanel";
import MealInvitePanel from "@/components/meal/MealInvitePanel";
import MealConsensus from "@/components/meal/MealConsensus";

type MealWorkspaceViewProps = {
  repository: MealEventRepository;
  realtimeSync?: MealRealtimeSync;
  mode?: "local" | "cloud";
  initialEventId?: string;
  onCreate?: () => void;
  cloudUserId?: string;
  developerMode?: boolean;
  inviteRepository?: {
    createShareUrl(eventId: string, appUrl: string): Promise<string>;
  };
  inviteAppUrl?: string;
};

const STEP_LABELS = ["收集信息", "共同决定", "已确认"];

function currentStepIndex(status: MealStatus): number {
  if (status === "collecting") return 0;
  if (status === "deciding") return 1;
  if (status === "confirmed" || status === "completed") return 2;
  return 0;
}

export default function MealWorkspaceView({ repository, realtimeSync, mode = "local", initialEventId, onCreate, cloudUserId, developerMode = false, inviteRepository, inviteAppUrl }: MealWorkspaceViewProps) {
  const [events, setEvents] = useState<MealEvent[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const selectedEvent = events.find((event) => event.id === selectedId) ?? null;
  const [saveError, setSaveError] = useState("");
  const [realtimeError, setRealtimeError] = useState("");
  const [isRealtimeRefreshing, setIsRealtimeRefreshing] = useState(false);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setLoadError("");

    void repository.list().then((loadedEvents) => {
      if (!active) return;
      const sortedEvents = sortEvents(loadedEvents);
      setEvents(sortedEvents);
      setSelectedId((current) => (
        sortedEvents.some((event) => event.id === current) ? current
          : sortedEvents.some((event) => event.id === initialEventId) ? initialEventId
            : sortedEvents[0]?.id
      ));
    }).catch(() => {
      if (active) setLoadError("本地饭局加载失败，请稍后重试");
    }).finally(() => {
      if (active) setIsLoading(false);
    });

    return () => { active = false; };
  }, [initialEventId, repository]);

  useEffect(() => {
    if (!realtimeSync) {
      setIsRealtimeRefreshing(false);
      return;
    }

    let active = true;
    let pendingRefreshes = 0;
    const refreshVersions = new Map<string, number>();
    return realtimeSync.subscribe((eventId) => {
      const version = (refreshVersions.get(eventId) ?? 0) + 1;
      refreshVersions.set(eventId, version);
      pendingRefreshes += 1;
      setIsRealtimeRefreshing(true);
      void repository.getById(eventId).then((refreshedEvent) => {
        if (!active || !refreshedEvent || refreshVersions.get(eventId) !== version) return;
        setEvents((current) => sortEvents(current.map((event) => event.id === refreshedEvent.id ? refreshedEvent : event)));
        setRealtimeError("");
      }).catch(() => {
        if (active && refreshVersions.get(eventId) === version) setRealtimeError("云端饭局同步暂时不可用，请稍后重试");
      }).finally(() => {
        pendingRefreshes -= 1;
        if (active && pendingRefreshes === 0) setIsRealtimeRefreshing(false);
      });
    }, () => {
      if (active) setRealtimeError("云端饭局同步暂时不可用，请稍后重试");
    });
  }, [realtimeSync, repository]);

  const saveEvent = async (nextEvent: MealEvent) => {
    try {
      const savedEvent = await repository.save(nextEvent);
      setEvents((current) => sortEvents(current.map((event) => event.id === savedEvent.id ? savedEvent : event)));
      setSaveError("");
    } catch {
      setSaveError("本地保存失败，请稍后重试");
    }
  };

  if (isLoading) {
    return <p className="py-14 text-center text-sm text-muted-foreground" role="status">正在加载饭局…</p>;
  }

  if (loadError) {
    return <p className="rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">{loadError}</p>;
  }

  if (!selectedEvent) {
    return (
      <section className="mx-auto max-w-2xl rounded-2xl border border-border bg-card px-6 py-14 text-center shadow-sm">
        <Users className="mx-auto h-9 w-9 text-muted-foreground/45" aria-hidden="true" />
        <h2 className="mt-4 text-2xl font-bold text-foreground" style={{ fontFamily: "Playfair Display, serif" }}>还没有饭局</h2>
        <p className="mt-2 text-sm text-muted-foreground">先发起一场饭局，再邀请朋友一起填时间和偏好。</p>
        {onCreate && (
          <button type="button" onClick={onCreate} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
            发起第一场饭局
          </button>
        )}
      </section>
    );
  }

  const event = selectedEvent;
  const isPreConfirmed = event.status === "collecting" || event.status === "deciding";
  const isCreator = cloudUserId ? event.creatorId === cloudUserId : true;
  const total = event.participants.length;
  const meta = [
    `${total} 人`,
    `人均 ¥${event.budget.min}–${event.budget.max}`,
    event.city ? event.city : "",
    event.area ? event.area : "",
  ].filter(Boolean).join(" · ");
  const stepIndex = currentStepIndex(event.status);

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      {/* Top bar */}
      <header className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl" style={{ fontFamily: "Playfair Display, serif" }}>{event.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{meta}</p>
          </div>
          {isPreConfirmed && (
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${mode === "cloud" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
              {mode === "cloud" ? "邀请朋友一起填写" : "先自己试试"}
            </span>
          )}
        </div>
        {/* Stepper */}
        <ol className="mt-4 flex items-center gap-1 text-xs">
          {STEP_LABELS.map((label, index) => {
            const reached = index <= stepIndex;
            return (
              <li key={`${label}-${index}`} className="flex flex-1 items-center gap-1">
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${reached ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{index < stepIndex ? "✓" : index + 1}</span>
                <span className={reached ? "font-semibold text-foreground" : "text-muted-foreground"}>{label}</span>
                {index < STEP_LABELS.length - 1 && <span className={`mx-1 h-px flex-1 ${index < stepIndex ? "bg-primary" : "bg-border"}`} />}
              </li>
            );
          })}
        </ol>
        {developerMode && isRealtimeRefreshing && <p className="mt-3 text-sm text-muted-foreground" role="status" aria-label="正在同步云端饭局">正在同步云端饭局…</p>}
      </header>

      {realtimeError && <p className="rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">{realtimeError}</p>}
      {saveError && <p className="rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">{saveError}</p>}

      {/* Invite priority (creator, cloud) — only before confirmation */}
      {isPreConfirmed && mode === "cloud" && cloudUserId && inviteRepository && inviteAppUrl && isCreator && (
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
          <p className="text-sm font-semibold text-foreground">已加入 {event.participants.length} 人（含你）</p>
          <p className="mt-0.5 text-xs text-muted-foreground">把邀请链接发给朋友，让他们填时间和偏好。</p>
          <div className="mt-3">
            <MealInvitePanel
              eventId={event.id}
              isCreator={isCreator}
              repository={inviteRepository}
              appUrl={inviteAppUrl}
            />
          </div>
        </div>
      )}

      {(event.status === "collecting" || event.status === "deciding") && (
        <MealCollectionPanel event={event} onSave={saveEvent} currentUserId={mode === "cloud" ? cloudUserId : undefined} />
      )}
      {isPreConfirmed && <MealConsensus event={event} />}
      {(event.status === "collecting" || event.status === "deciding") && <DecisionOptionsPanel event={event} onSave={saveEvent} currentUserId={mode === "cloud" ? cloudUserId : undefined} />}
      <MealHistoryPanel event={event} onSave={saveEvent} developerMode={developerMode} currentUserId={mode === "cloud" ? cloudUserId : undefined} />

      {developerMode && <WorkspaceDebugPanel event={event} />}
    </section>
  );
}

function sortEvents(events: MealEvent[]): MealEvent[] {
  return [...events].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

function WorkspaceDebugPanel({ event }: { event: MealEvent }) {
  const truncate = (value?: string) => (value && value.length > 8 ? `${value.slice(0, 8)}…` : value ?? "—");
  const options = event.status === "deciding" ? rankMealOptions(event) : [];
  return (
    <section className="mt-6 rounded-2xl border border-dashed border-amber-300 bg-amber-50/40 p-4 text-xs" aria-label="饭局调试面板">
      <p className="mb-2 font-semibold text-amber-700">饭局 Debug（开发者可见，仅既有数据）</p>
      <dl className="grid gap-1.5 text-muted-foreground sm:grid-cols-2">
        <div><dt className="inline font-medium text-foreground">Status: </dt><dd className="inline">{event.status}</dd></div>
        <div><dt className="inline font-medium text-foreground">Event id: </dt><dd className="inline">{truncate(event.id)}</dd></div>
      </dl>
      {options.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 font-medium text-foreground">Decision Engine 评分（仅决策中展示）</p>
          <div className="space-y-2">
            {options.map((option) => (
              <div key={`${option.candidateId}-${option.date}-${option.mealPeriod}`} className="rounded-lg border border-amber-200 bg-white/60 px-3 py-2">
                <p className="font-medium text-foreground">方案 · 总分 {option.totalScore}</p>
                <p className="mt-0.5 text-muted-foreground">
                  time {option.scoreBreakdown.time} · cuisine {option.scoreBreakdown.cuisine} · budget {option.scoreBreakdown.budget} · distance {option.scoreBreakdown.distance} · freshness {option.scoreBreakdown.freshness}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
