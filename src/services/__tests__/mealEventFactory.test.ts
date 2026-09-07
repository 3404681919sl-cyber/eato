import { describe, expect, it } from "vitest";
import {
  createCloudMealEvent,
  createMealEvent,
  type CreateMealEventInput,
} from "../mealEventFactory";

function createInput(overrides: Partial<CreateMealEventInput> = {}): CreateMealEventInput {
  return {
    title: "周末火锅局",
    city: "上海",
    area: "静安区",
    budget: { min: 80, max: 150 },
    candidateDateRange: { start: "2026-08-29", end: "2026-08-31" },
    participants: [
      { displayName: "小美" },
      { displayName: "阿帅", avatar: "https://example.com/shuai.png" },
      { displayName: "浩子" },
    ],
    ...overrides,
  };
}

describe("createMealEvent", () => {
  it("creates a collecting event with a creator and default profiles", () => {
    const result = createMealEvent(createInput(), {
      eventId: "event-1",
      participantIds: ["mei", "shuai", "hao"],
      now: "2026-08-27T00:00:00.000Z",
    });

    expect(result.issues).toEqual([]);
    expect(result.event).toMatchObject({
      id: "event-1",
      creatorId: "mei",
      status: "collecting",
      participantIds: ["mei", "shuai", "hao"],
      participants: [
        { id: "mei", displayName: "小美", role: "creator" },
        { id: "shuai", displayName: "阿帅", avatar: "https://example.com/shuai.png", role: "member" },
        { id: "hao", displayName: "浩子", role: "member" },
      ],
      preferences: {
        mei: { likedCuisines: [], dislikedCuisines: [], taboos: [], budget: { min: 80, max: 150 }, isFlexible: true },
        shuai: { likedCuisines: [], dislikedCuisines: [], taboos: [], budget: { min: 80, max: 150 }, isFlexible: true },
        hao: { likedCuisines: [], dislikedCuisines: [], taboos: [], budget: { min: 80, max: 150 }, isFlexible: true },
      },
      availabilities: [],
      candidates: [],
      votes: [],
      createdAt: "2026-08-27T00:00:00.000Z",
      updatedAt: "2026-08-27T00:00:00.000Z",
    });
  });

  it("does not create an event when member names are duplicated", () => {
    const result = createMealEvent(createInput({
      participants: [
        { displayName: "小美" },
        { displayName: " 小美 " },
        { displayName: "浩子" },
      ],
    }));

    expect(result.event).toBeNull();
    expect(result.issues).toContainEqual({
      field: "participants.1.displayName",
      message: "模拟成员昵称不能重复",
    });
  });

  it("does not create an event when the date range is reversed", () => {
    const result = createMealEvent(createInput({
      candidateDateRange: { start: "2026-08-31", end: "2026-08-29" },
    }));

    expect(result.event).toBeNull();
    expect(result.issues).toContainEqual({
      field: "candidateDateRange",
      message: "结束日期不能早于开始日期",
    });
  });

  it("does not create an event when a member name is blank", () => {
    const result = createMealEvent(createInput({
      participants: [
        { displayName: "小美" },
        { displayName: " " },
        { displayName: "浩子" },
      ],
    }));

    expect(result.event).toBeNull();
    expect(result.issues).toContainEqual({
      field: "participants.1.displayName",
      message: "请填写模拟成员昵称",
    });
  });

  it("does not create an event when the budget is negative", () => {
    const result = createMealEvent(createInput({ budget: { min: -1, max: 100 } }));

    expect(result.event).toBeNull();
    expect(result.issues).toContainEqual({
      field: "budget",
      message: "预算不能为负数",
    });
  });

  it("generates distinct IDs when no deterministic IDs are supplied", () => {
    const result = createMealEvent(createInput());

    expect(result.event?.id).toEqual(expect.any(String));
    expect(result.event?.participantIds).toHaveLength(3);
    expect(new Set(result.event?.participantIds).size).toBe(3);
  });

  it("returns domain validation issues before generating an event", () => {
    const result = createMealEvent(createInput({
      title: " ",
      budget: { min: 200, max: 100 },
      participants: [{ displayName: "小美" }, { displayName: "阿帅" }],
    }));

    expect(result.event).toBeNull();
    expect(result.issues).toContainEqual({ field: "title", message: "请填写饭局名称" });
    expect(result.issues).toContainEqual({ field: "budget", message: "最低预算不能高于最高预算" });
    expect(result.issues).toContainEqual({ field: "participants", message: "模拟饭局需要 3 至 8 名参与者" });
  });

  it("creates a cloud meal with only the signed-in creator instead of simulated members", () => {
    const creatorId = "00000000-0000-4000-8000-000000000001";
    const eventId = "00000000-0000-4000-8000-000000000002";

    const result = createCloudMealEvent({
      title: "云端周五火锅局",
      city: "上海",
      area: "静安区",
      budget: { min: 80, max: 150 },
      candidateDateRange: { start: "2026-08-29", end: "2026-08-31" },
      creator: { id: creatorId, displayName: "小美" },
    }, { eventId, now: "2026-08-28T00:00:00.000Z" });

    expect(result.issues).toEqual([]);
    expect(result.event).toMatchObject({
      id: eventId,
      creatorId,
      participantIds: [creatorId],
      participants: [{ id: creatorId, displayName: "小美", role: "creator" }],
      preferences: {
        [creatorId]: { likedCuisines: [], dislikedCuisines: [], taboos: [], budget: { min: 80, max: 150 }, isFlexible: true },
      },
    });
  });
});
