import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const realtimeSubscribe = vi.hoisted(() => vi.fn(() => () => {}));
const loadRealtimePort = vi.hoisted(() => vi.fn(async () => ({ subscribe: realtimeSubscribe })));

vi.mock("@/hooks/useIdentity", () => ({
  // cloud-guest needs a valid UUID userId so createCloudMealEvent passes validation.
  useIdentity: () => ({ mode: "cloud-guest", status: "ready", userId: "11111111-1111-4111-8111-111111111111" }),
}));

vi.mock("@/services/supabaseMealEventDataPort", () => ({
  loadSupabaseMealEventDataPort: async () => ({
    list: async () => [],
    getById: async () => null,
    create: async (rows: unknown) => rows,
    save: async (rows: unknown) => rows,
    delete: async () => false,
  }),
}));

vi.mock("@/services/supabaseMealRealtimePort", () => ({
  loadSupabaseMealRealtimePort: loadRealtimePort,
}));

vi.mock("@/services/supabaseMealInvitePort", () => ({
  loadSupabaseMealInvitePort: async () => null,
}));

import AppShell from "../AppShell";
import { DataProvider } from "@/services/DataProvider";

describe("AppShell realtime meal sync", () => {
  it("subscribes to realtime only after a cloud workspace is opened", async () => {
    render(<DataProvider><AppShell /></DataProvider>);

    // Normal mode hides technical status labels (云端访客 / 本地模拟) from consumers.
    expect(screen.queryByRole("status", { name: "云端访客" })).not.toBeInTheDocument();
    expect(screen.queryByText("本地模拟")).not.toBeInTheDocument();

    // The cloud store resolves from "loading" to "cloud"; wait for it before opening a workspace.
    await waitFor(() => expect(screen.getByRole("button", { name: "我的饭局" })).not.toBeDisabled());

    // Dashboard is shown first, so no realtime subscription has started yet.
    expect(realtimeSubscribe).not.toHaveBeenCalled();

    // Creating a meal opens the cloud workspace, which starts realtime sync.
    fireEvent.click(screen.getByRole("button", { name: "发起饭局" }));
    fireEvent.change(screen.getByLabelText("饭局名称"), { target: { value: "云端测试饭局" } });
    fireEvent.click(screen.getByRole("button", { name: "创建并邀请朋友" }));

    await waitFor(() => expect(realtimeSubscribe).toHaveBeenCalledOnce());
    expect(loadRealtimePort).toHaveBeenCalledOnce();
  });
});
