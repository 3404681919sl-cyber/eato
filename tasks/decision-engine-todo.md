# `decision-engine` 任务清单

- [x] Task: 定义决策输出类型、上下文与评分权重
  - Acceptance: 评分输入、分项、冲突和理由具有唯一类型定义；权重可被测试读取。
  - Verify: `npm run build`
  - Files: `src/domain/decisionEngine.ts`

- [x] Task: 以失败测试定义硬约束与完整时间交集
  - Acceptance: 忌口、超预算候选被剔除；全员可用方案标记为可确认。
  - Verify: `npm test -- src/domain/__tests__/decisionEngine.test.ts`
  - Files: `src/domain/__tests__/decisionEngine.test.ts`

- [x] Task: 实现最小过滤与时间匹配
  - Acceptance: 硬约束与完整时间交集测试通过。
  - Verify: `npm test -- src/domain/__tests__/decisionEngine.test.ts`
  - Files: `src/domain/decisionEngine.ts`

- [x] Task: 以失败测试定义评分、冲突提示和排序
  - Acceptance: 测试覆盖无共同时间不可确认、权重计算、缺失数据、稳定前三排序。
  - Verify: `npm test -- src/domain/__tests__/decisionEngine.test.ts`
  - Files: `src/domain/__tests__/decisionEngine.test.ts`

- [x] Task: 实现评分、解释与前三限制
  - Acceptance: 返回可解释的结构化前三方案；相同输入获得相同输出。
  - Verify: `npm test -- src/domain/__tests__/decisionEngine.test.ts`
  - Files: `src/domain/decisionEngine.ts`

- [x] Task: 完成决策引擎回归验证
  - Acceptance: 专属测试、全量测试和构建均通过；不引入网络、AI 或 UI 依赖。
  - Verify: `npm test; npm run build`
  - Files: `src/domain/decisionEngine.ts`, `src/domain/__tests__/decisionEngine.test.ts`
