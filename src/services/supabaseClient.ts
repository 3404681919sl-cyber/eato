import type { IdentityAuthPort, IdentitySession } from "./identityService";
import { loadSupabaseBrowserClient } from "./supabaseBrowserClient";

type PublicSupabaseConfig = {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string;
};

type SupabaseUser = { id: string };
type SupabaseSession = { user: SupabaseUser };
type SupabaseResult<T> = { data: T; error: { message: string } | null };

export type SupabaseBrowserClient = {
  auth: {
    getSession(): Promise<SupabaseResult<{ session: SupabaseSession | null }>>;
    signInAnonymously(): Promise<SupabaseResult<{ user: SupabaseUser | null }>>;
    onAuthStateChange(listener: (event: string, session: SupabaseSession | null) => void): {
      data: { subscription: { unsubscribe(): void } };
    };
  };
};

export type SupabaseClientFactory = (url: string, publishableKey: string) => SupabaseBrowserClient;

export function createSupabaseAuthPort(
  config: PublicSupabaseConfig,
  createBrowserClient: SupabaseClientFactory,
): IdentityAuthPort | null {
  const { url, publishableKey } = getPublicConfig(config);
  if (!url || !publishableKey) return null;

  const client = createBrowserClient(url, publishableKey);
  return {
    async getSession(): Promise<IdentitySession | null> {
      const { data, error } = await client.auth.getSession();
      if (error) throw new Error("无法读取云端访客会话");
      return toIdentitySession(data.session);
    },
    async signInAnonymously(): Promise<IdentitySession> {
      const { data, error } = await client.auth.signInAnonymously();
      if (error || !data.user) throw new Error("无法创建云端访客会话");
      return { userId: data.user.id };
    },
    onAuthStateChange(listener) {
      const { data } = client.auth.onAuthStateChange((_, session) => listener(toIdentitySession(session)));
      return () => data.subscription.unsubscribe();
    },
  };
}

export async function loadSupabaseAuthPort(
  config: PublicSupabaseConfig = import.meta.env,
): Promise<IdentityAuthPort | null> {
  const { url, publishableKey } = getPublicConfig(config);
  if (!url || !publishableKey) return null;

  const client = await loadSupabaseBrowserClient(config);
  return client ? createSupabaseAuthPort(config, () => client as SupabaseBrowserClient) : null;
}

function toIdentitySession(session: SupabaseSession | null): IdentitySession | null {
  return session ? { userId: session.user.id } : null;
}

function getPublicConfig(config: PublicSupabaseConfig): { url: string | undefined; publishableKey: string | undefined } {
  return {
    url: config.VITE_SUPABASE_URL?.trim(),
    publishableKey: config.VITE_SUPABASE_PUBLISHABLE_KEY?.trim(),
  };
}
