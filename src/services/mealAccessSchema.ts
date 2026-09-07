import type {
  Availability,
  Candidate,
  MealEvent,
  Offer,
  ParticipantRole,
  VoteValue,
} from "@/domain/meal";

export type MealEventRow = {
  id: string;
  creator_id: string;
  title: string;
  city: string;
  area: string;
  budget_min: number;
  budget_max: number;
  candidate_date_start: string;
  candidate_date_end: string;
  status: MealEvent["status"];
  created_at: string;
  updated_at: string;
};

export type MealMemberRow = {
  event_id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  role: ParticipantRole;
};

export type MealAvailabilityRow = {
  event_id: string;
  user_id: string;
  available_date: string;
  meal_period: Availability["mealPeriod"];
};

export type MealPreferenceRow = {
  event_id: string;
  user_id: string;
  liked_cuisines: string[];
  disliked_cuisines: string[];
  taboos: string[];
  max_travel_minutes: number | null;
  budget_min: number | null;
  budget_max: number | null;
  is_flexible: boolean;
};

export type MealCandidateRow = {
  id: string;
  event_id: string;
  name: string;
  kind: Candidate["kind"];
  address: string | null;
  cuisine_tags: string[];
  price_per_person: number | null;
  source: string | null;
  source_url: string | null;
  offers: Offer[];
};

export type MealVoteRow = {
  event_id: string;
  user_id: string;
  candidate_id: string;
  value: VoteValue;
  reason: string | null;
};

export type MealDecisionRow = {
  event_id: string;
  candidate_id: string;
  selected_date: string;
  meal_period: Availability["mealPeriod"];
  reasoning: string;
  confidence: number | null;
  confirmed_at: string | null;
};

export type MealHistoryRow = {
  event_id: string;
  occurred: boolean;
  actual_spend: number | null;
  rating: number | null;
  note: string | null;
  completed_at: string | null;
};

export type MealAccessRows = {
  event: MealEventRow;
  members: MealMemberRow[];
  availabilities: MealAvailabilityRow[];
  preferences: MealPreferenceRow[];
  candidates: MealCandidateRow[];
  votes: MealVoteRow[];
  decision: MealDecisionRow | null;
  history: MealHistoryRow | null;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function toMealAccessRows(event: MealEvent): MealAccessRows {
  assertCloudUuid(event.id, "餐局 ID");
  assertCloudUuid(event.creatorId, "餐局创建者");

  const memberIds = new Set(event.participants.map((participant) => participant.id));
  event.participantIds.forEach((participantId) => {
    assertCloudUuid(participantId, "餐局成员");
    if (!memberIds.has(participantId)) {
      throw new Error("餐局成员必须有对应的成员资料");
    }
  });

  event.participants.forEach((participant) => {
    assertCloudUuid(participant.id, "餐局成员");
  });

  if (!memberIds.has(event.creatorId)) {
    throw new Error("餐局创建者必须是餐局成员");
  }

  const candidateIds = new Set(event.candidates.map((candidate) => candidate.id));
  event.candidates.forEach((candidate) => assertCandidate(event.id, candidate));

  event.availabilities.forEach((availability) => {
    assertMember(memberIds, availability.participantId, "可用时间");
  });

  Object.entries(event.preferences).forEach(([userId]) => {
    assertMember(memberIds, userId, "偏好");
  });

  event.votes.forEach((vote) => {
    assertMember(memberIds, vote.participantId, "投票");
    if (!candidateIds.has(vote.candidateId)) {
      throw new Error("投票必须属于当前餐局候选项");
    }
  });

  if (event.decision && !candidateIds.has(event.decision.candidateId)) {
    throw new Error("决议必须属于当前餐局候选项");
  }

  return {
    event: {
      id: event.id,
      creator_id: event.creatorId,
      title: event.title,
      city: event.city,
      area: event.area,
      budget_min: event.budget.min,
      budget_max: event.budget.max,
      candidate_date_start: event.candidateDateRange.start,
      candidate_date_end: event.candidateDateRange.end,
      status: event.status,
      created_at: event.createdAt,
      updated_at: event.updatedAt,
    },
    members: event.participants.map((participant) => ({
      event_id: event.id,
      user_id: participant.id,
      display_name: participant.displayName,
      avatar_url: participant.avatar ?? null,
      role: participant.role,
    })),
    availabilities: event.availabilities.map((availability) => ({
      event_id: event.id,
      user_id: availability.participantId,
      available_date: availability.date,
      meal_period: availability.mealPeriod,
    })),
    preferences: Object.entries(event.preferences).map(([userId, preference]) => ({
      event_id: event.id,
      user_id: userId,
      liked_cuisines: [...preference.likedCuisines],
      disliked_cuisines: [...preference.dislikedCuisines],
      taboos: [...preference.taboos],
      max_travel_minutes: preference.maxTravelMinutes ?? null,
      budget_min: preference.budget?.min ?? null,
      budget_max: preference.budget?.max ?? null,
      is_flexible: preference.isFlexible,
    })),
    candidates: event.candidates.map((candidate) => ({
      id: candidate.id,
      event_id: event.id,
      name: candidate.name,
      kind: candidate.kind,
      address: candidate.address ?? null,
      cuisine_tags: [...candidate.cuisineTags],
      price_per_person: candidate.pricePerPerson ?? null,
      source: candidate.source ?? null,
      source_url: candidate.sourceUrl ?? null,
      offers: candidate.offers.map((offer) => ({ ...offer })),
    })),
    votes: event.votes.map((vote) => ({
      event_id: event.id,
      user_id: vote.participantId,
      candidate_id: vote.candidateId,
      value: vote.value,
      reason: vote.reason ?? null,
    })),
    decision: event.decision ? {
      event_id: event.id,
      candidate_id: event.decision.candidateId,
      selected_date: event.decision.selectedDate,
      meal_period: event.decision.mealPeriod,
      reasoning: event.decision.reasoning,
      confidence: event.decision.confidence ?? null,
      confirmed_at: event.decision.confirmedAt ?? null,
    } : null,
    history: event.history ? {
      event_id: event.id,
      occurred: event.history.occurred,
      actual_spend: event.history.actualSpend ?? null,
      rating: event.history.rating ?? null,
      note: event.history.note ?? null,
      completed_at: event.history.completedAt ?? null,
    } : null,
  };
}

export function fromMealAccessRows(rows: MealAccessRows): MealEvent {
  const { event } = rows;
  assertCloudUuid(event.id, "餐局 ID");
  assertCloudUuid(event.creator_id, "餐局创建者");
  assertRowsBelongToEvent(event.id, rows.members, "成员");
  assertRowsBelongToEvent(event.id, rows.availabilities, "可用时间");
  assertRowsBelongToEvent(event.id, rows.preferences, "偏好");
  assertRowsBelongToEvent(event.id, rows.candidates, "候选项");
  assertRowsBelongToEvent(event.id, rows.votes, "投票");
  if (rows.decision) assertRowBelongsToEvent(event.id, rows.decision.event_id, "决议");
  if (rows.history) assertRowBelongsToEvent(event.id, rows.history.event_id, "饭后记录");

  const memberIds = new Set<string>();
  rows.members.forEach((member) => {
    assertCloudUuid(member.user_id, "餐局成员");
    if (memberIds.has(member.user_id)) throw new Error("餐局成员不能重复");
    memberIds.add(member.user_id);
  });

  const creator = rows.members.find((member) => member.user_id === event.creator_id);
  if (!creator || creator.role !== "creator") {
    throw new Error("餐局创建者必须是创建者成员");
  }

  const candidateIds = new Set<string>();
  rows.candidates.forEach((candidate) => {
    assertCloudUuid(candidate.id, "候选项 ID");
    if (candidateIds.has(candidate.id)) throw new Error("候选项不能重复");
    candidateIds.add(candidate.id);
  });

  const availabilityKeys = new Set<string>();
  rows.availabilities.forEach((availability) => {
    assertMember(memberIds, availability.user_id, "可用时间");
    const key = `${availability.user_id}:${availability.available_date}:${availability.meal_period}`;
    if (availabilityKeys.has(key)) throw new Error("可用时间不能重复");
    availabilityKeys.add(key);
  });

  const preferenceIds = new Set<string>();
  rows.preferences.forEach((preference) => {
    assertMember(memberIds, preference.user_id, "偏好");
    if (preferenceIds.has(preference.user_id)) throw new Error("偏好不能重复");
    preferenceIds.add(preference.user_id);
  });

  const voteKeys = new Set<string>();
  rows.votes.forEach((vote) => {
    assertMember(memberIds, vote.user_id, "投票");
    if (!candidateIds.has(vote.candidate_id)) {
      throw new Error("投票必须属于当前餐局候选项");
    }
    const key = `${vote.user_id}:${vote.candidate_id}`;
    if (voteKeys.has(key)) throw new Error("投票不能重复");
    voteKeys.add(key);
  });

  if (rows.decision && !candidateIds.has(rows.decision.candidate_id)) {
    throw new Error("决议必须属于当前餐局候选项");
  }

  return {
    id: event.id,
    creatorId: event.creator_id,
    title: event.title,
    city: event.city,
    area: event.area,
    budget: { min: event.budget_min, max: event.budget_max },
    participantIds: rows.members.map((member) => member.user_id),
    candidateDateRange: { start: event.candidate_date_start, end: event.candidate_date_end },
    status: event.status,
    participants: rows.members.map((member) => ({
      id: member.user_id,
      displayName: member.display_name,
      ...(member.avatar_url ? { avatar: member.avatar_url } : {}),
      role: member.role,
    })),
    availabilities: rows.availabilities.map((availability) => ({
      participantId: availability.user_id,
      date: availability.available_date,
      mealPeriod: availability.meal_period,
    })),
    preferences: Object.fromEntries(rows.preferences.map((preference) => [preference.user_id, {
      likedCuisines: [...preference.liked_cuisines],
      dislikedCuisines: [...preference.disliked_cuisines],
      taboos: [...preference.taboos],
      ...(preference.max_travel_minutes === null ? {} : { maxTravelMinutes: preference.max_travel_minutes }),
      ...(preference.budget_min === null || preference.budget_max === null ? {} : {
        budget: { min: preference.budget_min, max: preference.budget_max },
      }),
      isFlexible: preference.is_flexible,
    }])),
    candidates: rows.candidates.map((candidate) => ({
      id: candidate.id,
      eventId: event.id,
      name: candidate.name,
      kind: candidate.kind,
      ...(candidate.address ? { address: candidate.address } : {}),
      cuisineTags: [...candidate.cuisine_tags],
      ...(candidate.price_per_person === null ? {} : { pricePerPerson: candidate.price_per_person }),
      ...(candidate.source ? { source: candidate.source } : {}),
      ...(candidate.source_url ? { sourceUrl: candidate.source_url } : {}),
      offers: candidate.offers.map((offer) => ({ ...offer })),
    })),
    votes: rows.votes.map((vote) => ({
      participantId: vote.user_id,
      candidateId: vote.candidate_id,
      value: vote.value,
      ...(vote.reason ? { reason: vote.reason } : {}),
    })),
    ...(rows.decision ? {
      decision: {
        candidateId: rows.decision.candidate_id,
        selectedDate: rows.decision.selected_date,
        mealPeriod: rows.decision.meal_period,
        reasoning: rows.decision.reasoning,
        ...(rows.decision.confidence === null ? {} : { confidence: rows.decision.confidence }),
        ...(rows.decision.confirmed_at === null ? {} : { confirmedAt: rows.decision.confirmed_at }),
      },
    } : {}),
    ...(rows.history ? {
      history: {
        occurred: rows.history.occurred,
        ...(rows.history.actual_spend === null ? {} : { actualSpend: rows.history.actual_spend }),
        ...(rows.history.rating === null ? {} : { rating: rows.history.rating }),
        ...(rows.history.note ? { note: rows.history.note } : {}),
        ...(rows.history.completed_at === null ? {} : { completedAt: rows.history.completed_at }),
      },
    } : {}),
    createdAt: event.created_at,
    updatedAt: event.updated_at,
  };
}

function assertCandidate(eventId: string, candidate: Candidate): void {
  assertCloudUuid(candidate.id, "候选项 ID");
  if (candidate.eventId !== eventId) {
    throw new Error("候选项必须属于当前餐局");
  }
}

function assertRowsBelongToEvent(
  eventId: string,
  rows: Array<{ event_id: string }>,
  recordName: string,
): void {
  rows.forEach((row) => assertRowBelongsToEvent(eventId, row.event_id, recordName));
}

function assertRowBelongsToEvent(eventId: string, rowEventId: string, recordName: string): void {
  if (rowEventId !== eventId) throw new Error(`${recordName}必须属于当前餐局`);
}

function assertMember(memberIds: Set<string>, userId: string, recordName: string): void {
  assertCloudUuid(userId, `${recordName}成员`);
  if (!memberIds.has(userId)) {
    throw new Error(`${recordName}必须属于当前餐局成员`);
  }
}

function assertCloudUuid(value: string, label: string): void {
  if (!UUID_PATTERN.test(value)) {
    throw new Error(`${label}必须是云端 UUID 身份`);
  }
}
