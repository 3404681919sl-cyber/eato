import { describe, expect, it } from "vitest";
import {
  createSupabaseMealInvitePort,
  type SupabaseMealInviteRpcClient,
} from "../supabaseMealInvitePort";

describe("createSupabaseMealInvitePort", () => {
  it("uses only creator-rotation and self-join RPCs", async () => {
    const calls: Array<{ name: string; args: Record<string, unknown> }> = [];
    const client: SupabaseMealInviteRpcClient = {
      rpc: async <T,>(name: string, args?: Record<string, unknown>) => {
        calls.push({ name, args: args ?? {} });
        const data = name === "create_or_rotate_meal_invite" ? "invite-token" : "event-id";
        return { data: data as T, error: null };
      },
    };
    const port = createSupabaseMealInvitePort(client);

    await expect(port.createOrRotate("event-id")).resolves.toBe("invite-token");
    await expect(port.join("invite-token", "小美")).resolves.toBe("event-id");
    expect(calls).toEqual([
      { name: "create_or_rotate_meal_invite", args: { target_event_id: "event-id" } },
      { name: "join_meal_invite", args: { invite_token: "invite-token", display_name: "小美" } },
    ]);
  });

  it("does not fall back locally when the cloud rejects an invite action", async () => {
    const port = createSupabaseMealInvitePort({
      rpc: async () => ({ data: null, error: { code: "42501", message: "permission denied" } }),
    });

    await expect(port.createOrRotate("event-id")).rejects.toEqual({ kind: "unauthorized" });
  });
});
