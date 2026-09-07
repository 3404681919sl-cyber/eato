import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import MealInviteJoinPanel from "../MealInviteJoinPanel";

describe("MealInviteJoinPanel", () => {
  it("joins the invited meal with a nickname and passes the resulting event id onward", async () => {
    const join = vi.fn(async () => "event-1");
    const onJoined = vi.fn();
    render(<MealInviteJoinPanel
      appUrl="https://eato.example/eato/app#invite=opaque-token"
      repository={{ join }}
      onJoined={onJoined}
    />);

    fireEvent.change(screen.getByLabelText("加入饭局时使用的昵称"), { target: { value: "小美" } });
    fireEvent.click(screen.getByRole("button", { name: "加入饭局" }));

    expect(await screen.findByRole("status")).toHaveTextContent("已加入饭局");
    expect(join).toHaveBeenCalledWith("https://eato.example/eato/app#invite=opaque-token", "小美");
    expect(onJoined).toHaveBeenCalledWith("event-1");
  });

  it("keeps the member name visible when joining fails", async () => {
    render(<MealInviteJoinPanel
      appUrl="https://eato.example/eato/app#invite=invalid-token"
      repository={{ join: async () => { throw new Error("邀请链接无效或已失效"); } }}
      onJoined={vi.fn()}
    />);

    const name = screen.getByLabelText("加入饭局时使用的昵称");
    fireEvent.change(name, { target: { value: "小美" } });
    fireEvent.click(screen.getByRole("button", { name: "加入饭局" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("邀请链接无效或已失效");
    expect(name).toHaveValue("小美");
  });
});
