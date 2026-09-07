# `meal-ui` 任务清单

- [x] Task: 用失败测试定义收集数据领域操作
  - Acceptance: 每位成员的可用时间、偏好、人工候选能独立更新；无效成员、日期、预算或候选被拒绝，入参不变。
  - Verify: `npm test -- src/domain/__tests__/mealCollectionActions.test.ts`
  - Files: `src/domain/__tests__/mealCollectionActions.test.ts`

- [x] Task: 实现收集数据纯操作
  - Acceptance: UI 可使用不可变领域操作收集资料，不依赖 React、Repository 或本地存储。
  - Verify: `npm test -- src/domain/__tests__/mealCollectionActions.test.ts`
  - Files: `src/domain/mealCollectionActions.ts`

- [x] Task: 用失败测试定义饭局工作台的读取、空状态和选择
  - Acceptance: 无饭局时有可访问空状态；已有饭局按更新时间呈现，选择后显示当前事件，仓储错误有本地反馈。
  - Verify: `npm test -- src/pages/__tests__/MealWorkspaceView.test.tsx`
  - Files: `src/pages/__tests__/MealWorkspaceView.test.tsx`

- [x] Task: 实现工作台容器与饭局列表
  - Acceptance: 仅通过 Repository 读取/保存，更新后列表摘要与当前事件同步。
  - Verify: `npm test -- src/pages/__tests__/MealWorkspaceView.test.tsx`
  - Files: `src/pages/MealWorkspaceView.tsx`, `src/components/meal/MealEventList.tsx`

- [x] Task: 用失败测试并实现收集面板
  - Acceptance: 可代填成员时间/偏好/候选；每次保存只修改当前饭局；无候选或成员未填时间时不进入决策。
  - Verify: `npm test -- src/components/meal/__tests__/MealCollectionPanel.test.tsx`
  - Files: `src/components/meal/__tests__/MealCollectionPanel.test.tsx`, `src/components/meal/MealCollectionPanel.tsx`

- [x] Task: 用失败测试并实现决策与投票面板
  - Acceptance: 展示最多三项规则方案、冲突和中性分说明；支持/中立/否决、确认操作通过领域函数保存。
  - Verify: `npm test -- src/components/meal/__tests__/DecisionOptionsPanel.test.tsx`
  - Files: `src/components/meal/__tests__/DecisionOptionsPanel.test.tsx`, `src/components/meal/DecisionOptionsPanel.tsx`

- [x] Task: 用失败测试并实现已确认与饭后记录面板
  - Acceptance: 可重新协调、记录/更正饭后信息；完成后投票确认操作不可用。
  - Verify: `npm test -- src/components/meal/__tests__/MealHistoryPanel.test.tsx`
  - Files: `src/components/meal/__tests__/MealHistoryPanel.test.tsx`, `src/components/meal/MealHistoryPanel.tsx`

- [x] Task: 串联创建成功跳转、工作台入口与全量验证
  - Acceptance: 创建后选中新饭局；已有饭局可再次进入；旧三 tab 未回归；UI 表单具备标签、错误和状态反馈。
  - Verify: `npm test; npm run build`
  - Files: `src/pages/CreateMealEventView.tsx`, `src/app/AppShell.tsx`, `src/app/__tests__/AppShell.test.tsx`

- [ ] Task: 完成 UI 复核与本地归档
  - Acceptance: 依据 UI 检索结果完成标签、反馈、触控、移动端与语义复核；提交范围不含用户原有修改。
  - Verify: `npm test; npm run build; git diff --check; git status --short`
  - Files: `SPEC-meal-ui.md`, `tasks/meal-ui-plan.md`, `tasks/meal-ui-todo.md`
