import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import DecisionOptionsPanel from "../DecisionOptionsPanel";
import type { MealEvent } from "@/domain/meal";

function createEvent(overrides: Partial<MealEvent> = {}): MealEvent {
  return {
    id: "event-1", title: "周末火锅局", city: "上海", area: "静安区", budget: { min: 80, max: 150 },
    participantIds: ["mei", "shuai", "hao"], candidateDateRange: { start: "2026-08-29", end: "2026-08-31" }, creatorId: "mei", status: "deciding",
    participants: [{ id: "mei", displayName: "小美", role: "creator" }, { id: "shuai", displayName: "阿帅", role: "member" }, { id: "hao", displayName: "阿豪", role: "member" }],
    availabilities: [
      { participantId: "mei", date: "2026-08-30", mealPeriod: "dinner" },
      { participantId: "shuai", date: "2026-08-30", mealPeriod: "dinner" },
      { participantId: "hao", date: "2026-08-30", mealPeriod: "dinner" },
    ],
    preferences: {
      mei: { likedCuisines: ["火锅"], dislikedCuisines: [], taboos: [], budget: { min: 80, max: 150 }, isFlexible: true },
      shuai: { likedCuisines: ["火锅"], dislikedCuisines: [], taboos: [], budget: { min: 80, max: 150 }, isFlexible: true },
      hao: { likedCuisines: ["火锅"], dislikedCuisines: [], taboos: [], budget: { min: 80, max: 150 }, isFlexible: true },
    },
    candidates: [{ id: "hotpot", eventId: "event-1", name: "川味火锅", kind: "restaurant", cuisineTags: ["火锅"], pricePerPerson: 120, offers: [] }],
    votes: [], createdAt: "2026-08-27T00:00:00.000Z", updatedAt: "2026-08-27T00:00:00.000Z", ...overrides,
  };
}

describe("DecisionOptionsPanel", () => {
  it("shows a transparent rule option and saves the selected member's vote", () => {
    const onSave = vi.fn();
    render(<DecisionOptionsPanel event={createEvent()} onSave={onSave} />);

    expect(screen.getByText("川味火锅")).toBeInTheDocument();
    expect(screen.getByText(/3 位成员均可参加/)).toBeInTheDocument();
    expect(screen.getByText(/缺少距离数据，按中性分处理/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "支持 川味火锅" }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      votes: [{ participantId: "mei", candidateId: "hotpot", value: "support" }],
    }));
  });

  it("confirms only a ready option", () => {
    const onSave = vi.fn();
    render(<DecisionOptionsPanel event={createEvent()} onSave={onSave} />);

    fireEvent.click(screen.getByRole("button", { name: "确认这个方案" }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      status: "confirmed", decision: expect.objectContaining({ candidateId: "hotpot" }),
    }));
  });

  it("limits cloud voting to the signed-in member and reserves confirmation for the creator", () => {
    const onSave = vi.fn();
    render(<DecisionOptionsPanel event={createEvent()} onSave={onSave} currentUserId="shuai" />);

    expect(screen.queryByRole("group", { name: "选择投票成员" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "支持 川味火锅" }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      votes: [{ participantId: "shuai", candidateId: "hotpot", value: "support" }],
    }));
    expect(screen.queryByRole("button", { name: "确认这个方案" })).not.toBeInTheDocument();
  });

  it("shows 口味待补充 when no participant has entered any cuisine preference", () => {
    const onSave = vi.fn();
    const event = createEvent({
      preferences: {
        mei: { likedCuisines: [], dislikedCuisines: [], taboos: [], budget: { min: 80, max: 150 }, isFlexible: true },
        shuai: { likedCuisines: [], dislikedCuisines: [], taboos: [], budget: { min: 80, max: 150 }, isFlexible: true },
        hao: { likedCuisines: [], dislikedCuisines: [], taboos: [], budget: { min: 80, max: 150 }, isFlexible: true },
      },
    });
    render(<DecisionOptionsPanel event={event} onSave={onSave} />);

    expect(screen.getByText("口味待补充")).toBeInTheDocument();
    expect(screen.queryByText("口味匹配")).not.toBeInTheDocument();
    expect(screen.queryByText("口味分歧")).not.toBeInTheDocument();
  });
});
