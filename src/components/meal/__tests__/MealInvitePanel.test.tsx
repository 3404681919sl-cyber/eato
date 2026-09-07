import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import MealInvitePanel from "../MealInvitePanel";

describe("MealInvitePanel", () => {
  afterEach(() => vi.restoreAllMocks());

  it("lets only the creator generate and rotate a fragment-only invite link", async () => {
    const createShareUrl = vi.fn()
      .mockResolvedValueOnce("https://eato.example/eato/app#invite=first-token")
      .mockResolvedValueOnce("https://eato.example/eato/app#invite=second-token");
    render(<MealInvitePanel eventId="event-1" isCreator repository={{ createShareUrl }} appUrl="https://eato.example/eato/app" />);

    fireEvent.click(screen.getByRole("button", { name: "生成邀请链接" }));

    expect(await screen.findByDisplayValue("https://eato.example/eato/app#invite=first-token")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "轮换邀请链接" }));
    expect(await screen.findByDisplayValue("https://eato.example/eato/app#invite=second-token")).toBeInTheDocument();
    expect(createShareUrl).toHaveBeenNthCalledWith(1, "event-1", "https://eato.example/eato/app");
    expect(createShareUrl).toHaveBeenNthCalledWith(2, "event-1", "https://eato.example/eato/app");
  });

  it("does not render an invite control for a non-creator", () => {
    render(<MealInvitePanel eventId="event-1" isCreator={false} repository={{ createShareUrl: vi.fn() }} appUrl="https://eato.example/eato/app" />);

    expect(screen.queryByRole("button", { name: "生成邀请链接" })).not.toBeInTheDocument();
  });

  it("copies the generated invite URL without exposing the token elsewhere", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    render(<MealInvitePanel eventId="event-1" isCreator repository={{ createShareUrl: async () => "https://eato.example/eato/app#invite=opaque-token" }} appUrl="https://eato.example/eato/app" />);

    fireEvent.click(screen.getByRole("button", { name: "生成邀请链接" }));
    fireEvent.click(await screen.findByRole("button", { name: "复制邀请链接" }));

    expect(await screen.findByRole("status")).toHaveTextContent("邀请链接已复制");
    expect(writeText).toHaveBeenCalledWith("https://eato.example/eato/app#invite=opaque-token");
  });
});
