# `vote-and-history` 任务清单

- [x] Task: 用失败测试定义投票替换与边界
  - Acceptance: 同成员同候选覆盖旧票；不同候选/成员保留；非法成员、候选或状态被拒绝且输入事件不变。
  - Verify: `npm test -- src/domain/__tests__/mealEventActions.test.ts`
  - Files: `src/domain/__tests__/mealEventActions.test.ts`

- [x] Task: 实现纯投票操作
  - Acceptance: `castVote` 返回带更新时间的新事件或中文字段错误，不含 React、Repository 或存储依赖。
  - Verify: `npm test -- src/domain/__tests__/mealEventActions.test.ts`
  - Files: `src/domain/mealEventActions.ts`

- [x] Task: 用失败测试定义确认与回退约束
  - Acceptance: 无共同时间、否决、未知候选和非法状态无法确认；合法方案能确认并可回退收集。
  - Verify: `npm test -- src/domain/__tests__/mealEventActions.test.ts`
  - Files: `src/domain/__tests__/mealEventActions.test.ts`

- [x] Task: 实现确认与重新协调操作
  - Acceptance: `Decision` 包含候选、时间、餐段、规则理由和确认时间；回退复用领域状态机。
  - Verify: `npm test -- src/domain/__tests__/mealEventActions.test.ts`
  - Files: `src/domain/mealEventActions.ts`

- [x] Task: 用失败测试定义并实现饭后记录
  - Acceptance: 仅确认/完成饭局可记录；花费和评分范围受限；首次记录完成饭局，后续可更正。
  - Verify: `npm test -- src/domain/__tests__/mealEventActions.test.ts`
  - Files: `src/domain/__tests__/mealEventActions.test.ts`, `src/domain/mealEventActions.ts`

- [x] Task: 完成模块回归与归档
  - Acceptance: 专属测试、全量测试和构建均通过；提交只含本模块文件，用户原有修改仍未包含。
  - Verify: `npm test; npm run build; git status --short`
  - Files: `SPEC-vote-and-history.md`, `tasks/vote-and-history-plan.md`, `tasks/vote-and-history-todo.md`
