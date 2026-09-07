import type { CloudMealEventDataPort } from "./cloudMealEventRepository";
import type { MealAccessRows } from "./mealAccessSchema";
import { loadSupabaseBrowserClient } from "./supabaseBrowserClient";

type PublicSupabaseConfig = {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string;
};

type SupabaseRpcError = { message: string; code?: string };
type SupabaseRpcResult<T> = { data: T | null; error: SupabaseRpcError | null };

export type SupabaseMealEventRpcClient = {
  rpc<T>(name: string, args?: Record<string, unknown>): Promise<SupabaseRpcResult<T>>;
};

export type CloudMealEventDataFailure = {
  kind: "unconfigured" | "unauthorized" | "network" | "invalid-data";
};

export function createSupabaseMealEventDataPort(
  client: SupabaseMealEventRpcClient,
): CloudMealEventDataPort {
  return {
    async list(): Promise<MealAccessRows[]> {
      return await callRpc<MealAccessRows[]>(client, "list_meal_events") ?? [];
    },
    async getById(eventId: string): Promise<MealAccessRows | null> {
      return await callRpc<MealAccessRows>(client, "get_meal_event", { target_event_id: eventId });
    },
    async save(rows: MealAccessRows): Promise<MealAccessRows> {
      const savedRows = await callRpc<MealAccessRows>(client, "save_meal_event", { meal_event: toSavePayload(rows) });
      if (!savedRows) throw { kind: "invalid-data" } satisfies CloudMealEventDataFailure;
      return savedRows;
    },
    async delete(eventId: string): Promise<boolean> {
      return await callRpc<boolean>(client, "delete_meal_event", { target_event_id: eventId }) ?? false;
    },
  };
}

export async function loadSupabaseMealEventDataPort(
  config: PublicSupabaseConfig = import.meta.env,
): Promise<CloudMealEventDataPort | null> {
  const url = config.VITE_SUPABASE_URL?.trim();
  const publishableKey = config.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !publishableKey) return null;

  const client = await loadSupabaseBrowserClient(config);
  return client ? createSupabaseMealEventDataPort(client as SupabaseMealEventRpcClient) : null;
}

function toSavePayload(rows: MealAccessRows): Omit<MealAccessRows, "decision" | "history"> & Partial<Pick<MealAccessRows, "decision" | "history">> {
  const { decision, history, ...eventRows } = rows;
  return {
    ...eventRows,
    ...(decision ? { decision } : {}),
    ...(history ? { history } : {}),
  };
}

async function callRpc<T>(
  client: SupabaseMealEventRpcClient,
  name: string,
  args?: Record<string, unknown>,
): Promise<T | null> {
  try {
    const { data, error } = await client.rpc<T>(name, args);
    if (error) throw toDataFailure(error);
    return data;
  } catch (error) {
    if (isDataFailure(error)) throw error;
    throw { kind: "network" } satisfies CloudMealEventDataFailure;
  }
}

function toDataFailure(error: SupabaseRpcError): CloudMealEventDataFailure {
  return error.code === "42501" || /permission|not allowed|jwt/i.test(error.message)
    ? { kind: "unauthorized" }
    : { kind: "network" };
}

function isDataFailure(error: unknown): error is CloudMealEventDataFailure {
  return typeof error === "object" && error !== null && "kind" in error;
}
