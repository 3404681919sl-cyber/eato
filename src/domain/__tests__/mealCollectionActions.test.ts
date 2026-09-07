import { describe, expect, it } from "vitest";
import type { MealEvent } from "../meal";
import {
  addManualCandidate,
  setParticipantAvailability,
  updateParticipantPreferences,
  beginDecision,
} from "../mealCollectionActions";

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
    availabilities: [],
    preferences: {
      mei: { likedCuisines: [], dislikedCuisines: [], taboos: [], budget: { min: 80, max: 150 }, isFlexible: true },
      shuai: { likedCuisines: [], dislikedCuisines: [], taboos: [], budget: { min: 80, max: 150 }, isFlexible: true },
      hao: { likedCuisines: [], dislikedCuisines: [], taboos: [], budget: { min: 80, max: 150 }, isFlexible: true },
    },
    candidates: [],
    votes: [],
    createdAt: "2026-08-27T00:00:00.000Z",
    updatedAt: "2026-08-27T00:00:00.000Z",
    ...overrides,
  };
}

describe("setParticipantAvailability", () => {
  it("adds and removes a member availability without mutating the original event", () => {
    const event = createEvent();
    const added = setParticipantAvailability(event, {
      participantId: "mei", date: "2026-08-30", mealPeriod: "dinner", available: true,
    }, NOW);
    const removed = setParticipantAvailability(added.event, {
      participantId: "mei", date: "2026-08-30", mealPeriod: "dinner", available: false,
    }, NOW);

    expect(added.issues).toEqual([]);
    expect(added.event.availabilities).toEqual([{ participantId: "mei", date: "2026-08-30", mealPeriod: "dinner" }]);
    expect(event.availabilities).toEqual([]);
    expect(removed.event.availabilities).toEqual([]);
  });

  it("rejects a time outside the candidate date range", () => {
    const event = createEvent();

    const result = setParticipantAvailability(event, {
      participantId: "mei", date: "2026-09-01", mealPeriod: "dinner", available: true,
    }, NOW);

    expect(result.event).toBe(event);
    expect(result.issues).toContainEqual({ field: "availability.date", message: "可用时间必须在候选日期范围内" });
  });
});

describe("updateParticipantPreferences", () => {
  it("updates one member profile with normalized tags", () => {
    const event = createEvent();

    const result = updateParticipantPreferences(event, "shuai", {
      likedCuisines: [" 火锅 ", "火锅"],
      dislikedCuisines: ["日料"],
      taboos: ["花生"],
      budget: { min: 100, max: 180 },
      isFlexible: false,
    }, NOW);

    expect(result.issues).toEqual([]);
    expect(result.event.preferences.shuai).toEqual({
      likedCuisines: ["火锅"], dislikedCuisines: ["日料"], taboos: ["花生"], budget: { min: 100, max: 180 }, isFlexible: false,
    });
    expect(event.preferences.shuai.isFlexible).toBe(true);
  });

  it("rejects a preference budget whose minimum exceeds its maximum", () => {
    const event = createEvent();

    const result = updateParticipantPreferences(event, "shuai", {
      likedCuisines: [], dislikedCuisines: [], taboos: [], budget: { min: 200, max: 100 }, isFlexible: true,
    }, NOW);

    expect(result.event).toBe(event);
    expect(result.issues).toContainEqual({ field: "preferences.budget", message: "最低预算不能高于最高预算" });
  });
});

describe("addManualCandidate and beginDecision", () => {
  it("adds a local manual candidate bound to the current event", () => {
    const event = createEvent();

    const result = addManualCandidate(event, {
      id: "candidate-1", name: "川味火锅", cuisineTags: ["火锅"], pricePerPerson: 128,
    }, NOW);

    expect(result.issues).toEqual([]);
    expect(result.event.candidates).toContainEqual({
      id: "candidate-1", eventId: "event-1", name: "川味火锅", kind: "restaurant", cuisineTags: ["火锅"], pricePerPerson: 128, offers: [],
    });
  });

  it("does not begin deciding until every member has at least one availability and a candidate exists", () => {
    const noCandidate = createEvent({
      availabilities: [
        { participantId: "mei", date: "2026-08-30", mealPeriod: "dinner" },
        { participantId: "shuai", date: "2026-08-30", mealPeriod: "dinner" },
        { participantId: "hao", date: "2026-08-30", mealPeriod: "dinner" },
      ],
    });
    const missingAvailability = createEvent({
      candidates: [{ id: "candidate-1", eventId: "event-1", name: "川味火锅", kind: "restaurant", cuisineTags: ["火锅"], offers: [] }],
      availabilities: [{ participantId: "mei", date: "2026-08-30", mealPeriod: "dinner" }],
    });

    expect(beginDecision(noCandidate, NOW).issues).toContainEqual({ field: "candidates", message: "请至少添加一个人工候选" });
    expect(beginDecision(missingAvailability, NOW).issues).toContainEqual({ field: "availabilities", message: "每位成员至少需要填写一个可用时间" });
  });

  it("moves a complete collection into deciding", () => {
    const event = createEvent({
      candidates: [{ id: "candidate-1", eventId: "event-1", name: "川味火锅", kind: "restaurant", cuisineTags: ["火锅"], offers: [] }],
      availabilities: [
        { participantId: "mei", date: "2026-08-30", mealPeriod: "dinner" },
        { participantId: "shuai", date: "2026-08-30", mealPeriod: "dinner" },
        { participantId: "hao", date: "2026-08-30", mealPeriod: "dinner" },
      ],
    });

    const result = beginDecision(event, NOW);

    expect(result.issues).toEqual([]);
    expect(result.event).toMatchObject({ status: "deciding", updatedAt: NOW });
  });
});
