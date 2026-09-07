import { describe, expect, it } from "vitest";
import {
  IdentityService,
  type IdentityAuthPort,
  type IdentitySession,
} from "../identityService";

class FakeAuthPort implements IdentityAuthPort {
  session: IdentitySession | null;
  anonymousSession: IdentitySession = { userId: "guest-1" };
  signInError: Error | null = null;
  anonymousSignInCalls = 0;
  private listeners = new Set<(session: IdentitySession | null) => void>();

  constructor(session: IdentitySession | null = null) {
    this.session = session;
  }

  async getSession(): Promise<IdentitySession | null> {
    return this.session;
  }

  async signInAnonymously(): Promise<IdentitySession> {
    this.anonymousSignInCalls += 1;
    if (this.signInError) throw this.signInError;
    this.session = this.anonymousSession;
    return this.anonymousSession;
  }

  onAuthStateChange(listener: (session: IdentitySession | null) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(session: IdentitySession | null): void {
    this.session = session;
    this.listeners.forEach((listener) => listener(session));
  }
}

describe("IdentityService", () => {
  it("reports local simulation when cloud identity has not been configured", async () => {
    const service = new IdentityService(null);

    await service.initialize();

    expect(service.getSnapshot()).toEqual({
      mode: "local-simulation",
      status: "unconfigured",
      userId: null,
      message: "尚未配置云端访客会话",
    });
  });

  it("restores an existing guest session without creating another guest", async () => {
    const port = new FakeAuthPort({ userId: "existing-guest" });
    const service = new IdentityService(port);

    const snapshot = await service.initialize();

    expect(snapshot).toEqual({ mode: "cloud-guest", status: "ready", userId: "existing-guest" });
    expect(port.anonymousSignInCalls).toBe(0);
  });

  it("creates one anonymous guest when no previous session exists", async () => {
    const port = new FakeAuthPort();
    const service = new IdentityService(port);

    await service.initialize();
    await service.initialize();

    expect(service.getSnapshot()).toEqual({ mode: "cloud-guest", status: "ready", userId: "guest-1" });
    expect(port.anonymousSignInCalls).toBe(1);
  });

  it("loads a deferred cloud auth port once before starting a guest session", async () => {
    const port = new FakeAuthPort();
    let loaderCalls = 0;
    const service = new IdentityService(async () => {
      loaderCalls += 1;
      return port;
    });

    await service.initialize();
    await service.initialize();

    expect(service.getSnapshot()).toEqual({ mode: "cloud-guest", status: "ready", userId: "guest-1" });
    expect(loaderCalls).toBe(1);
  });

  it("keeps cloud identity absent and exposes a safe message when anonymous sign-in fails", async () => {
    const port = new FakeAuthPort();
    port.signInError = new Error("provider token leaked");
    const service = new IdentityService(port);

    await service.initialize();

    expect(service.getSnapshot()).toEqual({
      mode: "local-simulation",
      status: "error",
      userId: null,
      message: "云端访客会话暂不可用",
    });
  });

  it("notifies active subscribers about session changes and stops after unsubscribe", async () => {
    const port = new FakeAuthPort({ userId: "guest-1" });
    const service = new IdentityService(port);
    const received: Array<string | null> = [];
    const unsubscribe = service.subscribe((snapshot) => received.push(snapshot.userId));

    await service.initialize();
    port.emit({ userId: "guest-2" });
    unsubscribe();
    port.emit(null);

    expect(received).toEqual(["guest-1", "guest-2"]);
    expect(service.getSnapshot()).toEqual({
      mode: "local-simulation",
      status: "error",
      userId: null,
      message: "云端访客会话已结束",
    });
  });
});
