const MEAL_TABLES = new Set([
  "meal_events",
  "meal_members",
  "meal_availabilities",
  "meal_preferences",
  "meal_candidates",
  "meal_votes",
  "meal_decisions",
  "meal_histories",
]);

export type MealRealtimeEvent = {
  table: string;
  eventId?: string;
};

export type MealRealtimePort = {
  subscribe(
    listener: (event: MealRealtimeEvent) => void,
    onError: () => void,
  ): () => void;
};

export class MealRealtimeSync {
  constructor(private readonly port: MealRealtimePort) {}

  subscribe(onRefresh: (eventId: string) => void, onError: () => void = () => {}): () => void {
    let active = true;
    const pending = new Set<string>();
    let scheduled = false;

    const flush = () => {
      scheduled = false;
      if (!active) return;
      const eventIds = [...pending];
      pending.clear();
      eventIds.forEach(onRefresh);
    };

    const unsubscribe = this.port.subscribe((event) => {
      if (!active || !event.eventId || !MEAL_TABLES.has(event.table)) return;
      pending.add(event.eventId);
      if (!scheduled) {
        scheduled = true;
        queueMicrotask(flush);
      }
    }, () => {
      if (active) onError();
    });

    return () => {
      active = false;
      pending.clear();
      unsubscribe();
    };
  }
}
