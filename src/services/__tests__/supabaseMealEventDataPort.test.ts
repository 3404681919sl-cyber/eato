import { describe, expect, it } from "vitest";
import { toMealAccessRows } from "../mealAccessSchema";
import {
  createSupabaseMealEventDataPort,
  type SupabaseMealEventRpcClient,
} from "../supabaseMealEventDataPort";

const event = toMealAccessRows({
  id: "00000000-0000-4000-8000-000000000001",
  creatorId: "00000000-0000-4000-8000-000000000002",
  title: "周五火锅局",
  city: "上海",
  area: "静安区",
  budget: { min: 80, max: 150 },
  participantIds: ["00000000-0000-4000-8000-000000000002"],
  candidateDateRange: { start: "2026-08-29", end: "2026-08-31" },
  status: "collecting",
  participants: [{ id: "00000000-0000-4000-8000-000000000002", displayName: "小美", role: "creator" }],
  availabilities: [], preferences: {}, candidates: [], votes: [],
  createdAt: "2026-08-28T00:00:00.000Z", updatedAt: "2026-08-28T00:00:00.000Z",
});

describe("createSupabaseMealEventDataPort", () => {
  it("uses only the approved aggregate RPC boundary", async () => {
    const calls: Array<{ name: string; args: Record<string, unknown> }> = [];
    const client: SupabaseMealEventRpcClient = {
      rpc: async <T,>(name: string, args?: Record<string, unknown>) => {
        calls.push({ name, args: args ?? {} });
        const data = name === "list_meal_events" ? [event] : name === "get_meal_event" ? event : name === "save_meal_event" ? event : true;
        return { data: data as T, error: null };
      },
    };
    const port = createSupabaseMealEventDataPort(client);

    await expect(port.list()).resolves.toEqual([event]);
    await expect(port.getById(event.event.id)).resolves.toEqual(event);
    await expect(port.save(event)).resolves.toEqual(event);
    await expect(port.delete(event.event.id)).resolves.toBe(true);
    expect(calls.map((call) => call.name)).toEqual(["list_meal_events", "get_meal_event", "save_meal_event", "delete_meal_event"]);
    expect(calls[1].args).toEqual({ target_event_id: event.event.id });
    const { decision: _decision, history: _history, ...eventWithoutOptionalRecords } = event;
    expect(calls[2].args).toEqual({ meal_event: eventWithoutOptionalRecords });
  });

  it("classifies a Supabase permission error without any local fallback", async () => {
    const port = createSupabaseMealEventDataPort({
      rpc: async () => ({ data: null, error: { message: "permission denied", code: "42501" } }),
    });

    await expect(port.list()).rejects.toEqual({ kind: "unauthorized" });
  });
});
