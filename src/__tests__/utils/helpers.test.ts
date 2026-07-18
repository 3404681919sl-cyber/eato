import { describe, it, expect } from "vitest";
import { cn, clamp, randomInt, truncate, getInitials, pluralize, shuffle, debounce } from "../../utils/helpers";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("a", "b")).toBe("a b");
    expect(cn("a", false && "b", "c")).toBe("a c");
    expect(cn()).toBe("");
  });

  it("filters falsy values", () => {
    expect(cn("a", null, undefined, false, "b")).toBe("a b");
  });
});

describe("clamp", () => {
  it("clamps within range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });
});

describe("randomInt", () => {
  it("returns values within range", () => {
    for (let i = 0; i < 100; i++) {
      const v = randomInt(3, 7);
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThanOrEqual(7);
    }
  });
});

describe("truncate", () => {
  it("truncates long strings", () => {
    expect(truncate("hello world", 5)).toBe("hello...");
    expect(truncate("short", 10)).toBe("short");
  });

  it("handles empty string", () => {
    expect(truncate("", 5)).toBe("");
  });
});

describe("getInitials", () => {
  it("gets first character", () => {
    expect(getInitials("海底捞")).toBe("海");
    expect(getInitials("")).toBe("?");
  });
});

describe("pluralize", () => {
  it("handles singular and plural", () => {
    expect(pluralize(1, "visit")).toBe("visit");
    expect(pluralize(3, "visit")).toBe("visits");
  });
});

describe("shuffle", () => {
  it("returns array of same length", () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffle(arr);
    expect(shuffled).toHaveLength(5);
    expect(shuffled.sort()).toEqual([1, 2, 3, 4, 5]);
  });
});
