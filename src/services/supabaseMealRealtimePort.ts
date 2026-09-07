import type { MealRealtimePort } from "./mealRealtimeSync";
import { loadSupabaseBrowserClient } from "./supabaseBrowserClient";

type PublicSupabaseConfig = {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string;
};

const MEAL_TABLES = [
  "meal_events",
  "meal_members",
  "meal_availabilities",
  "meal_preferences",
  "meal_candidates",
  "meal_votes",
  "meal_decisions",
  "meal_histories",
] as const;

export type SupabaseRealtimePayload = {
  table: string;
  new: Record<string, unknown>;
  old: Record<string, unknown>;
};

export type SupabaseRealtimeChannel = {
  on(
    kind: "postgres_changes",
    filter: { event: "*"; schema: "public"; table: string },
    callback: (payload: SupabaseRealtimePayload) => void,
  ): SupabaseRealtimeChannel;
  subscribe(callback: (status: string) => void): SupabaseRealtimeChannel;
  unsubscribe(): Promise<unknown>;
};

export type SupabaseRealtimeClient = {
  channel(name: string): SupabaseRealtimeChannel;
};

export function createSupabaseMealRealtimePort(client: SupabaseRealtimeClient): MealRealtimePort {
  return {
    subscribe(listener, onError) {
      const channel = client.channel("eato-meal-events");
      MEAL_TABLES.forEach((table) => {
        channel.on("postgres_changes", { event: "*", schema: "public", table }, (payload) => {
          listener({ table: payload.table, eventId: eventIdFromPayload(payload) });
        });
      });
      channel.subscribe((status) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") onError();
      });

      return () => { void channel.unsubscribe(); };
    },
  };
}

export async function loadSupabaseMealRealtimePort(
  config: PublicSupabaseConfig = import.meta.env,
): Promise<MealRealtimePort | null> {
  const url = config.VITE_SUPABASE_URL?.trim();
  const publishableKey = config.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !publishableKey) return null;

  const client = await loadSupabaseBrowserClient(config);
  return client ? createSupabaseMealRealtimePort(client as SupabaseRealtimeClient) : null;
}

function eventIdFromPayload(payload: SupabaseRealtimePayload): string | undefined {
  const record = Object.keys(payload.new).length > 0 ? payload.new : payload.old;
  const eventId = payload.table === "meal_events" ? record.id : record.event_id;
  return typeof eventId === "string" ? eventId : undefined;
}
