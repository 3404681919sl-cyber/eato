import type { MealEventActionResult } from "./mealEventActions";
import {
  type Availability,
  type Candidate,
  type DomainIssue,
  type MealEvent,
  type PreferenceProfile,
  transitionMealStatus,
} from "./meal";

export type AvailabilitySelection = Availability & {
  available: boolean;
};

export type ManualCandidateInput = {
  id: string;
  name: string;
  cuisineTags: string[];
  pricePerPerson?: number;
  address?: string;
};

export function setParticipantAvailability(
  event: MealEvent,
  selection: AvailabilitySelection,
  now = new Date().toISOString(),
): MealEventActionResult {
  const issue = collectionIssue(event, selection.participantId);
  if (issue) return fail(event, issue);
  if (selection.date < event.candidateDateRange.start || selection.date > event.candidateDateRange.end) {
    return fail(event, { field: "availability.date", message: "可用时间必须在候选日期范围内" });
  }

  const sameSlot = (slot: Availability) => (
    slot.participantId === selection.participantId
    && slot.date === selection.date
    && slot.mealPeriod === selection.mealPeriod
  );
  const existing = event.availabilities.some(sameSlot);
  const availabilities = selection.available
    ? (existing ? event.availabilities : [...event.availabilities, withoutAvailable(selection)])
    : event.availabilities.filter((slot) => !sameSlot(slot));

  return succeed(event, { availabilities }, now);
}

export function updateParticipantPreferences(
  event: MealEvent,
  participantId: string,
  profile: PreferenceProfile,
  now = new Date().toISOString(),
): MealEventActionResult {
  const issue = collectionIssue(event, participantId);
  if (issue) return fail(event, issue);
  if (profile.budget && (profile.budget.min < 0 || profile.budget.max < 0)) {
    return fail(event, { field: "preferences.budget", message: "预算不能为负数" });
  }
  if (profile.budget && profile.budget.min > profile.budget.max) {
    return fail(event, { field: "preferences.budget", message: "最低预算不能高于最高预算" });
  }

  return succeed(event, {
    preferences: {
      ...event.preferences,
      [participantId]: {
        likedCuisines: normalizeTags(profile.likedCuisines),
        dislikedCuisines: normalizeTags(profile.dislikedCuisines),
        taboos: normalizeTags(profile.taboos),
        ...(profile.maxTravelMinutes === undefined ? {} : { maxTravelMinutes: profile.maxTravelMinutes }),
        ...(profile.budget === undefined ? {} : { budget: { ...profile.budget } }),
        isFlexible: profile.isFlexible,
      },
    },
  }, now);
}

export function addManualCandidate(
  event: MealEvent,
  input: ManualCandidateInput,
  now = new Date().toISOString(),
): MealEventActionResult {
  const issue = collectionIssue(event);
  if (issue) return fail(event, issue);
  if (!input.name.trim()) return fail(event, { field: "candidate.name", message: "请填写候选名称" });
  const cuisineTags = normalizeTags(input.cuisineTags);
  if (cuisineTags.length === 0) return fail(event, { field: "candidate.cuisineTags", message: "请至少填写一个菜系标签" });
  if (input.pricePerPerson !== undefined && (!Number.isFinite(input.pricePerPerson) || input.pricePerPerson < 0)) {
    return fail(event, { field: "candidate.pricePerPerson", message: "人均消费必须是非负数" });
  }
  if (event.candidates.some((candidate) => candidate.id === input.id)) {
    return fail(event, { field: "candidate.id", message: "候选 ID 已存在" });
  }

  const candidate: Candidate = {
    id: input.id,
    eventId: event.id,
    name: input.name.trim(),
    kind: "restaurant",
    ...(input.address?.trim() ? { address: input.address.trim() } : {}),
    cuisineTags,
    ...(input.pricePerPerson === undefined ? {} : { pricePerPerson: input.pricePerPerson }),
    offers: [],
  };
  return succeed(event, { candidates: [...event.candidates, candidate] }, now);
}

export function beginDecision(
  event: MealEvent,
  now = new Date().toISOString(),
): MealEventActionResult {
  if (event.status !== "collecting") {
    return fail(event, { field: "status", message: "当前饭局状态不能生成方案" });
  }
  if (event.candidates.length === 0) {
    return fail(event, { field: "candidates", message: "请至少添加一个人工候选" });
  }
  const membersWithAvailability = new Set(event.availabilities.map((slot) => slot.participantId));
  if (!event.participantIds.every((participantId) => membersWithAvailability.has(participantId))) {
    return fail(event, { field: "availabilities", message: "每位成员至少需要填写一个可用时间" });
  }

  const result = transitionMealStatus(event, "deciding");
  return result.issues.length > 0 ? result : { event: { ...result.event, updatedAt: now }, issues: [] };
}

function collectionIssue(event: MealEvent, participantId?: string): DomainIssue | null {
  if (event.status !== "collecting" && event.status !== "deciding") {
    return { field: "status", message: "当前饭局状态不能编辑收集信息" };
  }
  return participantId && !event.participantIds.includes(participantId)
    ? { field: "participantId", message: "该成员不属于此饭局" }
    : null;
}

function withoutAvailable({ available: _available, ...slot }: AvailabilitySelection): Availability {
  return slot;
}

function normalizeTags(tags: string[]): string[] {
  return [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))];
}

function succeed(event: MealEvent, patch: Partial<MealEvent>, now: string): MealEventActionResult {
  return { event: { ...event, ...patch, updatedAt: now }, issues: [] };
}

function fail(event: MealEvent, issue: DomainIssue): MealEventActionResult {
  return { event, issues: [issue] };
}
