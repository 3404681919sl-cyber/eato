import { describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import MealWorkspaceView from "../MealWorkspaceView";
import { DeveloperModeProvider } from "@/services/developerMode";
import type { MealEventRepository } from "@/services/mealEventRepository";
import type { MealRealtimeSync } from "@/services/mealRealtimeSync";
import type { MealEvent } from "@/domain/meal";

function fakeRepo(event: MealEvent): MealEventRepository {
  return {
    list: vi.fn().mockResolvedValue([event]),
    getById: vi.fn().mockResolvedValue(event),
    save: vi.fn().mockResolvedValue(event),
    create: vi.fn().mockResolvedValue(event),
  } as unknown as MealEventRepository;
}

function confirmedEvent(): MealEvent {
  return {
    id: "event-1", title: "周末火锅局", city: "上海", area: "静安区", budget: { min: 80, max: 150 },
    participantIds: ["mei", "shuai", "hao"], candidateDateRange: { start: "2026-08-29", end: "2026-08-31" },
    creatorId: "mei", status: "confirmed",
    participants: [
      { id: "mei", displayName: "小美", role: "creator" },
      { id: "shuai", displayName: "阿帅", role: "member" },
      { id: "hao", displayName: "阿豪", role: "member" },
    ],
    availabilities: [], preferences: {}, candidates: [], votes: [],
    decision: { candidateId: "hotpot", selectedDate: "2026-08-30", mealPeriod: "dinner", reasoning: "全员可用" },
    createdAt: "2026-08-27T00:00:00.000Z", updatedAt: "2026-08-27T00:00:00.000Z",
  };
}

describe("MealWorkspaceView", () => {
  it("renders a 3-step stepper (收集信息 → 共同决定 → 已确认)", async () => {
    render(
      <DeveloperModeProvider>
        <MealWorkspaceView repository={fakeRepo(confirmedEvent())} initialEventId="event-1" />
      </DeveloperModeProvider>,
    );

    expect(await screen.findByText("收集信息")).toBeInTheDocument();
    expect(screen.getByText("共同决定")).toBeInTheDocument();
    expect(screen.getByText("已确认")).toBeInTheDocument();
    // The old 4-step labels are gone.
    expect(screen.queryByText("收集中")).not.toBeInTheDocument();
    expect(screen.queryByText("选方案")).not.toBeInTheDocument();
    expect(screen.queryByText("投票")).not.toBeInTheDocument();
  });

  it("enters a pure result state on a confirmed event (no collection / consensus / invite)", async () => {
    render(
      <DeveloperModeProvider>
        <MealWorkspaceView
          repository={fakeRepo(confirmedEvent())}
          mode="cloud"
          cloudUserId="mei"
          initialEventId="event-1"
          inviteRepository={{ createShareUrl: vi.fn().mockResolvedValue("https://app/invite") }}
          inviteAppUrl="https://app/"
        />
      </DeveloperModeProvider>,
    );

    expect(await screen.findByText("就这么定了")).toBeInTheDocument();
    // Pre-sequence content must be gone; only the result card + creator post-meal record remain.
    expect(screen.queryByText("代填成员资料")).not.toBeInTheDocument();
    expect(screen.queryByText("成员进度")).not.toBeInTheDocument();
    expect(screen.queryByText("生成规则方案")).not.toBeInTheDocument();
    expect(screen.queryByText("添加人工候选")).not.toBeInTheDocument();
    expect(screen.queryByText("当前共识")).not.toBeInTheDocument();
    expect(screen.queryByText("把邀请链接发给朋友", { exact: false })).not.toBeInTheDocument();
  });

  // ── P1 realtime regression (底层行为，不受 UX 文案影响) ──

  function collectingEvent(): MealEvent {
    return {
      id: "event-1", title: "周末火锅局", city: "上海", area: "静安区", budget: { min: 80, max: 150 },
      participantIds: ["mei", "shuai", "hao"], candidateDateRange: { start: "2026-08-29", end: "2026-08-31" },
      creatorId: "mei", status: "collecting",
      participants: [
        { id: "mei", displayName: "小美", role: "creator" },
        { id: "shuai", displayName: "阿帅", role: "member" },
        { id: "hao", displayName: "阿豪", role: "member" },
      ],
      availabilities: [], preferences: {}, candidates: [], votes: [],
      createdAt: "2026-08-27T00:00:00.000Z", updatedAt: "2026-08-27T00:00:00.000Z",
    };
  }

  function controllableRepo(initial: MealEvent) {
    const list = vi.fn().mockResolvedValue([initial]);
    const resolvers: ((event: MealEvent) => void)[] = [];
    const getById = vi.fn((_id: string) => new Promise<MealEvent>((resolve) => resolvers.push(resolve)));
    const save = vi.fn().mockResolvedValue(initial);
    const create = vi.fn().mockResolvedValue(initial);
    return {
      repo: { list, getById, save, create } as unknown as MealEventRepository,
      resolveGetById: (event: MealEvent) => { const resolve = resolvers.pop(); resolve?.(event); },
    };
  }

  function controllableRealtime() {
    const refreshListeners: ((eventId: string) => void)[] = [];
    const errorListeners: (() => void)[] = [];
    const sync = {
      subscribe(onRefresh: (eventId: string) => void, onError: () => void = () => {}) {
        refreshListeners.push(onRefresh);
        errorListeners.push(onError);
        return () => {
          const i = refreshListeners.indexOf(onRefresh);
          if (i >= 0) refreshListeners.splice(i, 1);
          const j = errorListeners.indexOf(onError);
          if (j >= 0) errorListeners.splice(j, 1);
        };
      },
    };
    return {
      sync: sync as unknown as MealRealtimeSync,
      emit: (eventId: string) => refreshListeners.slice().forEach((listener) => listener(eventId)),
      emitError: () => errorListeners.slice().forEach((listener) => listener()),
    };
  }

  it("re-reads the full event after a realtime notification", async () => {
    const event = collectingEvent();
    const c = controllableRepo(event);
    const rt = controllableRealtime();
    render(
      <DeveloperModeProvider>
        <MealWorkspaceView repository={c.repo} realtimeSync={rt.sync} initialEventId="event-1" />
      </DeveloperModeProvider>,
    );
    expect(await screen.findByText("周末火锅局")).toBeInTheDocument();

    const updated = { ...event, participants: [...event.participants, { id: "new-1", displayName: "新朋友", role: "member" as const }] };
    await act(async () => { rt.emit("event-1"); });
    await act(async () => { c.resolveGetById(updated); });

    expect((await screen.findAllByText("新朋友")).length).toBeGreaterThan(0);
  });

  it("shows a recoverable notice when realtime sync errors, then clears it on a successful refresh", async () => {
    const event = collectingEvent();
    const c = controllableRepo(event);
    const rt = controllableRealtime();
    render(
      <DeveloperModeProvider>
        <MealWorkspaceView repository={c.repo} realtimeSync={rt.sync} initialEventId="event-1" />
      </DeveloperModeProvider>,
    );
    expect(await screen.findByText("周末火锅局")).toBeInTheDocument();

    await act(async () => { rt.emitError(); });
    expect(screen.getByText("云端饭局同步暂时不可用，请稍后重试")).toBeInTheDocument();

    const recovered = { ...event, participants: [...event.participants, { id: "rec-1", displayName: "恢复的饭友", role: "member" as const }] };
    await act(async () => { rt.emit("event-1"); });
    await act(async () => { c.resolveGetById(recovered); });

    await waitFor(() => expect(screen.queryByText("云端饭局同步暂时不可用，请稍后重试")).not.toBeInTheDocument());
    expect((await screen.findAllByText("恢复的饭友")).length).toBeGreaterThan(0);
  });

  it("keeps the latest result when two realtime reads resolve out of order", async () => {
    const event = collectingEvent();
    const c = controllableRepo(event);
    const rt = controllableRealtime();
    render(
      <DeveloperModeProvider>
        <MealWorkspaceView repository={c.repo} realtimeSync={rt.sync} initialEventId="event-1" />
      </DeveloperModeProvider>,
    );
    expect(await screen.findByText("周末火锅局")).toBeInTheDocument();

    const stale = { ...event, title: "版本一" };
    const latest = { ...event, title: "版本二" };
    await act(async () => { rt.emit("event-1"); }); // getById enqueued (version 1)
    await act(async () => { rt.emit("event-1"); }); // getById enqueued (version 2)
    await act(async () => { c.resolveGetById(latest); }); // latest read resolves first
    await act(async () => { c.resolveGetById(stale); }); // stale read resolves after, must be ignored

    expect(await screen.findByText("版本二")).toBeInTheDocument();
    expect(screen.queryByText("版本一")).not.toBeInTheDocument();
  });

  it("shows the realtime syncing status while a refresh is pending (developer-visible)", async () => {
    const event = collectingEvent();
    const c = controllableRepo(event);
    const rt = controllableRealtime();
    render(
      <DeveloperModeProvider>
        <MealWorkspaceView repository={c.repo} realtimeSync={rt.sync} developerMode initialEventId="event-1" />
      </DeveloperModeProvider>,
    );
    expect(await screen.findByText("周末火锅局")).toBeInTheDocument();

    await act(async () => { rt.emit("event-1"); });
    expect(screen.getByText("正在同步云端饭局…")).toBeInTheDocument();

    await act(async () => { c.resolveGetById({ ...event }); });
    await waitFor(() => expect(screen.queryByText("正在同步云端饭局…")).not.toBeInTheDocument());
  });

  it("renders the invite control only for the event creator", async () => {
    const event = collectingEvent(); // creatorId === "mei"
    const repo = fakeRepo(event);

    const { unmount } = render(
      <DeveloperModeProvider>
        <MealWorkspaceView
          repository={repo}
          mode="cloud"
          cloudUserId="mei"
          initialEventId="event-1"
          inviteRepository={{ createShareUrl: vi.fn().mockResolvedValue("https://app/invite") }}
          inviteAppUrl="https://app/"
        />
      </DeveloperModeProvider>,
    );
    expect(await screen.findByText("把邀请链接发给朋友", { exact: false })).toBeInTheDocument();

    unmount();
    render(
      <DeveloperModeProvider>
        <MealWorkspaceView
          repository={repo}
          mode="cloud"
          cloudUserId="shuai"
          initialEventId="event-1"
          inviteRepository={{ createShareUrl: vi.fn().mockResolvedValue("https://app/invite") }}
          inviteAppUrl="https://app/"
        />
      </DeveloperModeProvider>,
    );
    expect(await screen.findByText("周末火锅局")).toBeInTheDocument();
    expect(screen.queryByText("把邀请链接发给朋友", { exact: false })).not.toBeInTheDocument();
  });

  it("clears the syncing state when leaving realtime mode", async () => {
    const event = collectingEvent();
    const c = controllableRepo(event);
    const rt = controllableRealtime();
    const { rerender } = render(
      <DeveloperModeProvider>
        <MealWorkspaceView repository={c.repo} realtimeSync={rt.sync} developerMode initialEventId="event-1" />
      </DeveloperModeProvider>,
    );
    expect(await screen.findByText("周末火锅局")).toBeInTheDocument();

    await act(async () => { rt.emit("event-1"); });
    expect(screen.getByText("正在同步云端饭局…")).toBeInTheDocument();

    await act(async () => {
      rerender(
        <DeveloperModeProvider>
          <MealWorkspaceView repository={c.repo} developerMode initialEventId="event-1" />
        </DeveloperModeProvider>,
      );
    });
    expect(screen.queryByText("正在同步云端饭局…")).not.toBeInTheDocument();
  });
});
