# `event-input` 任务清单

- [x] Task: 用失败测试定义饭局创建工厂的契约
  - Acceptance: 测试覆盖完整事件初始化、创建者角色、默认偏好、领域校验、日期范围、成员昵称和可注入 ID/时间。
  - Verify: `npm test -- src/services/__tests__/mealEventFactory.test.ts`
  - Files: `src/services/__tests__/mealEventFactory.test.ts`

- [x] Task: 实现纯饭局创建工厂
  - Acceptance: 合法输入获得 `collecting` 事件；非法输入返回 `DomainIssue[]` 且不产生事件；实现不包含 React 或存储访问。
  - Verify: `npm test -- src/services/__tests__/mealEventFactory.test.ts`
  - Files: `src/services/mealEventFactory.ts`

- [x] Task: 用失败测试定义创建页的表单与仓储交互
  - Acceptance: 字段错误可见，提交只调用仓储一次，仓储异常不丢失草稿，成功状态明确为本地保存。
  - Verify: `npm test -- src/pages/__tests__/CreateMealEventView.test.tsx`
  - Files: `src/pages/__tests__/CreateMealEventView.test.tsx`

- [x] Task: 实现创建饭局页面
  - Acceptance: 可录入饭局信息与 3–8 名模拟成员；失焦和提交校验均可用；移动端单列且每个字段有可见标签。
  - Verify: `npm test -- src/pages/__tests__/CreateMealEventView.test.tsx`
  - Files: `src/pages/CreateMealEventView.tsx`, `src/services/mealEventFactory.ts`

- [x] Task: 在现有壳层增量接入饭局入口
  - Acceptance: 用户可从既有界面到达创建页；原有三个 tab 仍可切换，未改变旧数据流。
  - Verify: `npm test; npm run build`
  - Files: `src/app/AppShell.tsx`, `src/types/index.ts`

- [x] Task: 完成模块回归与归档
  - Acceptance: 专属测试、全量测试与生产构建都通过；提交只包含本模块自有文件，不包含用户原有未跟踪或修改项。
  - Verify: `npm test; npm run build; git status --short`
  - Files: `SPEC-event-input.md`, `tasks/event-input-plan.md`, `tasks/event-input-todo.md`
