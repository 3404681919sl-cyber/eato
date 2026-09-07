import { STORAGE_KEYS } from "@/constants";
import type { MealEvent } from "@/domain/meal";
import type { MealEventRepository } from "./mealEventRepository";

export class LocalMealEventRepository implements MealEventRepository {
  constructor(private readonly storageKey = STORAGE_KEYS.MEAL_EVENTS) {}

  async list(): Promise<MealEvent[]> {
    return this.readEvents();
  }

  async getById(id: string): Promise<MealEvent | null> {
    return this.readEvents().find((event) => event.id === id) ?? null;
  }

  async create(event: MealEvent): Promise<MealEvent> {
    const events = this.readEvents();
    if (events.some((item) => item.id === event.id)) {
      throw new Error(`饭局 ${event.id} 已存在`);
    }

    events.push(event);
    this.writeEvents(events);
    return event;
  }

  async save(event: MealEvent): Promise<MealEvent> {
    const events = this.readEvents();
    const index = events.findIndex((item) => item.id === event.id);
    if (index === -1) {
      throw new Error(`饭局 ${event.id} 不存在`);
    }

    events[index] = event;
    this.writeEvents(events);
    return event;
  }

  async delete(id: string): Promise<boolean> {
    const events = this.readEvents();
    const index = events.findIndex((event) => event.id === id);
    if (index === -1) return false;

    events.splice(index, 1);
    this.writeEvents(events);
    return true;
  }

  private readEvents(): MealEvent[] {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return [];

    try {
      const events: unknown = JSON.parse(raw);
      return Array.isArray(events) ? events : [];
    } catch {
      return [];
    }
  }

  private writeEvents(events: MealEvent[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(events));
  }
}
