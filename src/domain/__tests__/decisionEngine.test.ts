import { describe, expect, it } from "vitest";
import { rankMealOptions } from "../decisionEngine";
import type { Candidate, MealEvent, PreferenceProfile } from "../meal";

const memberIds = ["mei", "shuai", "hao"];

function preference(overrides: Partial<PreferenceProfile> = {}): PreferenceProfile {
  return {
    likedCuisines: ["hotpot"],
    dislikedCuisines: [],
    taboos: [],
    budget: { min: 80, max: 150 },
    isFlexible: false,
    ...overrides,
  };
}

function candidate(overrides: Partial<Candidate> = {}): Candidate {
  return {
    id: "hotpot",
    eventId: "event-1",
    name: "川味火锅",
    kind: "restaurant",
    cuisineTags: ["hotpot"],
    pricePerPerson: 100,
    offers: [],
    ...overrides,
  };
}

function createEvent(overrides: Partial<MealEvent> = {}): MealEvent {
  return {
    id: "event-1",
    title: "周末火锅局",
    city: "上海",
    area: "静安区",
    budget: { min: 80, max: 150 },
    participantIds: memberIds,
    candidateDateRange: { start: "2026-08-29", end: "2026-08-31" },
    creatorId: "mei",
    status: "deciding",
    participants: memberIds.map((id, index) => ({
      id,
      displayName: ["小美", "阿帅", "阿豪"][index],
      role: index === 0 ? "creator" : "member",
    })),
    availabilities: memberIds.map((participantId) => ({
      participantId,
      date: "2026-08-30",
      mealPeriod: "dinner",
    })),
    preferences: Object.fromEntries(memberIds.map((id) => [id, preference()])),
    candidates: [candidate()],
    votes: [],
    createdAt: "2026-08-27T00:00:00.000Z",
    updatedAt: "2026-08-27T00:00:00.000Z",
    ...overrides,
  };
}

describe("rankMealOptions", () => {
  it("excludes a candidate that conflicts with any member taboo", () => {
    const event = createEvent({
      candidates: [
        candidate(),
        candidate({ id: "seafood", name: "海鲜", cuisineTags: ["seafood"] }),
      ],
      preferences: {
        mei: preference(),
        shuai: preference(),
        hao: preference({ taboos: ["seafood"] }),
      },
    });

    expect(rankMealOptions(event).map((option) => option.candidateId)).toEqual(["hotpot"]);
  });

  it("excludes a candidate above any explicit participant budget", () => {
    const event = createEvent({
      candidates: [
        candidate(),
        candidate({ id: "expensive", name: "高价餐厅", pricePerPerson: 280 }),
      ],
    });

    expect(rankMealOptions(event).map((option) => option.candidateId)).toEqual(["hotpot"]);
  });

  it("marks an option ready to confirm only when every participant is available", () => {
    const [option] = rankMealOptions(createEvent());

    expect(option).toMatchObject({
      candidateId: "hotpot",
      date: "2026-08-30",
      mealPeriod: "dinner",
      readyToConfirm: true,
      scoreBreakdown: { time: 100 },
    });
    expect(option.reasons).toContain("3 位成员均可参加");
  });

  it("uses the configured five-part score and discloses missing distance and history data", () => {
    const [option] = rankMealOptions(createEvent());

    expect(option.scoreBreakdown).toEqual({
      time: 100,
      cuisine: 100,
      budget: 100,
      distance: 50,
      freshness: 50,
    });
    expect(option.totalScore).toBe(87.5);
    expect(option.conflicts).toEqual(expect.arrayContaining([
      "缺少距离数据，按中性分处理",
      "缺少历史数据，按中性分处理",
    ]));
  });

  it("lets each dislike offset one member's cuisine preference", () => {
    const event = createEvent({
      preferences: {
        mei: preference(),
        shuai: preference({ likedCuisines: [], dislikedCuisines: ["hotpot"] }),
        hao: preference(),
      },
    });

    expect(rankMealOptions(event)[0].scoreBreakdown.cuisine).toBe(33.3);
  });

  it("uses and discloses a neutral budget score when a candidate has no price data", () => {
    const [option] = rankMealOptions(createEvent({ candidates: [candidate({ pricePerPerson: undefined })] }));

    expect(option.scoreBreakdown.budget).toBe(50);
    expect(option.conflicts).toContain("缺少人均消费数据，按中性分处理");
  });

  it("uses supplied distance and freshness scores instead of missing-data defaults", () => {
    const [option] = rankMealOptions(createEvent(), {
      distanceScores: { hotpot: 80 },
      freshnessScores: { hotpot: 70 },
    });

    expect(option.scoreBreakdown).toMatchObject({ distance: 80, freshness: 70 });
    expect(option.totalScore).toBe(94);
    expect(option.conflicts).not.toContain("缺少距离数据，按中性分处理");
    expect(option.conflicts).not.toContain("缺少历史数据，按中性分处理");
  });

  it("returns coordination suggestions without automatic confirmation when there is no common time", () => {
    const event = createEvent({
      availabilities: [
        { participantId: "mei", date: "2026-08-30", mealPeriod: "dinner" },
        { participantId: "shuai", date: "2026-08-30", mealPeriod: "dinner" },
        { participantId: "hao", date: "2026-08-30", mealPeriod: "lunch" },
      ],
    });

    const options = rankMealOptions(event);

    expect(options).not.toHaveLength(0);
    expect(options.every((option) => !option.readyToConfirm)).toBe(true);
    expect(options[0].conflicts).toContain("尚无全员共同可用时间");
  });

  it("returns no more than three options in deterministic score order", () => {
    const event = createEvent({
      candidates: [
        candidate({ id: "hotpot" }),
        candidate({ id: "c-other", cuisineTags: ["other"] }),
        candidate({ id: "a-other", cuisineTags: ["other"] }),
        candidate({ id: "b-other", cuisineTags: ["other"] }),
      ],
    });

    expect(rankMealOptions(event).map((option) => option.candidateId)).toEqual([
      "hotpot",
      "a-other",
      "b-other",
    ]);
  });
});
