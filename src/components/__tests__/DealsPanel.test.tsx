import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import DealsPanel from "../DealsPanel";

// Mock the data layer so the panel exercises its own loading/done states
// without depending on the real (or failing) back-end / localStorage.
const mockSearchDeals = vi.fn();

vi.mock("@/services/DataProvider", () => ({
  DataProvider: ({ children }: { children: React.ReactNode }) => children,
  useData: () => ({ searchDeals: mockSearchDeals }),
}));

const FAKE_RESULT = {
  deals: [
    { platform: "meituan", description: "双人套餐 含2饮料", price: 120, originalPrice: 158, isBest: true, tag: "最低价" },
    { platform: "douyin", description: "达人探店团购券", price: 130, originalPrice: 158, isBest: false },
  ],
  bestStack: "当前最低价为 美团（¥120），可直接购买。",
  saving: 38,
  finalPrice: 120,
};

describe("DealsPanel", () => {
  beforeEach(() => {
    mockSearchDeals.mockResolvedValue(FAKE_RESULT);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render idle state with search button", () => {
    render(<DealsPanel category="hotpot" placeName="海底捞" onClose={vi.fn()} />);
    expect(screen.getByText("开始查询")).toBeDefined();
    expect(screen.getByText("点击自动检索各平台最新优惠，AI 为你比对最优组合")).toBeDefined();
  });

  it("should show loading state after clicking search", () => {
    render(<DealsPanel category="chinese" placeName="测试餐厅" onClose={vi.fn()} />);
    act(() => {
      fireEvent.click(screen.getByText("开始查询"));
    });
    expect(screen.getByText("正在检索美团、抖音、大众点评、淘宝闪购、闲鱼…")).toBeDefined();
  });

  it("should show deals result after search resolves", async () => {
    render(<DealsPanel category="bbq" placeName="烤肉店" onClose={vi.fn()} />);

    fireEvent.click(screen.getByText("开始查询"));

    // Result state appears once the (mocked) async search resolves.
    await waitFor(() => {
      expect(screen.getByText("收起")).toBeDefined();
    });
    expect(screen.getByText("AI 智能叠券建议")).toBeDefined();
    // Demo-data disclaimer is shown.
    expect(screen.getByText("比价为演示数据，仅供参考。")).toBeDefined();
  });

  it("should call onClose when close button is clicked", async () => {
    const onClose = vi.fn();
    render(<DealsPanel category="seafood" placeName="海鲜餐厅" onClose={onClose} />);

    fireEvent.click(screen.getByText("开始查询"));

    await waitFor(() => {
      expect(screen.getByText("收起")).toBeDefined();
    });

    fireEvent.click(screen.getByText("收起"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
