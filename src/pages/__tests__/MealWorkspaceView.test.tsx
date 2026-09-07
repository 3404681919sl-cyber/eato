import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import MealWorkspaceView from "../MealWorkspaceView";
import { LocalMealEventRepository } from "@/services/localMealEventRepository";
import type { MealEventRepository } from "@/services/mealEventRepository";
import { MealRealtimeSync } from "@/services/mealRealtimeSync";
import type { MealEvent } from "@/domain/meal";

function createEvent(overrides: Partial<MealEvent> = {}): MealEvent {
  return {
    id: "event-1",
    title: "周末火锅局",
    city: "上海",
    area: "静安区",
    budget: { min: 80, max: 150 },
    participantIds: ["mei", "shuai", "hao"],
    candidateDateRange: { start: "2026-08-29", end: "2026-08-31" },
    creatorId: "mei",
    status: "collecting",
    participants: [],
    availabilities: [],
    preferences: {},
    candidates: [],
    votes: [],
    createdAt: "2026-08-27T00:00:00.000Z",
    updatedAt: "2026-08-27T00:00:00.000Z",
    ...overrides,
  };
}

describe("MealWorkspaceView", () => {
  beforeEach(() => localStorage.clear());

  it("shows an empty-state action when no local meal exists", async () => {
    render(<MealWorkspaceView repository={new LocalMealEventRepository()} onCreate={vi.fn()} />);

    expect(await screen.findByText("还没有饭局")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "发起第一场饭局" })).toBeInTheDocument();
  });

  it("lists local meals by recent update and opens the selected meal", async () => {
    const repository = new LocalMealEventRepository();
    await repository.create(createEvent({ id: "older", title: "周五晚餐", updatedAt: "2026-08-27T10:00:00.000Z" }));
    await repository.create(createEvent({ id: "newer", title: "周末火锅局", updatedAt: "2026-08-27T12:00:00.000Z" }));

    render(<MealWorkspaceView repository={repository} />);

    const mealButtons = await screen.findAllByRole("button", { name: /周五晚餐|周末火锅局/ });
    expect(mealButtons[0]).toHaveAccessibleName(/周末火锅局/);
    expect(screen.getByRole("heading", { name: "周末火锅局" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "代填成员资料" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /周五晚餐/ }));

    expect(screen.getByRole("heading", { name: "周五晚餐" })).toBeInTheDocument();
  });

  it("shows reconfirmation and history controls for a confirmed meal", async () => {
    const repository = new LocalMealEventRepository();
    await repository.create(createEvent({
      status: "confirmed",
      candidates: [{ id: "hotpot", eventId: "event-1", name: "川味火锅", kind: "restaurant", cuisineTags: ["火锅"], offers: [] }],
      decision: { candidateId: "hotpot", selectedDate: "2026-08-30", mealPeriod: "dinner", reasoning: "全员可用" },
    }));

    render(<MealWorkspaceView repository={repository} />);

    expect(await screen.findByRole("heading", { name: "饭局已确认" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "重新协调" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "记录饭后结果" })).toBeInTheDocument();
  });

  it("reloads the complete event from the repository after a realtime notification", async () => {
    const realtime = { notify: null as ((event: { table: string; eventId?: string }) => void) | null };
    const realtimeSync = new MealRealtimeSync({
      subscribe(listener) {
        realtime.notify = listener;
        return () => { realtime.notify = null; };
      },
    });
    const initialEvent = createEvent();
    const refreshedEvent = createEvent({ title: "周末火锅局（已更新）" });
    const repository: MealEventRepository = {
      list: async () => [initialEvent],
      getById: async () => refreshedEvent,
      create: async (event) => event,
      save: async (event) => event,
      delete: async () => false,
    };

    render(<MealWorkspaceView repository={repository} realtimeSync={realtimeSync} />);
    await screen.findByRole("heading", { name: "周末火锅局" });
    realtime.notify?.({ table: "meal_votes", eventId: "event-1" });

    expect(await screen.findByRole("heading", { name: "周末火锅局（已更新）" })).toBeInTheDocument();
  });

  it("shows a recoverable message when realtime synchronization fails", async () => {
    const realtime = { reportError: null as (() => void) | null };
    const realtimeSync = new MealRealtimeSync({
      subscribe(_listener, onError) {
        realtime.reportError = onError;
        return () => { realtime.reportError = null; };
      },
    });
    const repository: MealEventRepository = {
      list: async () => [createEvent()],
      getById: async () => createEvent(),
      create: async (event) => event,
      save: async (event) => event,
      delete: async () => false,
    };

    render(<MealWorkspaceView repository={repository} realtimeSync={realtimeSync} />);
    await screen.findByRole("heading", { name: "周末火锅局" });
    act(() => { realtime.reportError?.(); });

    expect(await screen.findByRole("alert")).toHaveTextContent("云端饭局同步暂时不可用");
  });

  it("keeps the most recently requested complete event when realtime reads resolve out of order", async () => {
    const realtime = { notify: null as ((event: { table: string; eventId?: string }) => void) | null };
    const realtimeSync = new MealRealtimeSync({
      subscribe(listener) {
        realtime.notify = listener;
        return () => { realtime.notify = null; };
      },
    });
    let resolveFirst: ((event: MealEvent) => void) | undefined;
    let resolveSecond: ((event: MealEvent) => void) | undefined;
    const reads = [
      new Promise<MealEvent>((resolve) => { resolveFirst = resolve; }),
      new Promise<MealEvent>((resolve) => { resolveSecond = resolve; }),
    ];
    let readIndex = 0;
    const repository: MealEventRepository = {
      list: async () => [createEvent()],
      getById: () => reads[readIndex++],
      create: async (event) => event,
      save: async (event) => event,
      delete: async () => false,
    };

    render(<MealWorkspaceView repository={repository} realtimeSync={realtimeSync} />);
    await screen.findByRole("heading", { name: "周末火锅局" });
    realtime.notify?.({ table: "meal_votes", eventId: "event-1" });
    await waitFor(() => expect(readIndex).toBe(1));
    realtime.notify?.({ table: "meal_votes", eventId: "event-1" });
    await waitFor(() => expect(readIndex).toBe(2));

    await act(async () => { resolveSecond?.(createEvent({ title: "第二次读取" })); });
    expect(await screen.findByRole("heading", { name: "第二次读取" })).toBeInTheDocument();
    await act(async () => { resolveFirst?.(createEvent({ title: "过期读取" })); });

    expect(screen.getByRole("heading", { name: "第二次读取" })).toBeInTheDocument();
  });

  it("shows cloud synchronization status while a cloud refresh is in flight", async () => {
    const realtime = { notify: null as ((event: { table: string; eventId?: string }) => void) | null };
    const realtimeSync = new MealRealtimeSync({
      subscribe(listener) {
        realtime.notify = listener;
        return () => { realtime.notify = null; };
      },
    });
    let resolveRefresh: ((event: MealEvent) => void) | undefined;
    const repository: MealEventRepository = {
      list: async () => [createEvent()],
      getById: () => new Promise<MealEvent>((resolve) => { resolveRefresh = resolve; }),
      create: async (event) => event,
      save: async (event) => event,
      delete: async () => false,
    };

    render(<MealWorkspaceView repository={repository} realtimeSync={realtimeSync} mode="cloud" />);
    await screen.findByRole("heading", { name: "周末火锅局" });
    expect(screen.getByText("云端协作")).toBeInTheDocument();
    realtime.notify?.({ table: "meal_votes", eventId: "event-1" });

    expect(await screen.findByRole("status", { name: "正在同步云端饭局" })).toBeInTheDocument();
    await act(async () => { resolveRefresh?.(createEvent()); });
    await waitFor(() => expect(screen.queryByRole("status", { name: "正在同步云端饭局" })).not.toBeInTheDocument());
  });

  it("exposes the invite-link control only to the cloud meal creator", async () => {
    const repository = new LocalMealEventRepository();
    await repository.create(createEvent({ participants: [{ id: "mei", displayName: "小美", role: "creator" }] }));
    const createShareUrl = vi.fn(async () => "https://eato.example/eato/app#invite=opaque-token");

    render(<MealWorkspaceView
      repository={repository}
      mode="cloud"
      cloudUserId="mei"
      inviteRepository={{ createShareUrl }}
      inviteAppUrl="https://eato.example/eato/app"
    />);

    fireEvent.click(await screen.findByRole("button", { name: "生成邀请链接" }));

    expect(await screen.findByDisplayValue("https://eato.example/eato/app#invite=opaque-token")).toBeInTheDocument();
    expect(createShareUrl).toHaveBeenCalledWith("event-1", "https://eato.example/eato/app");
  });

  it("clears the synchronization status when leaving cloud realtime mode", async () => {
    const realtime = { notify: null as ((event: { table: string; eventId?: string }) => void) | null };
    const realtimeSync = new MealRealtimeSync({
      subscribe(listener) {
        realtime.notify = listener;
        return () => { realtime.notify = null; };
      },
    });
    const repository: MealEventRepository = {
      list: async () => [createEvent()],
      getById: () => new Promise<MealEvent>(() => {}),
      create: async (event) => event,
      save: async (event) => event,
      delete: async () => false,
    };
    const { rerender } = render(<MealWorkspaceView repository={repository} realtimeSync={realtimeSync} mode="cloud" />);
    await screen.findByRole("heading", { name: "周末火锅局" });
    realtime.notify?.({ table: "meal_votes", eventId: "event-1" });
    await screen.findByRole("status", { name: "正在同步云端饭局" });

    rerender(<MealWorkspaceView repository={repository} mode="local" />);

    await waitFor(() => expect(screen.queryByRole("status", { name: "正在同步云端饭局" })).not.toBeInTheDocument());
  });
});
