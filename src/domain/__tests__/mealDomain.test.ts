import { describe, expect, it } from "vitest";
import {
  validateCandidate,
  validateMealDraft,
  type Candidate,
  type MealDraft,
  type MealEvent,
  type MealStatus,
  transitionMealStatus,
} from "../meal";

function createDraft(overrides: Partial<MealDraft> = {}): MealDraft {
  return {
    title: "周末火锅局",
    city: "上海",
    area: "静安区",
    budget: { min: 80, max: 150 },
    participantIds: ["mei", "shuai", "hao"],
    candidateDateRange: { start: "2026-08-29", end: "2026-08-31" },
    ...overrides,
  };
}

function createCandidate(overrides: Partial<Candidate> = {}): Candidate {
  return {
    id: "candidate-1",
    eventId: "event-1",
    name: "川味火锅",
    kind: "restaurant",
    cuisineTags: ["hotpot"],
    offers: [],
    ...overrides,
  };
}

function createEvent(status: MealStatus): MealEvent {
  return {
    ...createDraft(),
    id: "event-1",
    creatorId: "mei",
    status,
    participants: [],
    availabilities: [],
    preferences: {},
    candidates: [],
    votes: [],
    createdAt: "2026-08-27T00:00:00.000Z",
    updatedAt: "2026-08-27T00:00:00.000Z",
  };
}

describe("meal domain validation", () => {
  it("accepts a meal draft for three simulated participants", () => {
    expect(validateMealDraft(createDraft())).toEqual([]);
  });

  it("rejects a blank meal title", () => {
    expect(validateMealDraft(createDraft({ title: "  " }))).toContainEqual({
      field: "title",
      message: "请填写饭局名称",
    });
  });

  it("rejects a budget whose minimum exceeds its maximum", () => {
    expect(validateMealDraft(createDraft({ budget: { min: 200, max: 100 } }))).toContainEqual({
      field: "budget",
      message: "最低预算不能高于最高预算",
    });
  });

  it("requires between three and eight simulated participants", () => {
    expect(validateMealDraft(createDraft({ participantIds: ["mei", "shuai"] }))).toContainEqual({
      field: "participants",
      message: "模拟饭局需要 3 至 8 名参与者",
    });
    expect(validateMealDraft(createDraft({ participantIds: ["1", "2", "3", "4", "5", "6", "7", "8", "9"] }))).toContainEqual({
      field: "participants",
      message: "模拟饭局需要 3 至 8 名参与者",
    });
  });

  it("rejects candidates with more than three manual offers", () => {
    const offers = [1, 2, 3, 4].map((index) => ({
      platform: "manual",
      title: `优惠 ${index}`,
      price: 80,
      updatedAt: "2026-08-27T00:00:00.000Z",
    }));

    expect(validateCandidate(createCandidate({ offers }))).toContainEqual({
      field: "offers",
      message: "每个候选最多添加 3 条优惠信息",
    });
  });
});

describe("meal status transitions", () => {
  it("moves a draft meal into collection without mutating the original event", () => {
    const event = createEvent("draft");

    const result = transitionMealStatus(event, "collecting");

    expect(result.issues).toEqual([]);
    expect(result.event).not.toBe(event);
    expect(result.event.status).toBe("collecting");
    expect(event.status).toBe("draft");
  });

  it("allows a confirmed meal to return to collection for a new decision", () => {
    const result = transitionMealStatus(createEvent("confirmed"), "collecting");

    expect(result.issues).toEqual([]);
    expect(result.event.status).toBe("collecting");
  });

  it("keeps the original event when a transition skips required stages", () => {
    const event = createEvent("draft");

    const result = transitionMealStatus(event, "confirmed");

    expect(result.event).toBe(event);
    expect(result.issues).toContainEqual({
      field: "status",
      message: "当前饭局状态不能直接变更为 confirmed",
    });
  });
});
