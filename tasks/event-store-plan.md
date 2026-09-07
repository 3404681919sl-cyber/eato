# `event-store` 实施计划

对应规格：[SPEC-event-store.md](../SPEC-event-store.md)。本模块以 `MealEventRepository` 隔离饭局业务与 localStorage；本期只做本地实现，真实数据库在第二阶段替换实现类。

## 设计决定

1. 新接口位于 `src/services/mealEventRepository.ts`，本地实现位于 `src/services/localMealEventRepository.ts`。
2. 采用独立键 `eato_meal_events_v1`，绝不使用现有 `eato_places` 或 `eato_slots`。
3. 仓储只保存 JSON 兼容的 `MealEvent`；读写均深拷贝，防止调用方修改缓存。
4. `create()` 遇重复 ID、`save()` 遇未知 ID 时抛出明确错误；页面在后续模块将其转为用户提示。
5. 坏数据只回退为空列表，保留原始值以免静默丢失用户数据。

## 实施顺序

1. 定义仓储接口与独立存储键。
2. 写失败测试：空存储、创建与跨实例读取。
3. 实现最小读取/创建逻辑。
4. 写失败测试：副本隔离、重复 ID、更新、删除、坏数据。
5. 实现剩余最小逻辑并做全量回归。

## 风险与缓解

| 风险 | 缓解 |
| --- | --- |
| 调用方意外修改内存数据 | 入口和出口均深拷贝。 |
| 新功能覆盖旧打卡资料 | 新增独立 key；测试断言旧 key 不变。 |
| localStorage 坏数据导致白屏 | 解析失败回退空列表，不在读取路径抛异常。 |
| 未来换数据库重写页面 | 页面仅依赖 `MealEventRepository` 接口。 |

## 验证命令

```powershell
npm test -- src/services/__tests__/localMealEventRepository.test.ts
npm test
npm run build
```
