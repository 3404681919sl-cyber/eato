export type MealStatus = "draft" | "collecting" | "deciding" | "confirmed" | "completed";
export type ParticipantRole = "creator" | "member";
export type CandidateKind = "restaurant" | "cuisine";
export type VoteValue = "support" | "neutral" | "veto";

export type DomainIssue = {
  field: string;
  message: string;
};

export type BudgetRange = {
  min: number;
  max: number;
};

export type DateRange = {
  start: string;
  end: string;
};

export type MealDraft = {
  title: string;
  city: string;
  area: string;
  budget: BudgetRange;
  participantIds: string[];
  candidateDateRange: DateRange;
};

export type Participant = {
  id: string;
  displayName: string;
  avatar?: string;
  role: ParticipantRole;
};

export type PreferenceProfile = {
  likedCuisines: string[];
  dislikedCuisines: string[];
  taboos: string[];
  maxTravelMinutes?: number;
  budget?: BudgetRange;
  isFlexible: boolean;
};

export type Availability = {
  participantId: string;
  date: string;
  mealPeriod: "lunch" | "afternoon" | "dinner";
};

export type Offer = {
  platform: string;
  title: string;
  price: number;
  url?: string;
  note?: string;
  updatedAt: string;
};

export type Candidate = {
  id: string;
  eventId: string;
  name: string;
  kind: CandidateKind;
  address?: string;
  cuisineTags: string[];
  pricePerPerson?: number;
  source?: string;
  sourceUrl?: string;
  offers: Offer[];
};

export type Vote = {
  participantId: string;
  candidateId: string;
  value: VoteValue;
  reason?: string;
};

export type Decision = {
  candidateId: string;
  selectedDate: string;
  mealPeriod: Availability["mealPeriod"];
  reasoning: string;
  confidence?: number;
  confirmedAt?: string;
};

export type MealHistory = {
  occurred: boolean;
  actualSpend?: number;
  rating?: number;
  note?: string;
  completedAt?: string;
};

export type MealEvent = MealDraft & {
  id: string;
  creatorId: string;
  status: MealStatus;
  participants: Participant[];
  availabilities: Availability[];
  preferences: Record<string, PreferenceProfile>;
  candidates: Candidate[];
  votes: Vote[];
  decision?: Decision;
  history?: MealHistory;
  createdAt: string;
  updatedAt: string;
};

export type MealTransitionResult = {
  event: MealEvent;
  issues: DomainIssue[];
};

export const MIN_SIMULATED_PARTICIPANTS = 3;
export const MAX_SIMULATED_PARTICIPANTS = 8;
export const MAX_OFFERS_PER_CANDIDATE = 3;

export function validateMealDraft(draft: MealDraft): DomainIssue[] {
  const issues: DomainIssue[] = [];

  if (!draft.title.trim()) {
    issues.push({ field: "title", message: "请填写饭局名称" });
  }

  if (draft.budget.min > draft.budget.max) {
    issues.push({ field: "budget", message: "最低预算不能高于最高预算" });
  }

  if (
    draft.participantIds.length < MIN_SIMULATED_PARTICIPANTS ||
    draft.participantIds.length > MAX_SIMULATED_PARTICIPANTS
  ) {
    issues.push({ field: "participants", message: "模拟饭局需要 3 至 8 名参与者" });
  }

  return issues;
}

export function validateCandidate(candidate: Candidate): DomainIssue[] {
  return candidate.offers.length > MAX_OFFERS_PER_CANDIDATE
    ? [{ field: "offers", message: "每个候选最多添加 3 条优惠信息" }]
    : [];
}

const ALLOWED_STATUS_TRANSITIONS: Record<MealStatus, MealStatus[]> = {
  draft: ["collecting"],
  collecting: ["deciding"],
  deciding: ["confirmed"],
  confirmed: ["collecting", "completed"],
  completed: [],
};

export function transitionMealStatus(
  event: MealEvent,
  nextStatus: MealStatus,
): MealTransitionResult {
  if (!ALLOWED_STATUS_TRANSITIONS[event.status].includes(nextStatus)) {
    return {
      event,
      issues: [{
        field: "status",
        message: `当前饭局状态不能直接变更为 ${nextStatus}`,
      }],
    };
  }

  return {
    event: { ...event, status: nextStatus },
    issues: [],
  };
}
