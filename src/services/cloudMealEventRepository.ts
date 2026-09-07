import type { MealEvent } from "@/domain/meal";
import type { MealEventRepository } from "./mealEventRepository";
import {
  fromMealAccessRows,
  toMealAccessRows,
  type MealAccessRows,
} from "./mealAccessSchema";

export type MealStoreErrorCode = "unconfigured" | "unauthorized" | "network" | "invalid-data";

export type MealStoreError = Error & {
  code: MealStoreErrorCode;
};

export type CloudMealEventDataPort = {
  list(): Promise<MealAccessRows[]>;
  getById(eventId: string): Promise<MealAccessRows | null>;
  save(rows: MealAccessRows): Promise<MealAccessRows>;
  delete(eventId: string): Promise<boolean>;
};

export class CloudMealEventRepository implements MealEventRepository {
  constructor(private readonly dataPort: CloudMealEventDataPort) {}

  async list(): Promise<MealEvent[]> {
    try {
      const rows = await this.dataPort.list();
      return rows.map(hydrateEvent);
    } catch (error) {
      throw toMealStoreError(error);
    }
  }

  async getById(eventId: string): Promise<MealEvent | null> {
    try {
      const rows = await this.dataPort.getById(eventId);
      return rows ? hydrateEvent(rows) : null;
    } catch (error) {
      throw toMealStoreError(error);
    }
  }

  async create(event: MealEvent): Promise<MealEvent> {
    return this.persist(event);
  }

  async save(event: MealEvent): Promise<MealEvent> {
    return this.persist(event);
  }

  async delete(eventId: string): Promise<boolean> {
    try {
      return await this.dataPort.delete(eventId);
    } catch (error) {
      throw toMealStoreError(error);
    }
  }

  private async persist(event: MealEvent): Promise<MealEvent> {
    try {
      const savedRows = await this.dataPort.save(toMealAccessRows(event));
      return hydrateEvent(savedRows);
    } catch (error) {
      throw toMealStoreError(error);
    }
  }
}

function hydrateEvent(rows: MealAccessRows): MealEvent {
  try {
    return fromMealAccessRows(rows);
  } catch {
    throw createMealStoreError("invalid-data", "云端饭局数据不完整，暂不能显示");
  }
}

function toMealStoreError(error: unknown): MealStoreError {
  if (isMealStoreError(error)) return error;
  if (isCloudDataFailure(error, "unauthorized")) {
    return createMealStoreError("unauthorized", "你没有访问这场饭局的权限");
  }
  if (isCloudDataFailure(error, "unconfigured")) {
    return createMealStoreError("unconfigured", "尚未配置云端饭局服务");
  }
  if (isCloudDataFailure(error, "invalid-data")) {
    return createMealStoreError("invalid-data", "云端饭局数据不完整，暂不能显示");
  }
  return createMealStoreError("network", "云端饭局暂不可用，请稍后重试");
}

function createMealStoreError(code: MealStoreErrorCode, message: string): MealStoreError {
  return Object.assign(new Error(message), { code });
}

function isMealStoreError(error: unknown): error is MealStoreError {
  return error instanceof Error && "code" in error;
}

function isCloudDataFailure(error: unknown, kind: MealStoreErrorCode): boolean {
  return typeof error === "object" && error !== null && "kind" in error && error.kind === kind;
}
