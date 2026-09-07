# `event-store` 任务清单

- [x] Task: 定义仓储接口与饭局独立存储键
  - Acceptance: 后续模块可通过 `MealEventRepository` 管理饭局，且新 key 不与旧打卡 key 重叠。
  - Verify: `npm run build`
  - Files: `src/services/mealEventRepository.ts`, `src/constants/index.ts`

- [x] Task: 以失败测试定义空存储、创建与跨实例读取
  - Acceptance: 新测试首次因实现缺失而失败，并清楚表达持久化契约。
  - Verify: `npm test -- src/services/__tests__/localMealEventRepository.test.ts`
  - Files: `src/services/__tests__/localMealEventRepository.test.ts`

- [x] Task: 实现本地读取与创建
  - Acceptance: 空存储返回空列表；创建后，新仓储实例可读取同一饭局。
  - Verify: `npm test -- src/services/__tests__/localMealEventRepository.test.ts`
  - Files: `src/services/localMealEventRepository.ts`

- [x] Task: 以失败测试定义隔离、更新、删除、错误和坏数据回退
  - Acceptance: 测试覆盖所有边界行为，首次因为逻辑尚未实现而失败。
  - Verify: `npm test -- src/services/__tests__/localMealEventRepository.test.ts`
  - Files: `src/services/__tests__/localMealEventRepository.test.ts`

- [x] Task: 实现仓储剩余行为并完成回归
  - Acceptance: 所有仓储测试通过，且不读写既有餐厅/日历 key。
  - Verify: `npm test; npm run build`
  - Files: `src/services/localMealEventRepository.ts`, `src/services/__tests__/localMealEventRepository.test.ts`
