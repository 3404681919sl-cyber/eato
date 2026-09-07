import { loadSupabaseBrowserClient } from "./supabaseBrowserClient";

type PublicSupabaseConfig = {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string;
};

type SupabaseRpcError = { message: string; code?: string };
type SupabaseRpcResult<T> = { data: T | null; error: SupabaseRpcError | null };

export type SupabaseMealInviteRpcClient = {
  rpc<T>(name: string, args?: Record<string, unknown>): Promise<SupabaseRpcResult<T>>;
};

export type MealInviteDataFailure = {
  kind: "unconfigured" | "unauthorized" | "network" | "invalid-data";
};

export type MealInvitePort = {
  createOrRotate(eventId: string): Promise<string>;
  join(token: string, displayName: string): Promise<string>;
};

export function createSupabaseMealInvitePort(client: SupabaseMealInviteRpcClient): MealInvitePort {
  return {
    async createOrRotate(eventId) {
      const token = await callRpc<string>(client, "create_or_rotate_meal_invite", { target_event_id: eventId });
      if (!token) throw { kind: "invalid-data" } satisfies MealInviteDataFailure;
      return token;
    },
    async join(token, displayName) {
      const eventId = await callRpc<string>(client, "join_meal_invite", { invite_token: token, display_name: displayName });
      if (!eventId) throw { kind: "invalid-data" } satisfies MealInviteDataFailure;
      return eventId;
    },
  };
}

export async function loadSupabaseMealInvitePort(
  config: PublicSupabaseConfig = import.meta.env,
): Promise<MealInvitePort | null> {
  const url = config.VITE_SUPABASE_URL?.trim();
  const publishableKey = config.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !publishableKey) return null;

  const client = await loadSupabaseBrowserClient(config);
  return client ? createSupabaseMealInvitePort(client as SupabaseMealInviteRpcClient) : null;
}

async function callRpc<T>(
  client: SupabaseMealInviteRpcClient,
  name: string,
  args: Record<string, unknown>,
): Promise<T | null> {
  try {
    const { data, error } = await client.rpc<T>(name, args);
    if (error) throw toDataFailure(error);
    return data;
  } catch (error) {
    if (isDataFailure(error)) throw error;
    throw { kind: "network" } satisfies MealInviteDataFailure;
  }
}

function toDataFailure(error: SupabaseRpcError): MealInviteDataFailure {
  return error.code === "42501" || /permission|not allowed|jwt/i.test(error.message)
    ? { kind: "unauthorized" }
    : { kind: "network" };
}

function isDataFailure(error: unknown): error is MealInviteDataFailure {
  return typeof error === "object" && error !== null && "kind" in error;
}
