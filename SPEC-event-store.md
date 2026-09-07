# Spec: event-store

## Assumptions

1. 第一阶段只有一个浏览器中的模拟饭局，不存在跨设备并发写入。
2. 饭局数据必须与现有 `eato_places`、`eato_slots` 分离，不能迁移或覆盖旧打卡数据。
3. 真实数据库阶段将实现同一份仓储接口；页面和决策引擎不直接读取 `localStorage`。
4. 本期坏数据或旧版本数据可安全回退为空饭局列表，不阻塞应用启动。

## Objective

提供 `MealEventRepository`，让后续页面和规则引擎以稳定的 CRUD 接口管理饭局，而不依赖浏览器存储细节。它是本地模拟多人 MVP 与第二期真实数据库之间的替换边界。

## Tech Stack

- TypeScript 5.8，strict mode
- Vitest 3 + jsdom localStorage
- 依赖既有 `src/domain/meal.ts`

## Commands

```powershell
npm test -- src/services/__tests__/localMealEventRepository.test.ts
npm test
npm run build
```

## Project Structure

```text
src/services/mealEventRepository.ts                         # 仓储接口
src/services/localMealEventRepository.ts                    # localStorage 实现
src/services/__tests__/localMealEventRepository.test.ts     # 行为测试
src/constants/index.ts                                      # 新增独立存储键
```

## Interface Contract

```ts
export interface MealEventRepository {
  list(): MealEvent[];
  getById(id: string): MealEvent | null;
  create(event: MealEvent): MealEvent;
  save(event: MealEvent): MealEvent;
  delete(id: string): boolean;
}
```

- 使用独立版本化键 `eato_meal_events_v1` 保存完整饭局集合。
- `list()` 和 `getById()` 返回副本，调用方修改返回值不会污染缓存或存储。
- `create()` 拒绝重复 ID；`save()` 只更新已存在饭局；仓储通过可预测的错误结果或异常区分错误，具体形式以测试先定义。
- 读取到 malformed JSON、非数组或旧未知格式时返回空数组；不删除旧原始值。
- 删除只删除指定饭局，不影响旧 Eato 餐厅和日历存储键。

## Code Style

```ts
list(): MealEvent[] {
  return this.events.map((event) => structuredClone(event));
}
```

- 仓储是可注入的类；存储键通过构造参数可覆盖，方便测试。
- 不让 React 组件直接调用 `localStorage`。
- 不在此模块实现饭局状态机、评分、AI 或 UI 文案。

## Testing Strategy

- 先写失败测试，再实现一个行为。
- 覆盖空存储、创建/读取、深拷贝隔离、重复 ID、更新、删除及坏数据回退。
- 每个测试前清理测试键；新增测试不得依赖现有打卡种子数据。

## Boundaries

- Always：只使用新存储键；所有写入后可由新实例读取；保持 `MealEventRepository` 与实现解耦。
- Ask first：改变现有 storage key、清除用户已有饭局数据、引入数据库 SDK 或新依赖。
- Never：从页面直接读写 `localStorage`；把本地数据声称为跨设备同步；删除旧 Eato 数据。

## Success Criteria

1. 后续模块只依赖 `MealEventRepository`，不依赖 localStorage API。
2. 新建、查询、更新、删除及坏数据回退均有失败后通过的测试。
3. 一个新仓储实例可以读取上一个实例写入的饭局。
4. 现有打卡存储键未被读取、写入或删除。
5. 全量测试与构建通过。

## Open Questions

- 第二阶段优先用 Supabase/Postgres 实现本接口；开始该阶段前再确认服务账号、部署地区和 Row Level Security 策略。
