import { describe, expect, it } from "vitest";
import { MealRealtimeSync, type MealRealtimePort } from "../mealRealtimeSync";

type Listener = (event: { table: string; eventId?: string }) => void;

function createPort(): { port: MealRealtimePort; emit(event: { table: string; eventId?: string }): void; fail(): void; unsubscribeCount(): number } {
  let listener: Listener | null = null;
  let errorListener: (() => void) | null = null;
  let count = 0;
  return {
    port: {
      subscribe(nextListener, nextErrorListener) {
        listener = nextListener;
        errorListener = nextErrorListener;
        return () => { count += 1; listener = null; errorListener = null; };
      },
    },
    emit(event) { listener?.(event); },
    fail() { errorListener?.(); },
    unsubscribeCount() { return count; },
  };
}

describe("MealRealtimeSync", () => {
  it("coalesces multiple table changes for the same meal into one refresh", async () => {
    const fixture = createPort();
    const refreshed: string[] = [];
    const sync = new MealRealtimeSync(fixture.port);
    sync.subscribe((eventId) => refreshed.push(eventId));

    fixture.emit({ table: "meal_candidates", eventId: "event-1" });
    fixture.emit({ table: "meal_votes", eventId: "event-1" });
    fixture.emit({ table: "meal_events", eventId: "event-1" });
    await Promise.resolve();

    expect(refreshed).toEqual(["event-1"]);
  });

  it("keeps separate meals separate and ignores unrelated realtime tables", async () => {
    const fixture = createPort();
    const refreshed: string[] = [];
    new MealRealtimeSync(fixture.port).subscribe((eventId) => refreshed.push(eventId));

    fixture.emit({ table: "meal_events", eventId: "event-1" });
    fixture.emit({ table: "restaurants", eventId: "event-2" });
    fixture.emit({ table: "meal_histories", eventId: "event-3" });
    await Promise.resolve();

    expect(refreshed).toEqual(["event-1", "event-3"]);
  });

  it("stops callbacks after unsubscribe and surfaces subscription failures", async () => {
    const fixture = createPort();
    const refreshed: string[] = [];
    const errors: string[] = [];
    const unsubscribe = new MealRealtimeSync(fixture.port).subscribe((eventId) => refreshed.push(eventId), () => errors.push("failed"));

    fixture.fail();
    unsubscribe();
    fixture.emit({ table: "meal_events", eventId: "event-1" });
    await Promise.resolve();

    expect(errors).toEqual(["failed"]);
    expect(refreshed).toEqual([]);
    expect(fixture.unsubscribeCount()).toBe(1);
  });
});
