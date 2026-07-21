import { describe, it, expect } from "vitest";
import { generateId, shortId } from "../../utils/id";

describe("generateId", () => {
  it("generates unique IDs", () => {
    const a = generateId();
    const b = generateId();
    expect(a).not.toBe(b);
  });

  it("accepts prefix", () => {
    const id = generateId("p");
    expect(id.startsWith("p")).toBe(true);
  });
});

describe("shortId", () => {
  it("generates 8-char strings", () => {
    const id = shortId();
    expect(id).toHaveLength(8);
  });

  it("generates unique IDs", () => {
    const ids = new Set(Array.from({ length: 100 }, () => shortId()));
    expect(ids.size).toBe(100);
  });
});
