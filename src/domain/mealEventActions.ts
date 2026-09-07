import type { DecisionOption } from "./decisionEngine";
import {
  type DomainIssue,
  type MealEvent,
  type MealHistory,
  type Vote,
  transitionMealStatus,
} from "./meal";

export type MealEventActionResult = {
  event: MealEvent;
  issues: DomainIssue[];
};

export type MealHistoryInput = Omit<MealHistory, "completedAt">;

export function castVote(
  event: MealEvent,
  vote: Vote,
  now = new Date().toISOString(),
): MealEventActionResult {
  if (event.status !== "collecting" && event.status !== "deciding") {
    return fail(event, { field: "status", message: "当前饭局状态不能投票" });
  }
  if (!event.participantIds.includes(vote.participantId)) {
    return fail(event, { field: "participantId", message: "该成员不属于此饭局" });
  }
  if (!event.candidates.some((candidate) => candidate.id === vote.candidateId)) {
    return fail(event, { field: "candidateId", message: "该候选不属于此饭局" });
  }

  return succeed(event, {
    votes: [
      ...event.votes.filter((item) => item.participantId !== vote.participantId || item.candidateId !== vote.candidateId),
      { ...vote },
    ],
  }, now);
}

export function confirmDecision(
  event: MealEvent,
  option: DecisionOption,
  now = new Date().toISOString(),
): MealEventActionResult {
  if (event.status !== "deciding") {
    return fail(event, { field: "status", message: "当前饭局状态不能确认方案" });
  }
  if (!event.candidates.some((candidate) => candidate.id === option.candidateId)) {
    return fail(event, { field: "candidateId", message: "该候选不属于此饭局" });
  }
  if (!option.readyToConfirm || !hasFullAvailability(event, option.date, option.mealPeriod)) {
    return fail(event, { field: "decision", message: "该方案尚无全员共同可用时间" });
  }
  if (event.votes.some((vote) => vote.candidateId === option.candidateId && vote.value === "veto")) {
    return fail(event, { field: "votes", message: "该候选已有成员否决，不能确认" });
  }

  return succeed(event, {
    status: "confirmed",
    decision: {
      candidateId: option.candidateId,
      selectedDate: option.date,
      mealPeriod: option.mealPeriod,
      reasoning: option.reasons.join("；"),
      confirmedAt: now,
    },
  }, now);
}

export function returnToCollecting(
  event: MealEvent,
  now = new Date().toISOString(),
): MealEventActionResult {
  const result = transitionMealStatus(event, "collecting");
  return result.issues.length > 0
    ? result
    : { event: { ...result.event, updatedAt: now }, issues: [] };
}

export function recordMealHistory(
  event: MealEvent,
  history: MealHistoryInput,
  now = new Date().toISOString(),
): MealEventActionResult {
  if (event.status !== "confirmed" && event.status !== "completed") {
    return fail(event, { field: "status", message: "当前饭局状态不能记录饭后信息" });
  }
  if (history.actualSpend !== undefined && (!Number.isFinite(history.actualSpend) || history.actualSpend < 0)) {
    return fail(event, { field: "history.actualSpend", message: "实际花费必须是非负数" });
  }
  if (history.rating !== undefined && (!Number.isInteger(history.rating) || history.rating < 1 || history.rating > 5)) {
    return fail(event, { field: "history.rating", message: "评分必须是 1 到 5 的整数" });
  }
  if (event.history?.occurred && !history.occurred) {
    return fail(event, { field: "history.occurred", message: "已记录成行，不能改为未成行" });
  }

  return succeed(event, {
    ...(event.status === "confirmed" ? { status: "completed" } : {}),
    history: { ...history, completedAt: now },
  }, now);
}

function hasFullAvailability(
  event: MealEvent,
  date: string,
  mealPeriod: DecisionOption["mealPeriod"],
): boolean {
  const available = new Set(event.availabilities
    .filter((slot) => slot.date === date && slot.mealPeriod === mealPeriod)
    .map((slot) => slot.participantId));
  return event.participantIds.every((participantId) => available.has(participantId));
}

function succeed(
  event: MealEvent,
  patch: Partial<MealEvent>,
  now: string,
): MealEventActionResult {
  return { event: { ...event, ...patch, updatedAt: now }, issues: [] };
}

function fail(event: MealEvent, issue: DomainIssue): MealEventActionResult {
  return { event, issues: [issue] };
}
