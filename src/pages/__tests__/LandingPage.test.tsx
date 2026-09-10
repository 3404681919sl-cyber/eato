import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LandingPage from "../LandingPage";

describe("LandingPage", () => {
  it("should render the app name", () => {
    render(<LandingPage onStart={vi.fn()} />);
    expect(screen.getAllByText("Eato").length).toBeGreaterThan(0);
  });

  it("should render the decision-assistant hero copy", () => {
    render(<LandingPage onStart={vi.fn()} />);
    expect(screen.getByText(/Eato 帮你们汇总成共同方案/)).toBeDefined();
    expect(screen.getByText("多人约饭决策助手")).toBeDefined();
  });

  it("should render the three capability cards", () => {
    render(<LandingPage onStart={vi.fn()} />);
    ["大家各填自己的", "自动找到共同时间", "一起选出最终方案"].forEach((title) => {
      expect(screen.getAllByText(title).length).toBeGreaterThan(0);
    });
  });

  it("should call onStart when '发起一次约饭' is clicked", () => {
    const onStart = vi.fn();
    render(<LandingPage onStart={onStart} />);
    const buttons = screen.getAllByRole("button", { name: "发起一次约饭" });
    expect(buttons.length).toBeGreaterThan(0);
    fireEvent.click(buttons[0]);
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it("should render the copyright footer", () => {
    render(<LandingPage onStart={vi.fn()} />);
    expect(screen.getByText(/© 2026 Eato/)).toBeDefined();
  });
});
