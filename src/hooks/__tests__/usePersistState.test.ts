import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePersistState } from "../usePersistState";

describe("usePersistState", () => {
  const TEST_KEY = "test_persist_key";

  beforeEach(() => {
    localStorage.clear();
  });

  it("should return the initial value when nothing is stored", () => {
    const { result } = renderHook(() => usePersistState(TEST_KEY, "default"));
    expect(result.current[0]).toBe("default");
  });

  it("should load initial value from localStorage if available", () => {
    localStorage.setItem(TEST_KEY, JSON.stringify("stored_value"));
    const { result } = renderHook(() => usePersistState(TEST_KEY, "default"));
    expect(result.current[0]).toBe("stored_value");
  });

  it("should persist the updated value to localStorage", () => {
    const { result } = renderHook(() => usePersistState(TEST_KEY, "default"));

    act(() => {
      result.current[1]("new_value");
    });

    expect(result.current[0]).toBe("new_value");
    expect(JSON.parse(localStorage.getItem(TEST_KEY)!)).toBe("new_value");
  });

  it("should work with object initial values", () => {
    const initial = { a: 1, b: "hello" };
    const { result } = renderHook(() => usePersistState(TEST_KEY, initial));

    expect(result.current[0]).toEqual(initial);

    const updated = { a: 2, b: "world", c: true };
    act(() => {
      result.current[1](updated);
    });

    expect(result.current[0]).toEqual(updated);
    expect(JSON.parse(localStorage.getItem(TEST_KEY)!)).toEqual(updated);
  });

  it("should work with functional updater", () => {
    const { result } = renderHook(() => usePersistState<number>(TEST_KEY, 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
  });

  it("should handle invalid JSON in localStorage gracefully", () => {
    localStorage.setItem(TEST_KEY, "not-valid-json{{{");
    const { result } = renderHook(() => usePersistState(TEST_KEY, "fallback"));
    expect(result.current[0]).toBe("fallback");
  });

  it("should handle localStorage quota exceeded gracefully", () => {
    const { result } = renderHook(() => usePersistState(TEST_KEY, "value"));

    const setItemSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    act(() => {
      result.current[1]("new_value");
    });

    expect(result.current[0]).toBe("new_value");
    setItemSpy.mockRestore();
  });
});
