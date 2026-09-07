# `meal-domain` 任务清单

- [x] Task: 定义饭局领域类型与受控枚举
  - Acceptance: `MealEvent`、成员、偏好、时间、候选、优惠、投票、决策、饭后记录和饭局状态均有唯一类型定义。
  - Verify: `npm run build`
  - Files: `src/domain/meal.ts`

- [x] Task: 以失败测试定义输入校验契约
  - Acceptance: 测试覆盖空标题、错误预算、成员数量超界和优惠超过 3 条；首次运行因缺少校验实现而失败。
  - Verify: `npm test -- src/domain/__tests__/mealDomain.test.ts`
  - Files: `src/domain/__tests__/mealDomain.test.ts`

- [x] Task: 实现最小输入校验
  - Acceptance: 校验函数返回可展示的中文 `DomainIssue[]`，并使输入校验测试通过。
  - Verify: `npm test -- src/domain/__tests__/mealDomain.test.ts`
  - Files: `src/domain/meal.ts`

- [x] Task: 以失败测试定义饭局状态迁移
  - Acceptance: 测试覆盖正常推进、确认后重新收集和非法跨越状态。
  - Verify: `npm test -- src/domain/__tests__/mealDomain.test.ts`
  - Files: `src/domain/__tests__/mealDomain.test.ts`

- [x] Task: 实现不可变状态迁移
  - Acceptance: 合法迁移返回新饭局；非法迁移不修改入参并给出中文错误。
  - Verify: `npm test -- src/domain/__tests__/mealDomain.test.ts`
  - Files: `src/domain/meal.ts`

- [x] Task: 完成领域模块回归验证
  - Acceptance: 领域测试、全量测试和生产构建均通过；不引入依赖或触碰现有 UI。
  - Verify: `npm test; npm run build`
  - Files: `src/domain/__tests__/mealDomain.test.ts`, `src/domain/meal.ts`
