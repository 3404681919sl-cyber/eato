import type { MealEvent } from "@/domain/meal";

type MealEventListProps = {
  events: MealEvent[];
  selectedId?: string;
  onSelect: (eventId: string) => void;
};

const STATUS_LABEL: Record<MealEvent["status"], string> = {
  draft: "草稿",
  collecting: "收集中",
  deciding: "决策中",
  confirmed: "已确认",
  completed: "已完成",
};

export default function MealEventList({ events, selectedId, onSelect }: MealEventListProps) {
  return (
    <aside className="rounded-2xl border border-border bg-card p-3 shadow-sm">
      <h2 className="px-2 pb-2 text-sm font-semibold text-foreground">我的饭局</h2>
      <div className="space-y-1">
        {events.map((event) => (
          <button
            key={event.id}
            type="button"
            aria-pressed={event.id === selectedId}
            onClick={() => onSelect(event.id)}
            className={`w-full rounded-xl px-3 py-3 text-left transition-colors ${
              event.id === selectedId ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"
            }`}
          >
            <span className="block truncate text-sm font-semibold">{event.title}</span>
            <span className={`mt-1 block text-xs ${event.id === selectedId ? "text-primary-foreground/75" : "text-muted-foreground"}`}>
              {STATUS_LABEL[event.status]} · {event.participants.length} 人
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}
