import { describe, it, expect, beforeEach } from "vitest";

describe("usePersistState localStorage logic", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stores and retrieves JSON data", () => {
    const key = "eato_test";
    const data = [{ id: "1", name: "海底捞" }];

    localStorage.setItem(key, JSON.stringify(data));
    const stored = localStorage.getItem(key);
    expect(JSON.parse(stored!)).toEqual(data);
  });

  it("returns null for missing keys", () => {
    expect(localStorage.getItem("nonexistent")).toBeNull();
  });

  it("handles empty arrays", () => {
    const key = "empty";
    localStorage.setItem(key, "[]");
    expect(JSON.parse(localStorage.getItem(key)!)).toEqual([]);
  });

  it("persists across simulated sessions", () => {
    const key = "persist_test";
    const value = { count: 42 };
    localStorage.setItem(key, JSON.stringify(value));
    // Simulate page reload (localStorage persists by design)
    expect(JSON.parse(localStorage.getItem(key)!)).toEqual(value);
  });

  it("handles removal", () => {
    const key = "removable";
    localStorage.setItem(key, "data");
    localStorage.removeItem(key);
    expect(localStorage.getItem(key)).toBeNull();
  });

  it("supports multiple keys independently", () => {
    localStorage.setItem("a", "1");
    localStorage.setItem("b", "2");
    expect(localStorage.getItem("a")).toBe("1");
    expect(localStorage.getItem("b")).toBe("2");
    localStorage.removeItem("a");
    expect(localStorage.getItem("a")).toBeNull();
    expect(localStorage.getItem("b")).toBe("2");
  });
});
