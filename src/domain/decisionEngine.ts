import type { Availability, Candidate, MealEvent, PreferenceProfile } from "./meal";

export type ScoreBreakdown = {
  time: number;
  cuisine: number;
  budget: number;
  distance: number;
  freshness: number;
};

export type DecisionOption = {
  candidateId: string;
  date: string;
  mealPeriod: Availability["mealPeriod"];
  totalScore: number;
  scoreBreakdown: ScoreBreakdown;
  readyToConfirm: boolean;
  reasons: string[];
  conflicts: string[];
};

export type DecisionContext = {
  distanceScores?: Record<string, number>;
  freshnessScores?: Record<string, number>;
};

export const DECISION_WEIGHTS = {
  time: 0.35,
  cuisine: 0.25,
  budget: 0.15,
  distance: 0.15,
  freshness: 0.10,
} as const;

function intersects(values: string[], targets: string[]): boolean {
  return values.some((value) => targets.includes(value));
}

function meetsHardConstraints(candidate: Candidate, profiles: PreferenceProfile[]): boolean {
  return profiles.every((profile) => {
    const exceedsBudget = candidate.pricePerPerson !== undefined
      && profile.budget?.max !== undefined
      && candidate.pricePerPerson > profile.budget.max;
    return !intersects(candidate.cuisineTags, profile.taboos) && !exceedsBudget;
  });
}

function availableMembers(event: MealEvent, date: string, mealPeriod: Availability["mealPeriod"]): string[] {
  return [...new Set(event.availabilities
    .filter((slot) => slot.date === date && slot.mealPeriod === mealPeriod)
    .map((slot) => slot.participantId))];
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function cuisineScore(candidate: Candidate, profiles: PreferenceProfile[]): number {
  const liked = profiles.filter((profile) => intersects(candidate.cuisineTags, profile.likedCuisines)).length;
  const disliked = profiles.filter((profile) => intersects(candidate.cuisineTags, profile.dislikedCuisines)).length;
  return round1(Math.max(0, ((liked - disliked) / profiles.length) * 100));
}

function budgetScore(candidate: Candidate, profiles: PreferenceProfile[]): number {
  if (candidate.pricePerPerson === undefined) return 50;
  const ranges = profiles.map((profile) => profile.budget).filter((budget): budget is NonNullable<PreferenceProfile["budget"]> => Boolean(budget));
  if (ranges.length === 0) return 50;
  return ranges.every((budget) => candidate.pricePerPerson! >= budget.min && candidate.pricePerPerson! <= budget.max) ? 100 : 0;
}

export function rankMealOptions(event: MealEvent, context: DecisionContext = {}): DecisionOption[] {
  const profiles = event.participantIds
    .map((participantId) => event.preferences[participantId])
    .filter((profile): profile is PreferenceProfile => Boolean(profile));
  const candidates = event.candidates.filter((candidate) => meetsHardConstraints(candidate, profiles));
  const timeKeys = [...new Set(event.availabilities.map((slot) => `${slot.date}|${slot.mealPeriod}`))];

  const options = timeKeys.flatMap((key) => {
    const [date, mealPeriod] = key.split("|") as [string, Availability["mealPeriod"]];
    const members = availableMembers(event, date, mealPeriod);
    const timeScore = round1((members.length / event.participantIds.length) * 100);
    const readyToConfirm = members.length === event.participantIds.length;

    return candidates.map((candidate) => {
      const distanceScore = context.distanceScores?.[candidate.id] ?? 50;
      const freshnessScore = context.freshnessScores?.[candidate.id] ?? 50;
      const scoreBreakdown = {
        time: timeScore,
        cuisine: cuisineScore(candidate, profiles),
        budget: budgetScore(candidate, profiles),
        distance: distanceScore,
        freshness: freshnessScore,
      };
      const totalScore = round1(
        scoreBreakdown.time * DECISION_WEIGHTS.time
        + scoreBreakdown.cuisine * DECISION_WEIGHTS.cuisine
        + scoreBreakdown.budget * DECISION_WEIGHTS.budget
        + scoreBreakdown.distance * DECISION_WEIGHTS.distance
        + scoreBreakdown.freshness * DECISION_WEIGHTS.freshness,
      );
      const conflicts: string[] = [];
      if (candidate.pricePerPerson === undefined) conflicts.push("缺少人均消费数据，按中性分处理");
      if (context.distanceScores?.[candidate.id] === undefined) conflicts.push("缺少距离数据，按中性分处理");
      if (context.freshnessScores?.[candidate.id] === undefined) conflicts.push("缺少历史数据，按中性分处理");
      if (!readyToConfirm) conflicts.unshift("尚无全员共同可用时间");

      return {
        candidateId: candidate.id,
        date,
        mealPeriod,
        totalScore,
        scoreBreakdown,
        readyToConfirm,
        reasons: [readyToConfirm ? `${members.length} 位成员均可参加` : `${members.length} 位成员可参加`],
        conflicts,
      };
    });
  });

  return options
    .sort((left, right) => (
      right.totalScore - left.totalScore
      || Number(right.readyToConfirm) - Number(left.readyToConfirm)
      || right.scoreBreakdown.budget - left.scoreBreakdown.budget
      || left.candidateId.localeCompare(right.candidateId)
      || left.date.localeCompare(right.date)
      || left.mealPeriod.localeCompare(right.mealPeriod)
    ))
    .slice(0, 3);
}
