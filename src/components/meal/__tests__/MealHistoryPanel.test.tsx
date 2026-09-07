import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import MealHistoryPanel from "../MealHistoryPanel";
import type { MealEvent } from "@/domain/meal";

function createConfirmedEvent(overrides: Partial<MealEvent> = {}): MealEvent {
  return {
    id: "event-1", title: "周末火锅局", city: "上海", area: "静安区", budget: { min: 80, max: 150 },
    participantIds: ["mei", "shuai", "hao"], candidateDateRange: { start: "2026-08-29", end: "2026-08-31" },
    creatorId: "mei", status: "confirmed",
    participants: [], availabilities: [], preferences: {},
    candidates: [{ id: "hotpot", eventId: "event-1", name: "川味火锅", kind: "restaurant", cuisineTags: ["火锅"], pricePerPerson: 120, offers: [] }],
    votes: [],
    decision: { candidateId: "hotpot", selectedDate: "2026-08-30", mealPeriod: "dinner", reasoning: "全员可用" },
    createdAt: "2026-08-27T00:00:00.000Z", updatedAt: "2026-08-27T00:00:00.000Z",
    ...overrides,
  };
}

describe("MealHistoryPanel", () => {
  it("records a completed meal with actual results", () => {
    const onSave = vi.fn();
    render(<MealHistoryPanel event={createConfirmedEvent()} onSave={onSave} />);

    fireEvent.change(screen.getByLabelText("实际人均消费"), { target: { value: "128" } });
    fireEvent.change(screen.getByLabelText("本次评分"), { target: { value: "5" } });
    fireEvent.change(screen.getByLabelText("饭后备注"), { target: { value: "下次还来" } });
    fireEvent.click(screen.getByRole("button", { name: "记录饭后结果" }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      status: "completed",
      history: expect.objectContaining({ occurred: true, actualSpend: 128, rating: 5, note: "下次还来" }),
    }));
  });

  it("returns a confirmed meal to collection when coordination changes", () => {
    const onSave = vi.fn();
    render(<MealHistoryPanel event={createConfirmedEvent()} onSave={onSave} />);

    fireEvent.click(screen.getByRole("button", { name: "重新协调" }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ status: "collecting" }));
  });

  it("shows a confirmed meal to a cloud member without management controls", () => {
    render(<MealHistoryPanel event={createConfirmedEvent()} onSave={vi.fn()} currentUserId="shuai" />);

    expect(screen.getByRole("heading", { name: "饭局已确认" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "重新协调" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "记录饭后结果" })).not.toBeInTheDocument();
  });
});
