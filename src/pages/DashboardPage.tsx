import { useEffect, useState } from "react";
import { ArrowRight, Plus, Users } from "lucide-react";

import type { MealEvent } from "@/domain/meal";
import type { MealEventRepository } from "@/services/mealEventRepository";

const STATUS_LABEL: Record<MealEvent["status"], string> = {
  draft: "草稿",
  collecting: "收集中",
  deciding: "决策中",
  confirmed: "已确认",
  completed: "已完成",
};

function countFilled(event: MealEvent): number {
  return event.participants.filter((participant) => {
    const hasTime = event.availabilities.some((slot) => slot.participantId === participant.id);
    const profile = event.preferences[participant.id];
    const hasPreference = Boolean(profile && (profile.likedCuisines.length > 0 || profile.dislikedCuisines.length > 0 || profile.taboos.length > 0));
    return hasTime || hasPreference;
  }).length;
}

type DashboardPageProps = {
  repository: MealEventRepository;
  onOpenEvent: (eventId: string) => void;
  onCreateEvent: () => void;
};

export default function DashboardPage({ repository, onOpenEvent, onCreateEvent }: DashboardPageProps) {
  const [events, setEvents] = useState<MealEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void repository.list().then((list) => {
      if (!active) return;
      setEvents([...list].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)));
      setLoading(false);
    }).catch(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [repository]);

  const ongoing = events.filter((event) => event.status === "collecting" || event.status === "deciding");
  const recent = events.filter((event) => event.status === "confirmed" || event.status === "completed");

  return (
    <div className="mx-auto max-w-3xl space-y-12">
      {/* Hero */}
      <section className="rounded-3xl border border-border bg-gradient-to-br from-primary/10 to-card p-7 shadow-sm sm:p-9">
        <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl" style={{ fontFamily: "Playfair Display, serif" }}>
          今晚有饭局吗？
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
          把什么时候、吃什么、谁来定，交给 Eato。发起一场，邀请朋友一起填时间就好。
        </p>
        <button
          type="button"
          onClick={onCreateEvent}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          发起一次约饭
        </button>
      </section>

      {/* Ongoing */}
      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-xl font-semibold text-foreground" style={{ fontFamily: "Playfair Display, serif" }}>正在进行的饭局</h2>
          {ongoing.length > 0 && <span className="text-xs text-muted-foreground">{ongoing.length} 场</span>}
        </div>
        {loading ? (
          <p className="text-sm text-muted-foreground">加载中…</p>
        ) : ongoing.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-10 text-center">
            <Users className="mx-auto h-8 w-8 text-muted-foreground/50" aria-hidden="true" />
            <p className="mt-3 text-sm text-muted-foreground">还没有进行中的饭局。发起一场，邀请朋友一起把时间定下来吧。</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ongoing.map((event) => {
              const filled = countFilled(event);
              return (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => onOpenEvent(event.id)}
                  className="flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-colors hover:border-primary/40"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-semibold text-foreground">{event.title}</span>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">{STATUS_LABEL[event.status]}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {event.participants.length} 人 · 已响应 {filled}/{event.participants.length}
                      {event.city ? ` · ${event.city}` : ""}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary">
                    继续
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent */}
      {recent.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold text-foreground" style={{ fontFamily: "Playfair Display, serif" }}>最近的饭局</h2>
          <div className="space-y-3">
            {recent.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => onOpenEvent(event.id)}
                className="flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-semibold text-foreground">{event.title}</span>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-muted-foreground">{STATUS_LABEL[event.status]}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{event.participants.length} 人{event.city ? ` · ${event.city}` : ""}</p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary">
                  查看
                  <ArrowRight className="h-4 w-4" />
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
