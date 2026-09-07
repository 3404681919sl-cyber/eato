import { useEffect, useState } from "react";
import { Plus, Users } from "lucide-react";

import type { MealEvent } from "@/domain/meal";
import type { MealEventRepository } from "@/services/mealEventRepository";
import type { MealRealtimeSync } from "@/services/mealRealtimeSync";
import MealEventList from "@/components/meal/MealEventList";
import MealCollectionPanel from "@/components/meal/MealCollectionPanel";
import DecisionOptionsPanel from "@/components/meal/DecisionOptionsPanel";
import MealHistoryPanel from "@/components/meal/MealHistoryPanel";
import MealInvitePanel from "@/components/meal/MealInvitePanel";

type MealWorkspaceViewProps = {
  repository: MealEventRepository;
  realtimeSync?: MealRealtimeSync;
  mode?: "local" | "cloud";
  initialEventId?: string;
  onCreate?: () => void;
  cloudUserId?: string;
  inviteRepository?: {
    createShareUrl(eventId: string, appUrl: string): Promise<string>;
  };
  inviteAppUrl?: string;
};

export default function MealWorkspaceView({ repository, realtimeSync, mode = "local", initialEventId, onCreate, cloudUserId, inviteRepository, inviteAppUrl }: MealWorkspaceViewProps) {
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
    return <p className="py-14 text-center text-sm text-muted-foreground" role="status">正在加载本地饭局…</p>;
  }

  if (loadError) {
    return <p className="rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">{loadError}</p>;
  }

  if (!selectedEvent) {
    return (
      <section className="mx-auto max-w-2xl rounded-2xl border border-border bg-card px-6 py-14 text-center shadow-sm">
        <Users className="mx-auto h-9 w-9 text-muted-foreground/45" aria-hidden="true" />
        <h2 className="mt-4 text-2xl font-bold text-foreground" style={{ fontFamily: "Playfair Display, serif" }}>还没有饭局</h2>
        <p className="mt-2 text-sm text-muted-foreground">先发起一场饭局，再在本设备里代填朋友们的时间和偏好。</p>
        {onCreate && (
          <button type="button" onClick={onCreate} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
            <Plus className="h-4 w-4" aria-hidden="true" />
            发起第一场饭局
          </button>
        )}
      </section>
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <MealEventList events={events} selectedId={selectedEvent.id} onSelect={setSelectedId} />
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <p className="text-xs font-semibold text-primary">{mode === "cloud" ? "云端协作" : "仅本设备模拟"}</p>
        <h1 className="mt-1 text-3xl font-bold text-foreground" style={{ fontFamily: "Playfair Display, serif" }}>{selectedEvent.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">当前状态：{statusLabel(selectedEvent.status)}。{mode === "cloud" ? "内容从云端读取，变更会自动同步。" : "成员资料仅在本设备中代填。"}</p>
        {isRealtimeRefreshing && <p className="mt-3 text-sm text-muted-foreground" role="status" aria-label="正在同步云端饭局">正在同步云端饭局…</p>}
        {realtimeError && <p className="mt-4 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">{realtimeError}</p>}
        {saveError && <p className="mt-4 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">{saveError}</p>}
        {mode === "cloud" && cloudUserId && inviteRepository && inviteAppUrl && (
          <MealInvitePanel
            eventId={selectedEvent.id}
            isCreator={selectedEvent.creatorId === cloudUserId}
            repository={inviteRepository}
            appUrl={inviteAppUrl}
          />
        )}
        {(selectedEvent.status === "collecting" || selectedEvent.status === "deciding") && <MealCollectionPanel event={selectedEvent} onSave={saveEvent} currentUserId={mode === "cloud" ? cloudUserId : undefined} />}
        <DecisionOptionsPanel event={selectedEvent} onSave={saveEvent} currentUserId={mode === "cloud" ? cloudUserId : undefined} />
        <MealHistoryPanel event={selectedEvent} onSave={saveEvent} currentUserId={mode === "cloud" ? cloudUserId : undefined} />
      </div>
    </section>
  );
}

function statusLabel(status: MealEvent["status"]): string {
  return ({ collecting: "收集中", deciding: "决策中", confirmed: "已确认", completed: "已完成", draft: "草稿" })[status];
}

function sortEvents(events: MealEvent[]): MealEvent[] {
  return [...events].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}
