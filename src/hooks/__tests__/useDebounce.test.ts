import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "../useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("hello", 350));
    expect(result.current).toBe("hello");
  });

  it("should not update debounced value before delay", () => {
    const { result, rerender } = renderHook(
      ({ val, delay }) => useDebounce(val, delay),
      { initialProps: { val: "initial", delay: 500 } },
    );

    rerender({ val: "updated", delay: 500 });

    // Before timer fires, should still be "initial"
    expect(result.current).toBe("initial");
  });

  it("should update debounced value after the delay", () => {
    const { result, rerender } = renderHook(
      ({ val, delay }) => useDebounce(val, delay),
      { initialProps: { val: "initial", delay: 500 } },
    );

    rerender({ val: "updated", delay: 500 });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe("updated");
  });

  it("should use default delay of 350ms", () => {
    const { result, rerender } = renderHook(
      ({ val }) => useDebounce(val),
      { initialProps: { val: "first" } },
    );

    rerender({ val: "second" });

    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(result.current).toBe("second");
  });

  it("should reset timer on rapid changes (debounce behavior)", () => {
    const { result, rerender } = renderHook(
      ({ val, delay }) => useDebounce(val, delay),
      { initialProps: { val: "a", delay: 300 } },
    );

    rerender({ val: "b", delay: 300 });
    act(() => { vi.advanceTimersByTime(100); }); // partial

    rerender({ val: "c", delay: 300 });
    act(() => { vi.advanceTimersByTime(100); }); // partial

    rerender({ val: "d", delay: 300 });
    act(() => { vi.advanceTimersByTime(100); }); // partial

    // Should still be "a" because timer was reset
    expect(result.current).toBe("a");

    act(() => { vi.advanceTimersByTime(300); }); // final delay

    expect(result.current).toBe("d");
  });

  it("should work with numeric values", () => {
    const { result, rerender } = renderHook(
      ({ val, delay }) => useDebounce(val, delay),
      { initialProps: { val: 0, delay: 100 } },
    );

    rerender({ val: 42, delay: 100 });

    act(() => { vi.advanceTimersByTime(100); });

    expect(result.current).toBe(42);
  });
});
