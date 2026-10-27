import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import InterviewDemoPage from "../InterviewDemoPage";

describe("InterviewDemoPage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("opens immediately with synthetic participants and visible data limitations", () => {
    render(<InterviewDemoPage />);
    expect(screen.getByRole("heading", { name: /三个人的饭局/ })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "选择成员" })).toBeInTheDocument();
    expect(screen.getByText(/不提供真实餐厅实时报价/)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /确认 微光火锅（虚构）/ })[0]).toBeEnabled();
  });

  it("allows independent guest voting, enforces a veto, and resets the demo", () => {
    render(<InterviewDemoPage />);
    fireEvent.click(screen.getAllByRole("button", { name: /否决 微光火锅（虚构）/ })[0]);
    expect(screen.getAllByRole("button", { name: /确认 微光火锅（虚构）/ })[0]).toBeDisabled();

    fireEvent.click(screen.getAllByRole("button", { name: /支持 微光火锅（虚构）/ })[0]);
    expect(screen.getAllByRole("button", { name: /确认 微光火锅（虚构）/ })[0]).toBeEnabled();

    fireEvent.click(screen.getAllByRole("button", { name: /确认 微光火锅（虚构）/ })[0]);
    expect(screen.getByRole("heading", { name: "方案已确认" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "重新体验" }));
    expect(screen.getAllByRole("button", { name: /确认 微光火锅（虚构）/ })[0]).toBeEnabled();
  });

  it("recomputes the recommendation when time availability changes", () => {
    render(<InterviewDemoPage />);
    const dinnerButtons = screen.getAllByRole("button", { name: /晚餐/ });
    fireEvent.click(dinnerButtons[0]);
    expect(screen.getAllByRole("button", { name: /确认 微光火锅（虚构）/ })[0]).toBeDisabled();
  });
});
