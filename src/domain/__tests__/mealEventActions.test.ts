import { describe, expect, it } from "vitest";
import type { DecisionOption } from "../decisionEngine";
import type { MealEvent, MealStatus, Vote } from "../meal";
import {
  castVote,
  confirmDecision,
  recordMealHistory,
  returnToCollecting,
} from "../mealEventActions";

const NOW = "2026-08-27T12:00:00.000Z";

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
    participants: [
      { id: "mei", displayName: "小美", role: "creator" },
      { id: "shuai", displayName: "阿帅", role: "member" },
      { id: "hao", displayName: "阿豪", role: "member" },
    ],
    availabilities: [
      { participantId: "mei", date: "2026-08-30", mealPeriod: "dinner" },
      { participantId: "shuai", date: "2026-08-30", mealPeriod: "dinner" },
      { participantId: "hao", date: "2026-08-30", mealPeriod: "dinner" },
    ],
    preferences: {},
    candidates: [
      { id: "hotpot", eventId: "event-1", name: "川味火锅", kind: "restaurant", cuisineTags: ["hotpot"], offers: [] },
      { id: "sushi", eventId: "event-1", name: "寿司", kind: "restaurant", cuisineTags: ["japanese"], offers: [] },
    ],
    votes: [],
    createdAt: "2026-08-27T00:00:00.000Z",
    updatedAt: "2026-08-27T00:00:00.000Z",
    ...overrides,
  };
}

function createOption(overrides: Partial<DecisionOption> = {}): DecisionOption {
  return {
    candidateId: "hotpot",
    date: "2026-08-30",
    mealPeriod: "dinner",
    totalScore: 90,
    scoreBreakdown: { time: 100, cuisine: 100, budget: 100, distance: 50, freshness: 50 },
    readyToConfirm: true,
    reasons: ["3 位成员均可参加"],
    conflicts: [],
    ...overrides,
  };
}

describe("castVote", () => {
  it("replaces a member's previous vote for the same candidate without changing the original event", () => {
    const originalVote: Vote = { participantId: "mei", candidateId: "hotpot", value: "neutral" };
    const event = createEvent({ votes: [originalVote] });

    const result = castVote(event, { participantId: "mei", candidateId: "hotpot", value: "support" }, NOW);

    expect(result.issues).toEqual([]);
    expect(result.event).not.toBe(event);
    expect(result.event.votes).toEqual([{ participantId: "mei", candidateId: "hotpot", value: "support" }]);
    expect(result.event.updatedAt).toBe(NOW);
    expect(event.votes).toEqual([originalVote]);
  });

  it("rejects votes from someone outside the meal", () => {
    const event = createEvent();

    const result = castVote(event, { participantId: "outside", candidateId: "hotpot", value: "support" }, NOW);

    expect(result.event).toBe(event);
    expect(result.issues).toContainEqual({ field: "participantId", message: "该成员不属于此饭局" });
  });

  it("rejects votes after the meal is completed", () => {
    const event = createEvent({ status: "completed" });

    const result = castVote(event, { participantId: "mei", candidateId: "hotpot", value: "support" }, NOW);

    expect(result.event).toBe(event);
    expect(result.issues).toContainEqual({ field: "status", message: "当前饭局状态不能投票" });
  });
});

describe("confirmDecision", () => {
  it("confirms a ready option and records its decision", () => {
    const event = createEvent({ status: "deciding" });

    const result = confirmDecision(event, createOption(), NOW);

    expect(result.issues).toEqual([]);
    expect(result.event).toMatchObject({
      status: "confirmed",
      decision: {
        candidateId: "hotpot",
        selectedDate: "2026-08-30",
        mealPeriod: "dinner",
        reasoning: "3 位成员均可参加",
        confirmedAt: NOW,
      },
      updatedAt: NOW,
    });
    expect(event.status).toBe("deciding");
  });

  it("does not confirm an option with a veto", () => {
    const event = createEvent({
      status: "deciding",
      votes: [{ participantId: "hao", candidateId: "hotpot", value: "veto", reason: "不吃辣" }],
    });

    const result = confirmDecision(event, createOption(), NOW);

    expect(result.event).toBe(event);
    expect(result.issues).toContainEqual({ field: "votes", message: "该候选已有成员否决，不能确认" });
  });

  it("does not confirm an option without a full availability intersection", () => {
    const event = createEvent({ status: "deciding" });

    const result = confirmDecision(event, createOption({ readyToConfirm: false }), NOW);

    expect(result.event).toBe(event);
    expect(result.issues).toContainEqual({ field: "decision", message: "该方案尚无全员共同可用时间" });
  });

  it("does not confirm a candidate outside the meal", () => {
    const event = createEvent({ status: "deciding" });

    const result = confirmDecision(event, createOption({ candidateId: "outside" }), NOW);

    expect(result.event).toBe(event);
    expect(result.issues).toContainEqual({ field: "candidateId", message: "该候选不属于此饭局" });
  });

  it("returns a confirmed meal to collection for a new decision", () => {
    const event = createEvent({ status: "confirmed" });

    const result = returnToCollecting(event, NOW);

    expect(result.issues).toEqual([]);
    expect(result.event).toMatchObject({ status: "collecting", updatedAt: NOW });
  });
});

describe("recordMealHistory", () => {
  it("completes a confirmed meal with a valid post-meal record", () => {
    const event = createEvent({ status: "confirmed" });

    const result = recordMealHistory(event, { occurred: true, actualSpend: 126, rating: 5, note: "下次还来" }, NOW);

    expect(result.issues).toEqual([]);
    expect(result.event).toMatchObject({
      status: "completed",
      history: { occurred: true, actualSpend: 126, rating: 5, note: "下次还来", completedAt: NOW },
      updatedAt: NOW,
    });
  });

  it("allows correcting a completed meal's history without changing its status", () => {
    const event = createEvent({
      status: "completed" as MealStatus,
      history: { occurred: true, actualSpend: 100, rating: 4, completedAt: "2026-08-27T00:00:00.000Z" },
    });

    const result = recordMealHistory(event, { occurred: true, actualSpend: 120, rating: 5 }, NOW);

    expect(result.issues).toEqual([]);
    expect(result.event).toMatchObject({ status: "completed", history: { actualSpend: 120, rating: 5, completedAt: NOW } });
  });

  it("rejects post-meal ratings outside one to five", () => {
    const event = createEvent({ status: "confirmed" });

    const result = recordMealHistory(event, { occurred: true, rating: 6 }, NOW);

    expect(result.event).toBe(event);
    expect(result.issues).toContainEqual({ field: "history.rating", message: "评分必须是 1 到 5 的整数" });
  });

  it("rejects a negative actual spend", () => {
    const event = createEvent({ status: "confirmed" });

    const result = recordMealHistory(event, { occurred: true, actualSpend: -1 }, NOW);

    expect(result.event).toBe(event);
    expect(result.issues).toContainEqual({ field: "history.actualSpend", message: "实际花费必须是非负数" });
  });
});
