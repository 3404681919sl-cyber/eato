import type { MealEvent } from "@/domain/meal";

const PERIOD_LABEL: Record<"lunch" | "afternoon" | "dinner", string> = {
  lunch: "午餐",
  afternoon: "下午茶",
  dinner: "晚餐",
};

type SlotCount = { date: string; mealPeriod: "lunch" | "afternoon" | "dinner"; count: number };

export default function MealConsensus({ event }: { event: MealEvent }) {
  const total = event.participants.length;
  if (total === 0) return null;

  const counts = new Map<string, SlotCount>();
  for (const slot of event.availabilities) {
    const key = `${slot.date}|${slot.mealPeriod}`;
    const existing = counts.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(key, { date: slot.date, mealPeriod: slot.mealPeriod, count: 1 });
    }
  }

  let best: SlotCount | null = null;
  for (const value of counts.values()) {
    if (!best || value.count > best.count) best = value;
  }

  if (!best || best.count === 0) {
    return (
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-foreground">当前共识</h2>
        <p className="mt-3 text-sm text-muted-foreground">还没有人填写时间。邀请大家先勾选几个都有空的时间段吧。</p>
      </section>
    );
  }

  const full = best.count === total;

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <h2 className="text-base font-semibold text-foreground">当前共识</h2>
      {full ? (
        <div className="mt-3 flex items-center gap-3 rounded-xl bg-primary/10 px-4 py-3">
          <span className="text-2xl" aria-hidden="true">🗓️</span>
          <div>
            <p className="font-semibold text-foreground">当前最佳时间</p>
            <p className="text-sm text-muted-foreground">{best.date} · {PERIOD_LABEL[best.mealPeriod]} · {total}/{total} 人有空</p>
          </div>
        </div>
      ) : (
        <div className="mt-3 rounded-xl bg-secondary/60 px-4 py-3">
          <p className="text-sm text-muted-foreground">暂时没有所有人都能参加的时间。</p>
          <p className="mt-1 font-semibold text-foreground">最接近：{best.date} · {PERIOD_LABEL[best.mealPeriod]} · {best.count}/{total}</p>
        </div>
      )}
    </section>
  );
}
