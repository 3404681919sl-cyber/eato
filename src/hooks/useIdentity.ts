import { useEffect, useState } from "react";

import type { IdentitySnapshot } from "@/services/identityService";

export type IdentitySource = {
  initialize(): Promise<IdentitySnapshot>;
  getSnapshot(): IdentitySnapshot;
  subscribe(listener: (snapshot: IdentitySnapshot) => void): () => void;
};

export function useIdentity(source: IdentitySource): IdentitySnapshot {
  const [snapshot, setSnapshot] = useState<IdentitySnapshot>(() => source.getSnapshot());

  useEffect(() => {
    let active = true;
    setSnapshot(source.getSnapshot());
    const unsubscribe = source.subscribe((nextSnapshot) => {
      if (active) setSnapshot(nextSnapshot);
    });
    void source.initialize().then((nextSnapshot) => {
      if (active) setSnapshot(nextSnapshot);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [source]);

  return snapshot;
}
