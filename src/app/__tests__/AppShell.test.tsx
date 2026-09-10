import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import AppShell from "../AppShell";
import { DataProvider } from "@/services/DataProvider";
import { DeveloperModeProvider } from "@/services/developerMode";

vi.mock("@/hooks/useIdentity", () => ({
  useIdentity: () => ({ mode: "local", status: "ready", userId: "local-1" }),
}));

function renderAppShell(dev = false) {
  if (dev) localStorage.setItem("developerMode", "true");
  return render(
    <DeveloperModeProvider>
      <DataProvider>
        <AppShell />
      </DataProvider>
    </DeveloperModeProvider>,
  );
}

describe("AppShell", () => {
  beforeEach(() => localStorage.clear());

  it("hides the technical session status for normal users", async () => {
    renderAppShell();

    // The 云端访客 / 本地模拟 status is dev-only; a normal user never sees it.
    expect(screen.queryByRole("status", { name: "本地模拟" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "开发者模式" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Dev Lab" })).not.toBeInTheDocument();
  });

  it("opens the meal-creation view from the primary action and returns to the dashboard (Developer Mode local simulation)", async () => {
    renderAppShell(true);

    expect(screen.getByRole("button", { name: "我的饭局" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "发起饭局" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "发起饭局" }));

    expect(await screen.findByRole("heading", { name: "发起一顿饭" })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("饭局名称"), { target: { value: "周五火锅局" } });
    fireEvent.click(screen.getByRole("button", { name: "创建饭局" }));

    expect(await screen.findByRole("heading", { name: "周五火锅局" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "代填成员资料" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "我的饭局" }));

    expect(await screen.findByText("周五火锅局")).toBeInTheDocument();
  });

  it("does not let a normal user fall into a non-invitable local simulation", async () => {
    // Normal user, identity not cloud-ready (no cloud session) → natural unavailable notice,
    // creation is disabled, and the local simulation is never presented as a product.
    renderAppShell();

    expect(await screen.findByText("云端饭局暂不可用，请稍后重试")).toBeInTheDocument();
    const createButton = screen.getByRole("button", { name: "发起饭局" });
    expect(createButton).toBeDisabled();

    fireEvent.click(createButton);
    expect(screen.queryByRole("heading", { name: "发起一顿饭" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "开发者模式" })).not.toBeInTheDocument();
  });

  it("enables Developer Mode via ?dev=1, persists it, and strips the param from the URL", async () => {
    window.history.replaceState(null, "", "/app?dev=1");
    renderAppShell();

    expect(await screen.findByRole("button", { name: "开发者模式" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dev Lab" })).toBeInTheDocument();
    expect(localStorage.getItem("developerMode")).toBe("true");
    // The activation param must be removed so a later refresh cannot reopen Dev Mode on its own.
    expect(window.location.search).not.toContain("dev");
    window.history.replaceState(null, "", "/app");
  });

  it("remembers Developer Mode from a previous session via localStorage", async () => {
    renderAppShell(true);

    expect(await screen.findByRole("button", { name: "开发者模式" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dev Lab" })).toBeInTheDocument();
  });

  it("lets a developer turn Developer Mode off from the UI", async () => {
    renderAppShell(true);

    const toggle = await screen.findByRole("button", { name: "开发者模式" });
    fireEvent.click(toggle);

    expect(screen.queryByRole("button", { name: "开发者模式" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Dev Lab" })).not.toBeInTheDocument();
    expect(localStorage.getItem("developerMode")).toBeNull();
  });
});
