import { describe, expect, it, vi } from "vitest";
import { createSupabaseBrowserClientLoader } from "../supabaseBrowserClient";

describe("createSupabaseBrowserClientLoader", () => {
  it("returns one authenticated SDK client to all cloud feature consumers", async () => {
    const client = { auth: {}, rpc: vi.fn(), channel: vi.fn() };
    const createClient = vi.fn(() => client);
    const loadClient = createSupabaseBrowserClientLoader(
      { VITE_SUPABASE_URL: "https://project.supabase.co", VITE_SUPABASE_PUBLISHABLE_KEY: "public-key" },
      async () => ({ createClient }),
    );

    const [authClient, dataClient, realtimeClient] = await Promise.all([
      loadClient(),
      loadClient(),
      loadClient(),
    ]);

    expect(authClient).toBe(client);
    expect(dataClient).toBe(client);
    expect(realtimeClient).toBe(client);
    expect(createClient).toHaveBeenCalledTimes(1);
  });
});
