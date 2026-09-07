import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import AppShell from "../AppShell";
import { DataProvider } from "@/services/DataProvider";

describe("AppShell", () => {
  beforeEach(() => localStorage.clear());

  it("labels the meal workspace as local simulation when cloud identity is not configured", async () => {
    render(<DataProvider><AppShell /></DataProvider>);

    expect(await screen.findByRole("status", { name: "本地模拟" })).toBeInTheDocument();
  });

  it("opens the incremental meal-creation view without replacing existing tabs", async () => {
    render(<DataProvider><AppShell /></DataProvider>);

    await screen.findByRole("status", { name: "本地模拟" });

    expect(screen.getByRole("button", { name: "打卡表" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "约饭时间" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "数据分析" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "发起饭局" }));

    expect(screen.getByRole("heading", { name: "发起一顿饭" })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("饭局名称"), { target: { value: "周五火锅局" } });
    fireEvent.click(screen.getByRole("button", { name: "创建并开始收集" }));

    expect(await screen.findByRole("heading", { name: "周五火锅局" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "代填成员资料" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "我的饭局" }));

    expect(await screen.findByRole("heading", { name: "周五火锅局" })).toBeInTheDocument();
  });
});
