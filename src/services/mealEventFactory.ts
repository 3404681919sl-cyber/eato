import {
  type BudgetRange,
  type DateRange,
  type DomainIssue,
  type MealEvent,
  type Participant,
  type PreferenceProfile,
  validateMealDraft,
} from "@/domain/meal";

export type SimulatedParticipantInput = {
  displayName: string;
  avatar?: string;
};

export type CreateMealEventInput = {
  title: string;
  city: string;
  area: string;
  budget: BudgetRange;
  candidateDateRange: DateRange;
  participants: SimulatedParticipantInput[];
};

export type CreateMealEventOptions = {
  eventId?: string;
  participantIds?: string[];
  now?: string;
};

export type CreateMealEventResult = {
  event: MealEvent | null;
  issues: DomainIssue[];
};

export type CloudCreatorInput = {
  id: string;
  displayName: string;
  avatar?: string;
};

export type CreateCloudMealEventInput = Omit<CreateMealEventInput, "participants"> & {
  creator: CloudCreatorInput;
};

export function createMealEvent(
  input: CreateMealEventInput,
  options: CreateMealEventOptions = {},
): CreateMealEventResult {
  const participantIds = createParticipantIds(input.participants.length, options.participantIds);
  const issues = [
    ...validateMealDraft({
      title: input.title,
      city: input.city,
      area: input.area,
      budget: input.budget,
      participantIds,
      candidateDateRange: input.candidateDateRange,
    }),
    ...validateInput(input),
  ];

  if (issues.length > 0) {
    return { event: null, issues };
  }

  const participants = input.participants.map((participant, index): Participant => ({
    id: participantIds[index],
    displayName: participant.displayName.trim(),
    ...(participant.avatar ? { avatar: participant.avatar } : {}),
    role: index === 0 ? "creator" : "member",
  }));
  const budget = { ...input.budget };
  const eventId = options.eventId ?? createId("event");
  const now = options.now ?? new Date().toISOString();

  return {
    event: {
      id: eventId,
      title: input.title.trim(),
      city: input.city.trim(),
      area: input.area.trim(),
      budget,
      participantIds,
      candidateDateRange: { ...input.candidateDateRange },
      creatorId: participantIds[0],
      status: "collecting",
      participants,
      availabilities: [],
      preferences: createDefaultPreferences(participantIds, budget),
      candidates: [],
      votes: [],
      createdAt: now,
      updatedAt: now,
    },
    issues: [],
  };
}

export function createCloudMealEvent(
  input: CreateCloudMealEventInput,
  options: Pick<CreateMealEventOptions, "eventId" | "now"> = {},
): CreateMealEventResult {
  const creator = input.creator;
  const issues = validateCloudInput(input);
  if (issues.length > 0) return { event: null, issues };

  const budget = { ...input.budget };
  const eventId = options.eventId ?? createCloudId();
  const now = options.now ?? new Date().toISOString();
  const participant: Participant = {
    id: creator.id,
    displayName: creator.displayName.trim(),
    ...(creator.avatar ? { avatar: creator.avatar } : {}),
    role: "creator",
  };

  return {
    event: {
      id: eventId,
      title: input.title.trim(),
      city: input.city.trim(),
      area: input.area.trim(),
      budget,
      participantIds: [creator.id],
      candidateDateRange: { ...input.candidateDateRange },
      creatorId: creator.id,
      status: "collecting",
      participants: [participant],
      availabilities: [],
      preferences: createDefaultPreferences([creator.id], budget),
      candidates: [],
      votes: [],
      createdAt: now,
      updatedAt: now,
    },
    issues: [],
  };
}

function validateInput(input: CreateMealEventInput): DomainIssue[] {
  const issues: DomainIssue[] = [];
  const seenNames = new Set<string>();

  input.participants.forEach((participant, index) => {
    const name = participant.displayName.trim();
    const field = `participants.${index}.displayName`;

    if (!name) {
      issues.push({ field, message: "请填写模拟成员昵称" });
      return;
    }

    const normalizedName = name.toLocaleLowerCase();
    if (seenNames.has(normalizedName)) {
      issues.push({ field, message: "模拟成员昵称不能重复" });
      return;
    }

    seenNames.add(normalizedName);
  });

  if (!input.candidateDateRange.start || !input.candidateDateRange.end) {
    issues.push({ field: "candidateDateRange", message: "请填写候选日期范围" });
  } else if (input.candidateDateRange.start > input.candidateDateRange.end) {
    issues.push({ field: "candidateDateRange", message: "结束日期不能早于开始日期" });
  }

  if (input.budget.min < 0 || input.budget.max < 0) {
    issues.push({ field: "budget", message: "预算不能为负数" });
  }

  return issues;
}

function validateCloudInput(input: CreateCloudMealEventInput): DomainIssue[] {
  const issues: DomainIssue[] = [];

  if (!input.title.trim()) issues.push({ field: "title", message: "请填写饭局名称" });
  if (!input.creator.displayName.trim()) issues.push({ field: "creator.displayName", message: "请填写创建者昵称" });
  if (!UUID_PATTERN.test(input.creator.id)) {
    issues.push({ field: "creator.id", message: "云端创建者必须是有效身份" });
  }
  if (input.budget.min > input.budget.max) {
    issues.push({ field: "budget", message: "最低预算不能高于最高预算" });
  }
  if (input.budget.min < 0 || input.budget.max < 0) {
    issues.push({ field: "budget", message: "预算不能为负数" });
  }
  if (!input.candidateDateRange.start || !input.candidateDateRange.end) {
    issues.push({ field: "candidateDateRange", message: "请填写候选日期范围" });
  } else if (input.candidateDateRange.start > input.candidateDateRange.end) {
    issues.push({ field: "candidateDateRange", message: "结束日期不能早于开始日期" });
  }

  return issues;
}

function createParticipantIds(count: number, providedIds?: string[]): string[] {
  if (providedIds?.length === count) {
    return [...providedIds];
  }

  return Array.from({ length: count }, () => createId("participant"));
}

function createDefaultPreferences(
  participantIds: string[],
  budget: BudgetRange,
): Record<string, PreferenceProfile> {
  return Object.fromEntries(participantIds.map((participantId) => [participantId, {
    likedCuisines: [],
    dislikedCuisines: [],
    taboos: [],
    budget: { ...budget },
    isFlexible: true,
  }]));
}

function createId(prefix: string): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function createCloudId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") return globalThis.crypto.randomUUID();

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    const value = character === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}
