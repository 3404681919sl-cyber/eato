import { describe, expect, it } from "vitest";
import type { MealEvent } from "@/domain/meal";
import { toMealAccessRows, type MealAccessRows } from "../mealAccessSchema";
import { CloudMealEventRepository, type CloudMealEventDataPort } from "../cloudMealEventRepository";

const ids = {
  event: "00000000-0000-4000-8000-000000000001",
  creator: "00000000-0000-4000-8000-000000000002",
  member: "00000000-0000-4000-8000-000000000003",
} as const;

function createEvent(overrides: Partial<MealEvent> = {}): MealEvent {
  return {
    id: ids.event,
    creatorId: ids.creator,
    title: "周五火锅局",
    city: "上海",
    area: "静安区",
    budget: { min: 80, max: 150 },
    participantIds: [ids.creator, ids.member],
    candidateDateRange: { start: "2026-08-29", end: "2026-08-31" },
    status: "collecting",
    participants: [
      { id: ids.creator, displayName: "小美", role: "creator" },
      { id: ids.member, displayName: "阿帅", role: "member" },
    ],
    availabilities: [],
    preferences: {},
    candidates: [],
    votes: [],
    createdAt: "2026-08-28T00:00:00.000Z",
    updatedAt: "2026-08-28T00:00:00.000Z",
    ...overrides,
  };
}

function createDataPort(overrides: Partial<CloudMealEventDataPort> = {}): CloudMealEventDataPort {
  const rows = toMealAccessRows(createEvent());
  return {
    list: async () => [rows],
    getById: async (eventId) => eventId === rows.event.id ? rows : null,
    save: async (nextRows) => nextRows,
    delete: async () => true,
    ...overrides,
  };
}

describe("CloudMealEventRepository", () => {
  it("returns only the complete meal events made visible by its data port", async () => {
    const repository = new CloudMealEventRepository(createDataPort());

    await expect(repository.list()).resolves.toEqual([createEvent()]);
    await expect(repository.getById(ids.event)).resolves.toEqual(createEvent());
    await expect(repository.getById("00000000-0000-4000-8000-000000000099")).resolves.toBeNull();
  });

  it("sends a complete aggregate to the transaction boundary before reporting a save", async () => {
    const savedRows: MealAccessRows[] = [];
    const event = createEvent({ title: "周六火锅局" });
    const repository = new CloudMealEventRepository(createDataPort({
      save: async (rows) => {
        savedRows.push(rows);
        return rows;
      },
    }));

    await expect(repository.save(event)).resolves.toEqual(event);
    expect(savedRows).toHaveLength(1);
    expect(savedRows[0].event).toMatchObject({ id: ids.event, creator_id: ids.creator, title: "周六火锅局" });
    expect(savedRows[0].members).toHaveLength(2);
  });

  it("does not report a successful local fallback when the cloud boundary is unavailable", async () => {
    const repository = new CloudMealEventRepository(createDataPort({
      list: async () => { throw { kind: "network" }; },
    }));

    await expect(repository.list()).rejects.toMatchObject({
      code: "network",
      message: "云端饭局暂不可用，请稍后重试",
    });
  });

  it("preserves the cloud boundary's deletion result", async () => {
    const repository = new CloudMealEventRepository(createDataPort({ delete: async () => false }));

    await expect(repository.delete(ids.event)).resolves.toBe(false);
  });
});
