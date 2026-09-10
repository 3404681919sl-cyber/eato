import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import MealCollectionPanel from "../MealCollectionPanel";
import type { MealEvent } from "@/domain/meal";

function createEvent(overrides: Partial<MealEvent> = {}): MealEvent {
  return {
    id: "event-1", title: "周末火锅局", city: "上海", area: "静安区", budget: { min: 80, max: 150 },
    participantIds: ["mei", "shuai", "hao"], candidateDateRange: { start: "2026-08-29", end: "2026-08-31" },
    creatorId: "mei", status: "collecting",
    participants: [
      { id: "mei", displayName: "小美", role: "creator" },
      { id: "shuai", displayName: "阿帅", role: "member" },
      { id: "hao", displayName: "阿豪", role: "member" },
    ],
    availabilities: [],
    preferences: {
      mei: { likedCuisines: [], dislikedCuisines: [], taboos: [], budget: { min: 80, max: 150 }, isFlexible: true },
      shuai: { likedCuisines: [], dislikedCuisines: [], taboos: [], budget: { min: 80, max: 150 }, isFlexible: true },
      hao: { likedCuisines: [], dislikedCuisines: [], taboos: [], budget: { min: 80, max: 150 }, isFlexible: true },
    },
    candidates: [], votes: [], createdAt: "2026-08-27T00:00:00.000Z", updatedAt: "2026-08-27T00:00:00.000Z", ...overrides,
  };
}

describe("MealCollectionPanel", () => {
  it("saves an availability for the selected simulated member", () => {
    const onSave = vi.fn();
    render(<MealCollectionPanel event={createEvent()} onSave={onSave} />);

    fireEvent.click(screen.getByRole("button", { name: "阿帅" }));
    fireEvent.click(screen.getByRole("button", { name: "2026-08-29 晚餐" }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      availabilities: [{ participantId: "shuai", date: "2026-08-29", mealPeriod: "dinner" }],
    }));
  });

  it("limits cloud collection to the signed-in member's own profile", () => {
    const onSave = vi.fn();
    render(<MealCollectionPanel event={createEvent()} onSave={onSave} currentUserId="shuai" />);

    expect(screen.queryByRole("group", { name: "选择代填成员" })).not.toBeInTheDocument();
    expect(screen.getByText("正在填写：阿帅")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "2026-08-29 晚餐" }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      availabilities: [{ participantId: "shuai", date: "2026-08-29", mealPeriod: "dinner" }],
    }));
    expect(screen.queryByRole("button", { name: "添加人工候选" })).not.toBeInTheDocument();
  });

  it("renders the inclusive candidate date range without shifting local dates", () => {
    render(<MealCollectionPanel event={createEvent()} onSave={vi.fn()} />);

    expect(screen.getByRole("button", { name: "2026-08-29 午餐" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2026-08-31 晚餐" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "2026-08-28 午餐" })).not.toBeInTheDocument();
  });

  it("keeps preference edits local until the member chooses to save them", () => {
    const onSave = vi.fn();
    render(<MealCollectionPanel event={createEvent()} onSave={onSave} />);

    fireEvent.change(screen.getByLabelText("喜欢菜系"), { target: { value: "火锅, 日料" } });

    expect(onSave).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "保存偏好" }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      preferences: expect.objectContaining({
        mei: expect.objectContaining({ likedCuisines: ["火锅", "日料"] }),
      }),
    }));
  });

  it("adds a manual candidate and prevents decision generation until collection is complete", () => {
    const onSave = vi.fn();
    render(<MealCollectionPanel event={createEvent()} onSave={onSave} />);

    fireEvent.click(screen.getByRole("button", { name: "生成规则方案" }));
    expect(screen.getByText("请至少添加一个人工候选")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("候选名称"), { target: { value: "川味火锅" } });
    fireEvent.change(screen.getByLabelText(/菜系标签/), { target: { value: "火锅" } });
    fireEvent.click(screen.getByRole("button", { name: "添加人工候选" }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      candidates: [expect.objectContaining({ name: "川味火锅", cuisineTags: ["火锅"] })],
    }));
  });

  it("shows candidates and member progress to a non-creator cloud member without management controls", () => {
    const onSave = vi.fn();
    const event = createEvent({
      candidates: [{ id: "c-1", eventId: "event-1", name: "火锅店", kind: "restaurant", cuisineTags: ["火锅"], offers: [] }],
      availabilities: [{ participantId: "shuai", date: "2026-08-29", mealPeriod: "lunch" }],
      preferences: {
        mei: { likedCuisines: ["粤菜"], dislikedCuisines: [], taboos: [], budget: { min: 80, max: 150 }, isFlexible: true },
        shuai: { likedCuisines: ["火锅"], dislikedCuisines: [], taboos: ["香菜"], budget: { min: 80, max: 150 }, isFlexible: true },
        hao: { likedCuisines: [], dislikedCuisines: [], taboos: [], budget: { min: 80, max: 150 }, isFlexible: true },
      },
    });
    render(<MealCollectionPanel event={event} onSave={onSave} currentUserId="shuai" />);

    expect(screen.getByText("候选方案")).toBeInTheDocument();
    expect(screen.getByText("火锅店")).toBeInTheDocument();
    expect(screen.getByText("成员进度")).toBeInTheDocument();
    expect(screen.getByText("小美")).toBeInTheDocument();

    expect(screen.queryByRole("button", { name: "添加人工候选" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "生成规则方案" })).not.toBeInTheDocument();
  });

  it("assigns a cloud UUID to manually added candidates so cloud save succeeds", () => {
    const onSave = vi.fn();
    render(<MealCollectionPanel event={createEvent()} onSave={onSave} currentUserId="mei" />);

    fireEvent.change(screen.getByLabelText("候选名称"), { target: { value: "川味火锅" } });
    fireEvent.change(screen.getByLabelText(/菜系标签/), { target: { value: "火锅" } });
    fireEvent.click(screen.getByRole("button", { name: "添加人工候选" }));

    const saved = onSave.mock.calls[0][0];
    const candidate = saved.candidates[saved.candidates.length - 1];
    expect(candidate.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

  it("treats a default budget alone as not having provided cuisine preferences", () => {
    const onSave = vi.fn();
    const event = createEvent({
      availabilities: [{ participantId: "mei", date: "2026-08-29", mealPeriod: "lunch" }],
      preferences: {
        mei: { likedCuisines: [], dislikedCuisines: [], taboos: [], budget: { min: 80, max: 150 }, isFlexible: true },
        shuai: { likedCuisines: [], dislikedCuisines: [], taboos: [], budget: { min: 80, max: 150 }, isFlexible: true },
        hao: { likedCuisines: [], dislikedCuisines: [], taboos: [], budget: { min: 80, max: 150 }, isFlexible: true },
      },
    });
    render(<MealCollectionPanel event={event} onSave={onSave} currentUserId="shuai" />);

    // mei provided a time slot (with only a default budget) → shows 已选时间 but NOT 已提供口味.
    expect(screen.getAllByText("✓ 已选时间", { exact: false }).length).toBeGreaterThan(0);
    expect(screen.getAllByText("○ 未提供口味", { exact: false }).length).toBeGreaterThan(0);
    expect(screen.queryByText("✓ 已提供口味", { exact: false })).not.toBeInTheDocument();
  });
});
