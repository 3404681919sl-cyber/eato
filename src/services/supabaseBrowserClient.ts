type PublicSupabaseConfig = {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string;
};

export type SupabaseClientFactory<Client> = (url: string, publishableKey: string) => Client;

export function createSupabaseBrowserClientLoader<Client>(
  config: PublicSupabaseConfig,
  loadSdk: () => Promise<{ createClient: SupabaseClientFactory<Client> }>,
): () => Promise<Client | null> {
  const url = config.VITE_SUPABASE_URL?.trim();
  const publishableKey = config.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
  let client: Promise<Client> | null = null;

  return async () => {
    if (!url || !publishableKey) return null;
    client ??= loadSdk().then(({ createClient }) => createClient(url, publishableKey));
    return await client;
  };
}

const browserClientLoaders = new Map<string, () => Promise<unknown | null>>();

export function loadSupabaseBrowserClient(
  config: PublicSupabaseConfig = import.meta.env,
): Promise<unknown | null> {
  const url = config.VITE_SUPABASE_URL?.trim();
  const publishableKey = config.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !publishableKey) return Promise.resolve(null);

  const configKey = `${url}\u0000${publishableKey}`;
  let loadClient = browserClientLoaders.get(configKey);
  if (!loadClient) {
    loadClient = createSupabaseBrowserClientLoader(config, async () => {
      const { createClient } = await import("@supabase/supabase-js");
      return { createClient };
    });
    browserClientLoaders.set(configKey, loadClient);
  }
  return loadClient();
}
