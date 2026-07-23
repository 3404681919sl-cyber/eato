import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import React from "react";
import { DataProvider, useData } from "../DataProvider";
import type { Category, DealsResult } from "@/types";

describe("DataProvider.searchDeals", () => {
  let captured: ((name: string, cat: Category) => Promise<DealsResult>) | null = null;

  beforeEach(() => {
    // Simulate a configured back-end so the composed search actually calls fetch.
    vi.stubEnv("VITE_API_BASE", "http://localhost:3001");
    // Force the back-end call to fail → must fall back to local mock, never throw.
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network down"));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    captured = null;
  });

  function Capture() {
    const { searchDeals } = useData();
    React.useEffect(() => {
      captured = searchDeals;
    }, [searchDeals]);
    return null;
  }

  it("falls back to local mock deals when the back-end fails (no throw)", async () => {
    render(
      <DataProvider>
        <Capture />
      </DataProvider>,
    );

    await waitFor(() => expect(captured).not.toBeNull());

    let threw = false;
    let result: DealsResult | null = null;
    try {
      result = await captured!("海底捞", "hotpot");
    } catch {
      threw = true;
    }

    expect(threw).toBe(false);
    expect(result).not.toBeNull();
    expect(result!.deals.length).toBeGreaterThan(0);
  });
});
