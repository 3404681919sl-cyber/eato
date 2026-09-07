import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

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
  loadSupabaseMealRealtimePort: async () => null,
}));

vi.mock("@/services/supabaseMealInvitePort", () => ({
  loadSupabaseMealInvitePort: async () => ({
    createOrRotate: async () => "opaque-token",
    join: async () => "event-1",
  }),
}));

import AppShell from "../AppShell";
import { DataProvider } from "@/services/DataProvider";

describe("AppShell invite entry", () => {
  afterEach(() => window.history.replaceState(null, "", "/"));

  it("opens the guest join screen when the app URL contains an invite fragment", async () => {
    window.history.replaceState(null, "", "/eato/app#invite=opaque-token");

    render(<DataProvider><AppShell /></DataProvider>);

    expect(await screen.findByRole("heading", { name: "加入饭局" })).toBeInTheDocument();
    expect(screen.getByLabelText("加入饭局时使用的昵称")).toBeInTheDocument();
  });
});
