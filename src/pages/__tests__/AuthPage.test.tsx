import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import AuthPage from "../AuthPage";

describe("AuthPage", () => {
  it("should render login form by default", () => {
    render(<AuthPage mode="login" onModeChange={vi.fn()} onLogin={vi.fn()} />);
    expect(screen.getByText("欢迎回来")).toBeDefined();
    expect(screen.getByText("登录")).toBeDefined();
  });

  it("should render signup form when mode is signup", () => {
    render(<AuthPage mode="signup" onModeChange={vi.fn()} onLogin={vi.fn()} />);
    expect(screen.getByText("加入 Eato")).toBeDefined();
    expect(screen.getByText("创建账号")).toBeDefined();
    // Nickname field should be visible in signup mode
    expect(screen.getByText("昵称")).toBeDefined();
  });

  it("should toggle mode when clicking switch link", () => {
    const onModeChange = vi.fn();
    render(<AuthPage mode="login" onModeChange={onModeChange} onLogin={vi.fn()} />);
    fireEvent.click(screen.getByText("立即注册"));
    expect(onModeChange).toHaveBeenCalledWith("signup");
  });

  it("should show loading state after form submission", () => {
    vi.useFakeTimers();
    render(<AuthPage mode="login" onModeChange={vi.fn()} onLogin={vi.fn()} />);

    fireEvent.submit(screen.getByRole("button", { name: "登录" }));
    expect(screen.getByText("验证中…")).toBeDefined();

    vi.useRealTimers();
  });

  it("should call onLogin after timeout completes", () => {
    vi.useFakeTimers();
    const onLogin = vi.fn();
    render(<AuthPage mode="login" onModeChange={vi.fn()} onLogin={onLogin} />);

    fireEvent.submit(screen.getByRole("button", { name: "登录" }));
    act(() => {
      vi.advanceTimersByTime(900);
    });

    expect(onLogin).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it("should show Google sign-in button", () => {
    render(<AuthPage mode="login" onModeChange={vi.fn()} onLogin={vi.fn()} />);
    expect(screen.getByText("使用 Google 账号继续")).toBeDefined();
  });
});
