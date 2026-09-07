export type IdentityMode = "cloud-guest" | "local-simulation";
export type IdentityStatus = "loading" | "ready" | "unconfigured" | "error";

export type IdentitySnapshot = {
  mode: IdentityMode;
  status: IdentityStatus;
  userId: string | null;
  message?: string;
};

export type IdentitySession = {
  userId: string;
};

export interface IdentityAuthPort {
  getSession(): Promise<IdentitySession | null>;
  signInAnonymously(): Promise<IdentitySession>;
  onAuthStateChange(listener: (session: IdentitySession | null) => void): () => void;
}

export type IdentityAuthPortLoader = () => Promise<IdentityAuthPort | null>;

const LOADING_SNAPSHOT: IdentitySnapshot = {
  mode: "local-simulation",
  status: "loading",
  userId: null,
};

export class IdentityService {
  private snapshot = LOADING_SNAPSHOT;
  private authPort: IdentityAuthPort | null | undefined;
  private hasAuthStateSubscription = false;
  private initialization: Promise<IdentitySnapshot> | null = null;
  private readonly listeners = new Set<(snapshot: IdentitySnapshot) => void>();
  private readonly loadAuthPort: IdentityAuthPortLoader;

  constructor(authPortOrLoader: IdentityAuthPort | null | IdentityAuthPortLoader) {
    if (typeof authPortOrLoader === "function") {
      this.loadAuthPort = authPortOrLoader;
    } else {
      this.authPort = authPortOrLoader;
      this.loadAuthPort = async () => authPortOrLoader;
    }
  }

  async initialize(): Promise<IdentitySnapshot> {
    this.initialization ??= this.initializeOnce();
    return this.initialization;
  }

  private async initializeOnce(): Promise<IdentitySnapshot> {
    const authPort = await this.getAuthPort();

    if (!authPort) {
      return this.setSnapshot({
        mode: "local-simulation",
        status: "unconfigured",
        userId: null,
        message: "尚未配置云端访客会话",
      });
    }

    try {
      const existingSession = await authPort.getSession();
      const session = existingSession ?? await authPort.signInAnonymously();
      return this.setSessionSnapshot(session);
    } catch {
      return this.setSnapshot({
        mode: "local-simulation",
        status: "error",
        userId: null,
        message: "云端访客会话暂不可用",
      });
    }
  }

  getSnapshot(): IdentitySnapshot {
    return this.snapshot;
  }

  subscribe(listener: (snapshot: IdentitySnapshot) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private async getAuthPort(): Promise<IdentityAuthPort | null> {
    if (this.authPort === undefined) this.authPort = await this.loadAuthPort();
    if (this.authPort && !this.hasAuthStateSubscription) {
      this.authPort.onAuthStateChange((session) => this.setSessionSnapshot(session));
      this.hasAuthStateSubscription = true;
    }
    return this.authPort;
  }

  private setSessionSnapshot(session: IdentitySession | null): IdentitySnapshot {
    return session
      ? this.setSnapshot({ mode: "cloud-guest", status: "ready", userId: session.userId })
      : this.setSnapshot({
        mode: "local-simulation",
        status: "error",
        userId: null,
        message: "云端访客会话已结束",
      });
  }

  private setSnapshot(snapshot: IdentitySnapshot): IdentitySnapshot {
    this.snapshot = snapshot;
    this.listeners.forEach((listener) => listener(snapshot));
    return snapshot;
  }
}
