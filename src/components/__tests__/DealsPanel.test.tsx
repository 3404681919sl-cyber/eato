import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import DealsPanel from "../DealsPanel";

describe("DealsPanel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should render idle state with search button", () => {
    render(<DealsPanel category="hotpot" placeName="海底捞" onClose={vi.fn()} />);
    expect(screen.getByText("开始查询")).toBeDefined();
    expect(screen.getByText("点击自动检索各平台最新优惠，AI 为你比对最优组合")).toBeDefined();
  });

  it("should show loading state after clicking search", () => {
    render(<DealsPanel category="chinese" placeName="测试餐厅" onClose={vi.fn()} />);
    fireEvent.click(screen.getByText("开始查询"));
    expect(screen.getByText("正在检索美团、抖音、大众点评、淘宝闪购、闲鱼…")).toBeDefined();
  });

  it("should show deals result after loading completes", async () => {
    render(<DealsPanel category="bbq" placeName="烤肉店" onClose={vi.fn()} />);

    fireEvent.click(screen.getByText("开始查询"));

    act(() => {
      vi.advanceTimersByTime(1600);
    });

    // Should show "收起" button (results state)
    expect(screen.getByText("收起")).toBeDefined();
    // Should show AI stack suggestion
    expect(screen.getByText("AI 智能叠券建议")).toBeDefined();
  });

  it("should call onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(<DealsPanel category="seafood" placeName="海鲜餐厅" onClose={onClose} />);

    fireEvent.click(screen.getByText("开始查询"));

    act(() => {
      vi.advanceTimersByTime(1600);
    });

    fireEvent.click(screen.getByText("收起"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
