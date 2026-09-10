import { useState } from "react";

import type { Availability, DomainIssue, MealEvent } from "@/domain/meal";
import { recordMealHistory, returnToCollecting } from "@/domain/mealEventActions";

type MealHistoryPanelProps = {
  event: MealEvent;
  onSave: (event: MealEvent) => void;
  currentUserId?: string;
  developerMode?: boolean;
};

export default function MealHistoryPanel({ event, onSave, currentUserId, developerMode = false }: MealHistoryPanelProps) {
  const [occurred, setOccurred] = useState(event.history?.occurred ?? true);
  const [actualSpend, setActualSpend] = useState(event.history?.actualSpend?.toString() ?? "");
  const [rating, setRating] = useState(event.history?.rating?.toString() ?? "");
  const [note, setNote] = useState(event.history?.note ?? "");
  const [issues, setIssues] = useState<DomainIssue[]>([]);
  const [copied, setCopied] = useState(false);
  const candidate = event.candidates.find((item) => item.id === event.decision?.candidateId);
  const canManageMeal = !currentUserId || currentUserId === event.creatorId;

  if (event.status !== "confirmed" && event.status !== "completed") return null;

  const apply = (result: { event: MealEvent; issues: DomainIssue[] }) => {
    setIssues(result.issues);
    if (result.issues.length === 0) onSave(result.event);
  };
  const saveHistory = () => apply(recordMealHistory(event, {
    occurred,
    ...(actualSpend.trim() ? { actualSpend: Number(actualSpend) } : {}),
    ...(rating ? { rating: Number(rating) } : {}),
    ...(note.trim() ? { note: note.trim() } : {}),
  }));

  const copyResult = async () => {
    if (!event.decision) return;
    const lines = [
      `🎉 ${event.title} 已经约成`,
      `时间：${event.decision.selectedDate} · ${periodLabel(event.decision.mealPeriod)}`,
      `地点：${candidate?.name ?? "已选候选"}`,
      `成员：${event.participants.map((participant) => participant.displayName).join("、") || "—"}`,
      `人均：${candidate?.pricePerPerson ? `¥${candidate.pricePerPerson}` : `¥${event.budget.min}–${event.budget.max}`}`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mt-6 space-y-4">
      {/* Result Card — celebratory, visible to everyone */}
      {event.decision && (
        <section className="rounded-2xl border border-primary/30 bg-primary/5 p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl" aria-hidden="true">🎉</span>
            <div>
              <p className="text-lg font-bold text-foreground" style={{ fontFamily: "Playfair Display, serif" }}>就这么定了</p>
              <p className="text-xs text-muted-foreground">把结果发给朋友，准时赴约就好。</p>
            </div>
          </div>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <Detail label="时间" value={`${event.decision.selectedDate} · ${periodLabel(event.decision.mealPeriod)}`} />
            <Detail label="地点" value={candidate?.name ?? "已选候选"} />
            <Detail label="成员" value={event.participants.map((participant) => participant.displayName).join("、") || "—"} />
            <Detail label="人均" value={candidate?.pricePerPerson ? `¥${candidate.pricePerPerson}` : `¥${event.budget.min}–${event.budget.max}`} />
          </dl>
          {/* Placeholders: map / booking / offers are not wired in MVP.
              Hidden for normal users; visible only in Developer Mode. */}
          {developerMode && (
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border border-dashed border-border px-2.5 py-1">地图（即将上线）</span>
              <span className="rounded-full border border-dashed border-border px-2.5 py-1">在线预订（即将上线）</span>
              <span className="rounded-full border border-dashed border-border px-2.5 py-1">优惠比价（即将上线）</span>
            </div>
          )}
          <button type="button" onClick={copyResult} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-primary/40 px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary/10">
            {copied ? "已复制 ✓" : "复制饭局结果"}
          </button>
        </section>
      )}

      {/* History / management form — creator only (the whole section, not just its controls) */}
      {canManageMeal && (
        <section className="rounded-2xl border border-border bg-secondary/30 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">{event.status === "completed" ? "饭后记录" : "饭局已确认"}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {candidate?.name ?? "已选候选"} · {event.decision?.selectedDate} · {periodLabel(event.decision?.mealPeriod)}
              </p>
            </div>
            {event.status === "confirmed" && <button type="button" onClick={() => apply(returnToCollecting(event))} className="min-h-11 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground hover:bg-secondary">重新协调</button>}
          </div>
          {issues.length > 0 && <p className="mt-4 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">{issues[0].message}</p>}
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label className="flex min-h-11 items-center gap-2 rounded-xl border border-border bg-background px-3 text-sm text-foreground">
              <input aria-label="本次饭局已成行" type="checkbox" checked={occurred} onChange={(item) => setOccurred(item.target.checked)} />
              本次饭局已成行
            </label>
            <Field label="实际人均消费" type="number" value={actualSpend} onChange={setActualSpend} />
            <label className="text-sm text-foreground">本次评分
              <select aria-label="本次评分" value={rating} onChange={(item) => setRating(item.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">暂不评分</option>
                {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value} 分</option>)}
              </select>
            </label>
            <label className="sm:col-span-2 text-sm text-foreground">饭后备注
              <textarea aria-label="饭后备注" value={note} onChange={(item) => setNote(item.target.value)} rows={3} className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" placeholder="可记录体验、下次想调整的地方" />
            </label>
          </div>
          <button type="button" onClick={saveHistory} className="mt-4 min-h-11 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90">记录饭后结果</button>
        </section>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background px-3 py-2">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium text-foreground">{value}</dd>
    </div>
  );
}

function Field({ label, type, value, onChange }: { label: string; type: "number"; value: string; onChange: (value: string) => void }) {
  return <label className="text-sm text-foreground">{label}
    <input aria-label={label} type={type} min="0" value={value} onChange={(item) => onChange(item.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
  </label>;
}

function periodLabel(period: Availability["mealPeriod"] | undefined): string {
  return ({ lunch: "午餐", afternoon: "下午茶", dinner: "晚餐" } as Record<string, string>)[period ?? ""] ?? "待定";
}
