import type { MealEvent } from "@/domain/meal";

export interface MealEventRepository {
  list(): Promise<MealEvent[]>;
  getById(id: string): Promise<MealEvent | null>;
  create(event: MealEvent): Promise<MealEvent>;
  save(event: MealEvent): Promise<MealEvent>;
  delete(id: string): Promise<boolean>;
}
