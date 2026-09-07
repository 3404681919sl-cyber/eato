import { describe, expect, it, vi } from "vitest";
import { createSupabaseAuthPort, loadSupabaseAuthPort, type SupabaseClientFactory } from "../supabaseClient";

describe("createSupabaseAuthPort", () => {
  it("returns no async cloud port without public configuration before loading the SDK", async () => {
    await expect(loadSupabaseAuthPort({ VITE_SUPABASE_URL: "", VITE_SUPABASE_PUBLISHABLE_KEY: "public-key" })).resolves.toBeNull();
  });

  it("does not construct a cloud client when either public configuration value is missing", () => {
    const createClient = vi.fn();

    expect(createSupabaseAuthPort({ VITE_SUPABASE_URL: "", VITE_SUPABASE_PUBLISHABLE_KEY: "public-key" }, createClient)).toBeNull();
    expect(createSupabaseAuthPort({ VITE_SUPABASE_URL: "https://project.supabase.co", VITE_SUPABASE_PUBLISHABLE_KEY: "" }, createClient)).toBeNull();
    expect(createClient).not.toHaveBeenCalled();
  });

  it("maps a configured SDK client to the identity auth port without exposing SDK types", async () => {
    const unsubscribe = vi.fn();
    const client = {
      auth: {
        getSession: async () => ({ data: { session: { user: { id: "guest-1" } } }, error: null }),
        signInAnonymously: async () => ({ data: { user: { id: "guest-2" } }, error: null }),
        onAuthStateChange: (listener: (event: string, session: { user: { id: string } } | null) => void) => {
          listener("SIGNED_IN", { user: { id: "guest-3" } });
          return { data: { subscription: { unsubscribe } } };
        },
      },
    };
    const createClient: SupabaseClientFactory = vi.fn(() => client);
    const port = createSupabaseAuthPort({
      VITE_SUPABASE_URL: "https://project.supabase.co",
      VITE_SUPABASE_PUBLISHABLE_KEY: "public-key",
    }, createClient);
    const received: string[] = [];

    const stop = port?.onAuthStateChange((session) => received.push(session?.userId ?? "none"));

    await expect(port?.getSession()).resolves.toEqual({ userId: "guest-1" });
    await expect(port?.signInAnonymously()).resolves.toEqual({ userId: "guest-2" });
    expect(received).toEqual(["guest-3"]);
    stop?.();
    expect(unsubscribe).toHaveBeenCalledOnce();
  });
});
