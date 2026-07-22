import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LandingPage from "../LandingPage";

describe("LandingPage", () => {
  it("should render the app name", () => {
    render(<LandingPage onStart={vi.fn()} />);
    const headings = screen.getAllByText("Eato");
    expect(headings.length).toBeGreaterThan(0);
  });

  it("should render the tagline", () => {
    render(<LandingPage onStart={vi.fn()} />);
    expect(screen.getByText("和朋友一起发现、打卡、记录")).toBeDefined();
  });

  it("should render feature cards", () => {
    render(<LandingPage onStart={vi.fn()} />);
    expect(screen.getByText("智能打卡表")).toBeDefined();
    expect(screen.getByText("约饭时间协调")).toBeDefined();
    expect(screen.getByText("美食数据洞察")).toBeDefined();
  });

  it("should call onStart when '开始约饭' is clicked", () => {
    const onStart = vi.fn();
    render(<LandingPage onStart={onStart} />);
    fireEvent.click(screen.getByText("开始约饭"));
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it("should call onStart when '登录 / 注册' is clicked", () => {
    const onStart = vi.fn();
    render(<LandingPage onStart={onStart} />);
    fireEvent.click(screen.getByText("登录 / 注册"));
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it("should call onStart when '免费注册' is clicked", () => {
    const onStart = vi.fn();
    render(<LandingPage onStart={onStart} />);
    fireEvent.click(screen.getByText("免费注册"));
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it("should render copyright footer", () => {
    render(<LandingPage onStart={vi.fn()} />);
    expect(screen.getByText(/© 2026 Eato/)).toBeDefined();
  });
});
