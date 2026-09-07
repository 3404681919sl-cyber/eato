import { describe, expect, it } from "vitest";

import { routerBasename } from "./routerBase";

describe("routerBasename", () => {
  it("keeps Vite's GitHub Pages base path available to BrowserRouter", () => {
    expect(routerBasename("/eato/")).toBe("/eato");
  });

  it("keeps root deployments at the root route", () => {
    expect(routerBasename("/")).toBe("/");
  });
});
