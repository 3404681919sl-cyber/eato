import { describe, expect, it } from "vitest";
import {
  createSupabaseMealRealtimePort,
  loadSupabaseMealRealtimePort,
  type SupabaseRealtimeClient,
  type SupabaseRealtimePayload,
} from "../supabaseMealRealtimePort";

describe("createSupabaseMealRealtimePort", () => {
  it("subscribes to only meal tables, normalizes event ids, and tears down its channel", async () => {
    const payloadCallbacks: Array<(payload: SupabaseRealtimePayload) => void> = [];
    const tables: string[] = [];
    let unsubscribeCalls = 0;
    const client: SupabaseRealtimeClient = {
      channel: () => ({
        on: (_kind, filter, callback) => {
          tables.push(filter.table);
          payloadCallbacks.push(callback);
          return client.channel("unused");
        },
        subscribe: () => client.channel("unused"),
        unsubscribe: async () => { unsubscribeCalls += 1; },
      }),
    };
    const events: Array<{ table: string; eventId?: string }> = [];
    const port = createSupabaseMealRealtimePort(client);
    const unsubscribe = port.subscribe((event) => events.push(event), () => {});

    payloadCallbacks.find((_, index) => tables[index] === "meal_votes")?.({ table: "meal_votes", new: { event_id: "event-1" }, old: {} });
    payloadCallbacks.find((_, index) => tables[index] === "meal_events")?.({ table: "meal_events", new: { id: "event-2" }, old: {} });
    unsubscribe();
    await Promise.resolve();

    expect(tables).toHaveLength(8);
    expect(events).toEqual([{ table: "meal_votes", eventId: "event-1" }, { table: "meal_events", eventId: "event-2" }]);
    expect(unsubscribeCalls).toBe(1);
  });

  it("does not initialize a browser client when public Supabase config is incomplete", async () => {
    await expect(loadSupabaseMealRealtimePort({ VITE_SUPABASE_URL: "https://example.supabase.co" })).resolves.toBeNull();
  });
});
