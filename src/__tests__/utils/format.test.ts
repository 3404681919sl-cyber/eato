import { describe, it, expect } from "vitest";
import { formatPrice, discountPercent, compactNumber, today, now, formatDateCN, formatTime } from "../../utils/format";

describe("formatPrice", () => {
  it("formats number with ¥ and comma", () => {
    expect(formatPrice(12800)).toBe("¥12,800");
    expect(formatPrice(0)).toBe("¥0");
    expect(formatPrice(99)).toBe("¥99");
  });

  it("handles string input", () => {
    expect(formatPrice("1500")).toBe("¥1,500");
    expect(formatPrice("abc")).toBe("¥0");
  });

  it("handles edge cases", () => {
    expect(formatPrice(-100)).toBe("¥-100");
    expect(formatPrice(1.5)).toBe("¥1.5");
  });
});

describe("discountPercent", () => {
  it("calculates correct discount", () => {
    expect(discountPercent(200, 150)).toBe(25);
    expect(discountPercent(100, 50)).toBe(50);
    expect(discountPercent(80, 80)).toBe(0);
  });

  it("handles edge cases", () => {
    expect(discountPercent(0, 0)).toBe(0);
    expect(discountPercent(100, 0)).toBe(100);
  });
});

describe("compactNumber", () => {
  it("formats large numbers", () => {
    expect(compactNumber(1234)).toBe("1.2k");
    expect(compactNumber(1234567)).toBe("1.2M");
    expect(compactNumber(500)).toBe("500");
  });
});

describe("formatTime", () => {
  it("formats time strings", () => {
    expect(formatTime("11:30")).toBe("11:30");
    expect(formatTime("9:5")).toBe("09:05");
  });

  it("handles empty input", () => {
    expect(formatTime("")).toBe("");
  });
});

describe("formatDateCN", () => {
  it("formats dates in Chinese", () => {
    const d = new Date(2026, 6, 18);
    expect(formatDateCN(d)).toBe("2026年7月18日");
  });
});

describe("today / now", () => {
  it("returns strings in expected format", () => {
    expect(today()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(now()).toMatch(/^\d{2}:\d{2}$/);
  });
});
