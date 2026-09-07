import { beforeEach, describe, expect, it } from "vitest";
import { LocalMealEventRepository } from "../localMealEventRepository";
import type { MealEvent } from "@/domain/meal";

const STORAGE_KEY = "eato_meal_events_v1";

function createEvent(overrides: Partial<MealEvent> = {}): MealEvent {
  return {
    id: "event-1",
    title: "周末火锅局",
    city: "上海",
    area: "静安区",
    budget: { min: 80, max: 150 },
    participantIds: ["mei", "shuai", "hao"],
    candidateDateRange: { start: "2026-08-29", end: "2026-08-31" },
    creatorId: "mei",
    status: "draft",
    participants: [],
    availabilities: [],
    preferences: {},
    candidates: [],
    votes: [],
    createdAt: "2026-08-27T00:00:00.000Z",
    updatedAt: "2026-08-27T00:00:00.000Z",
    ...overrides,
  };
}

describe("LocalMealEventRepository", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns no meal events before the first event is created", async () => {
    await expect(new LocalMealEventRepository().list()).resolves.toEqual([]);
  });

  it("exposes local meal operations as promises for the shared repository contract", async () => {
    const repository = new LocalMealEventRepository();
    const event = createEvent();

    await expect(repository.create(event)).resolves.toEqual(event);
    await expect(repository.list()).resolves.toEqual([event]);
    await expect(repository.getById(event.id)).resolves.toEqual(event);
  });

  it("persists a created event for a new repository instance", async () => {
    const event = createEvent();
    await new LocalMealEventRepository().create(event);

    await expect(new LocalMealEventRepository().getById(event.id)).resolves.toEqual(event);
  });

  it("uses a storage key separate from the existing restaurant and calendar data", async () => {
    localStorage.setItem("eato_places", "existing places");
    localStorage.setItem("eato_slots", "existing slots");

    await new LocalMealEventRepository().create(createEvent());

    expect(localStorage.getItem("eato_places")).toBe("existing places");
    expect(localStorage.getItem("eato_slots")).toBe("existing slots");
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
  });

  it("returns isolated event copies", async () => {
    const repository = new LocalMealEventRepository();
    await repository.create(createEvent());

    const [event] = await repository.list();
    event.title = "错误修改";

    expect((await repository.getById(event.id))?.title).toBe("周末火锅局");
  });

  it("rejects a duplicate event ID", async () => {
    const repository = new LocalMealEventRepository();
    await repository.create(createEvent());

    await expect(repository.create(createEvent())).rejects.toThrow("饭局 event-1 已存在");
  });

  it("updates an existing event and rejects an unknown event", async () => {
    const repository = new LocalMealEventRepository();
    await repository.create(createEvent());

    await expect(repository.save(createEvent({ title: "已修改" }))).resolves.toMatchObject({ title: "已修改" });
    expect((await repository.getById("event-1"))?.title).toBe("已修改");
    await expect(repository.save(createEvent({ id: "missing" }))).rejects.toThrow("饭局 missing 不存在");
  });

  it("deletes only the specified event", async () => {
    const repository = new LocalMealEventRepository();
    await repository.create(createEvent());
    await repository.create(createEvent({ id: "event-2" }));

    await expect(repository.delete("event-1")).resolves.toBe(true);
    await expect(repository.getById("event-1")).resolves.toBeNull();
    await expect(repository.getById("event-2")).resolves.not.toBeNull();
    await expect(repository.delete("missing")).resolves.toBe(false);
  });

  it("returns an empty list for malformed data without deleting the raw value", async () => {
    localStorage.setItem(STORAGE_KEY, "not-json");

    await expect(new LocalMealEventRepository().list()).resolves.toEqual([]);
    expect(localStorage.getItem(STORAGE_KEY)).toBe("not-json");
  });

  it("returns an empty list when stored data is not an event array", async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ stale: true }));

    await expect(new LocalMealEventRepository().list()).resolves.toEqual([]);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify({ stale: true }));
  });
});
