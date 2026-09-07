import { describe, expect, it } from "vitest";
import type { MealEvent } from "@/domain/meal";
import { fromMealAccessRows, toMealAccessRows, type MealAccessRows } from "../mealAccessSchema";

const ids = {
  event: "00000000-0000-4000-8000-000000000001",
  mei: "00000000-0000-4000-8000-000000000002",
  shuai: "00000000-0000-4000-8000-000000000003",
  hao: "00000000-0000-4000-8000-000000000004",
  candidate: "00000000-0000-4000-8000-000000000005",
} as const;

function createEvent(): MealEvent {
  return {
    id: ids.event,
    creatorId: ids.mei,
    title: "周末火锅局",
    city: "上海",
    area: "静安区",
    budget: { min: 80, max: 150 },
    participantIds: [ids.mei, ids.shuai, ids.hao],
    candidateDateRange: { start: "2026-08-29", end: "2026-08-31" },
    status: "confirmed",
    participants: [
      { id: ids.mei, displayName: "小美", role: "creator" },
      { id: ids.shuai, displayName: "阿帅", avatar: "https://example.com/shuai.png", role: "member" },
      { id: ids.hao, displayName: "浩子", role: "member" },
    ],
    availabilities: [
      { participantId: ids.shuai, date: "2026-08-30", mealPeriod: "dinner" },
    ],
    preferences: {
      [ids.mei]: {
        likedCuisines: ["火锅"],
        dislikedCuisines: [],
        taboos: ["花生"],
        maxTravelMinutes: 30,
        budget: { min: 100, max: 180 },
        isFlexible: false,
      },
      [ids.shuai]: {
        likedCuisines: [],
        dislikedCuisines: ["日料"],
        taboos: [],
        isFlexible: true,
      },
      [ids.hao]: {
        likedCuisines: ["川菜"],
        dislikedCuisines: [],
        taboos: [],
        isFlexible: true,
      },
    },
    candidates: [{
      id: ids.candidate,
      eventId: ids.event,
      name: "沸腾里",
      kind: "restaurant",
      address: "静安区南京西路 100 号",
      cuisineTags: ["火锅", "川味"],
      pricePerPerson: 128,
      source: "manual",
      sourceUrl: "https://example.com/restaurant",
      offers: [{
        platform: "团购",
        title: "双人套餐",
        price: 199,
        url: "https://example.com/deal",
        note: "周末可用",
        updatedAt: "2026-08-28T00:00:00.000Z",
      }],
    }],
    votes: [{
      participantId: ids.shuai,
      candidateId: ids.candidate,
      value: "support",
      reason: "离公司近",
    }],
    decision: {
      candidateId: ids.candidate,
      selectedDate: "2026-08-30",
      mealPeriod: "dinner",
      reasoning: "大家时间重叠且预算合适",
      confidence: 0.92,
      confirmedAt: "2026-08-28T01:00:00.000Z",
    },
    history: {
      occurred: true,
      actualSpend: 138,
      rating: 5,
      note: "下次还来",
      completedAt: "2026-08-30T13:00:00.000Z",
    },
    createdAt: "2026-08-28T00:00:00.000Z",
    updatedAt: "2026-08-28T01:00:00.000Z",
  };
}

describe("toMealAccessRows", () => {
  it("keeps every cloud relation scoped to its event and owning user", () => {
    const rows = toMealAccessRows(createEvent());

    expect(rows).toEqual({
      event: {
        id: ids.event,
        creator_id: ids.mei,
        title: "周末火锅局",
        city: "上海",
        area: "静安区",
        budget_min: 80,
        budget_max: 150,
        candidate_date_start: "2026-08-29",
        candidate_date_end: "2026-08-31",
        status: "confirmed",
        created_at: "2026-08-28T00:00:00.000Z",
        updated_at: "2026-08-28T01:00:00.000Z",
      },
      members: [
        { event_id: ids.event, user_id: ids.mei, display_name: "小美", avatar_url: null, role: "creator" },
        { event_id: ids.event, user_id: ids.shuai, display_name: "阿帅", avatar_url: "https://example.com/shuai.png", role: "member" },
        { event_id: ids.event, user_id: ids.hao, display_name: "浩子", avatar_url: null, role: "member" },
      ],
      availabilities: [
        { event_id: ids.event, user_id: ids.shuai, available_date: "2026-08-30", meal_period: "dinner" },
      ],
      preferences: [
        {
          event_id: ids.event,
          user_id: ids.mei,
          liked_cuisines: ["火锅"],
          disliked_cuisines: [],
          taboos: ["花生"],
          max_travel_minutes: 30,
          budget_min: 100,
          budget_max: 180,
          is_flexible: false,
        },
        {
          event_id: ids.event,
          user_id: ids.shuai,
          liked_cuisines: [],
          disliked_cuisines: ["日料"],
          taboos: [],
          max_travel_minutes: null,
          budget_min: null,
          budget_max: null,
          is_flexible: true,
        },
        {
          event_id: ids.event,
          user_id: ids.hao,
          liked_cuisines: ["川菜"],
          disliked_cuisines: [],
          taboos: [],
          max_travel_minutes: null,
          budget_min: null,
          budget_max: null,
          is_flexible: true,
        },
      ],
      candidates: [{
        id: ids.candidate,
        event_id: ids.event,
        name: "沸腾里",
        kind: "restaurant",
        address: "静安区南京西路 100 号",
        cuisine_tags: ["火锅", "川味"],
        price_per_person: 128,
        source: "manual",
        source_url: "https://example.com/restaurant",
        offers: [{
          platform: "团购",
          title: "双人套餐",
          price: 199,
          url: "https://example.com/deal",
          note: "周末可用",
          updatedAt: "2026-08-28T00:00:00.000Z",
        }],
      }],
      votes: [{
        event_id: ids.event,
        user_id: ids.shuai,
        candidate_id: ids.candidate,
        value: "support",
        reason: "离公司近",
      }],
      decision: {
        event_id: ids.event,
        candidate_id: ids.candidate,
        selected_date: "2026-08-30",
        meal_period: "dinner",
        reasoning: "大家时间重叠且预算合适",
        confidence: 0.92,
        confirmed_at: "2026-08-28T01:00:00.000Z",
      },
      history: {
        event_id: ids.event,
        occurred: true,
        actual_spend: 138,
        rating: 5,
        note: "下次还来",
        completed_at: "2026-08-30T13:00:00.000Z",
      },
    });
  });

  it("rejects local simulated identities before they can become cloud rows", () => {
    const event = createEvent();
    event.creatorId = "mei";
    event.participants[0] = { ...event.participants[0], id: "mei" };
    event.participantIds[0] = "mei";
    event.preferences = {
      mei: event.preferences[ids.mei],
      [ids.shuai]: event.preferences[ids.shuai],
      [ids.hao]: event.preferences[ids.hao],
    };

    expect(() => toMealAccessRows(event)).toThrow("餐局创建者必须是云端 UUID 身份");
  });
});

describe("fromMealAccessRows", () => {
  it("rebuilds one complete meal event from rows that all belong to the same event", () => {
    const rows: MealAccessRows = {
      event: {
        id: ids.event,
        creator_id: ids.mei,
        title: "周末火锅局",
        city: "上海",
        area: "静安区",
        budget_min: 80,
        budget_max: 150,
        candidate_date_start: "2026-08-29",
        candidate_date_end: "2026-08-31",
        status: "confirmed",
        created_at: "2026-08-28T00:00:00.000Z",
        updated_at: "2026-08-28T01:00:00.000Z",
      },
      members: [
        { event_id: ids.event, user_id: ids.mei, display_name: "小美", avatar_url: null, role: "creator" },
        { event_id: ids.event, user_id: ids.shuai, display_name: "阿帅", avatar_url: "https://example.com/shuai.png", role: "member" },
        { event_id: ids.event, user_id: ids.hao, display_name: "浩子", avatar_url: null, role: "member" },
      ],
      availabilities: [{ event_id: ids.event, user_id: ids.shuai, available_date: "2026-08-30", meal_period: "dinner" }],
      preferences: [{
        event_id: ids.event,
        user_id: ids.shuai,
        liked_cuisines: ["火锅"],
        disliked_cuisines: ["日料"],
        taboos: ["花生"],
        max_travel_minutes: 30,
        budget_min: 100,
        budget_max: 180,
        is_flexible: false,
      }],
      candidates: [{
        id: ids.candidate,
        event_id: ids.event,
        name: "沸腾里",
        kind: "restaurant",
        address: "静安区南京西路 100 号",
        cuisine_tags: ["火锅", "川味"],
        price_per_person: 128,
        source: "manual",
        source_url: "https://example.com/restaurant",
        offers: [{ platform: "团购", title: "双人套餐", price: 199, updatedAt: "2026-08-28T00:00:00.000Z" }],
      }],
      votes: [{ event_id: ids.event, user_id: ids.shuai, candidate_id: ids.candidate, value: "support", reason: "离公司近" }],
      decision: {
        event_id: ids.event,
        candidate_id: ids.candidate,
        selected_date: "2026-08-30",
        meal_period: "dinner",
        reasoning: "大家时间重叠且预算合适",
        confidence: 0.92,
        confirmed_at: "2026-08-28T01:00:00.000Z",
      },
      history: {
        event_id: ids.event,
        occurred: true,
        actual_spend: 138,
        rating: 5,
        note: "下次还来",
        completed_at: "2026-08-30T13:00:00.000Z",
      },
    };

    expect(fromMealAccessRows(rows)).toEqual({
      id: ids.event,
      creatorId: ids.mei,
      title: "周末火锅局",
      city: "上海",
      area: "静安区",
      budget: { min: 80, max: 150 },
      participantIds: [ids.mei, ids.shuai, ids.hao],
      candidateDateRange: { start: "2026-08-29", end: "2026-08-31" },
      status: "confirmed",
      participants: [
        { id: ids.mei, displayName: "小美", role: "creator" },
        { id: ids.shuai, displayName: "阿帅", avatar: "https://example.com/shuai.png", role: "member" },
        { id: ids.hao, displayName: "浩子", role: "member" },
      ],
      availabilities: [{ participantId: ids.shuai, date: "2026-08-30", mealPeriod: "dinner" }],
      preferences: {
        [ids.shuai]: {
          likedCuisines: ["火锅"],
          dislikedCuisines: ["日料"],
          taboos: ["花生"],
          maxTravelMinutes: 30,
          budget: { min: 100, max: 180 },
          isFlexible: false,
        },
      },
      candidates: [{
        id: ids.candidate,
        eventId: ids.event,
        name: "沸腾里",
        kind: "restaurant",
        address: "静安区南京西路 100 号",
        cuisineTags: ["火锅", "川味"],
        pricePerPerson: 128,
        source: "manual",
        sourceUrl: "https://example.com/restaurant",
        offers: [{ platform: "团购", title: "双人套餐", price: 199, updatedAt: "2026-08-28T00:00:00.000Z" }],
      }],
      votes: [{ participantId: ids.shuai, candidateId: ids.candidate, value: "support", reason: "离公司近" }],
      decision: {
        candidateId: ids.candidate,
        selectedDate: "2026-08-30",
        mealPeriod: "dinner",
        reasoning: "大家时间重叠且预算合适",
        confidence: 0.92,
        confirmedAt: "2026-08-28T01:00:00.000Z",
      },
      history: {
        occurred: true,
        actualSpend: 138,
        rating: 5,
        note: "下次还来",
        completedAt: "2026-08-30T13:00:00.000Z",
      },
      createdAt: "2026-08-28T00:00:00.000Z",
      updatedAt: "2026-08-28T01:00:00.000Z",
    });
  });

  it("rejects a vote that points to a candidate outside the loaded meal", () => {
    const rows = toMealAccessRows(createEvent());
    rows.votes[0].candidate_id = "00000000-0000-4000-8000-000000000099";

    expect(() => fromMealAccessRows(rows)).toThrow("投票必须属于当前餐局候选项");
  });
});
