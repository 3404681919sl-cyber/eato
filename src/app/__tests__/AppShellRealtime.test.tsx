import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const realtimeSubscribe = vi.hoisted(() => vi.fn(() => () => {}));
const loadRealtimePort = vi.hoisted(() => vi.fn(async () => ({ subscribe: realtimeSubscribe })));

vi.mock("@/hooks/useIdentity", () => ({
  useIdentity: () => ({ mode: "cloud-guest", status: "ready", userId: "guest-1" }),
}));

vi.mock("@/services/supabaseMealEventDataPort", () => ({
  loadSupabaseMealEventDataPort: async () => ({
    list: async () => [],
    getById: async () => null,
    save: async (rows: unknown) => rows,
    delete: async () => false,
  }),
}));

vi.mock("@/services/supabaseMealRealtimePort", () => ({
  loadSupabaseMealRealtimePort: loadRealtimePort,
}));

import AppShell from "../AppShell";
import { DataProvider } from "@/services/DataProvider";

describe("AppShell realtime meal sync", () => {
  it("subscribes to realtime only after a cloud workspace is opened", async () => {
    render(<DataProvider><AppShell /></DataProvider>);

    expect(await screen.findByRole("status", { name: "云端访客" })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("button", { name: "我的饭局" })).not.toBeDisabled());
    fireEvent.click(screen.getByRole("button", { name: "我的饭局" }));

    await waitFor(() => expect(loadRealtimePort).toHaveBeenCalledOnce());
    await waitFor(() => expect(realtimeSubscribe).toHaveBeenCalledOnce());
  });
});
