import { describe, expect, it } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useIdentity, type IdentitySource } from "../useIdentity";
import type { IdentitySnapshot } from "@/services/identityService";

class FakeIdentitySource implements IdentitySource {
  private snapshot: IdentitySnapshot = { mode: "local-simulation", status: "loading", userId: null };
  private listener: ((snapshot: IdentitySnapshot) => void) | null = null;
  wasUnsubscribed = false;

  async initialize(): Promise<IdentitySnapshot> {
    this.snapshot = { mode: "cloud-guest", status: "ready", userId: "guest-1" };
    this.listener?.(this.snapshot);
    return this.snapshot;
  }

  getSnapshot(): IdentitySnapshot {
    return this.snapshot;
  }

  subscribe(listener: (snapshot: IdentitySnapshot) => void): () => void {
    this.listener = listener;
    return () => { this.wasUnsubscribed = true; };
  }
}

describe("useIdentity", () => {
  it("exposes the initialized identity snapshot to React", async () => {
    const source = new FakeIdentitySource();
    const { result } = renderHook(() => useIdentity(source));

    await waitFor(() => {
      expect(result.current).toEqual({ mode: "cloud-guest", status: "ready", userId: "guest-1" });
    });
  });

  it("unsubscribes from the identity source when the consuming view unmounts", () => {
    const source = new FakeIdentitySource();
    const { unmount } = renderHook(() => useIdentity(source));

    unmount();

    expect(source.wasUnsubscribed).toBe(true);
  });
});
