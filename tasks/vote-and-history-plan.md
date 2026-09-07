# `vote-and-history` 实施计划

对应规格：[SPEC-vote-and-history.md](../SPEC-vote-and-history.md)。本模块只实现可复用的领域操作；页面在后续 `meal-ui` 模块调用这些纯函数后，通过既有 `MealEventRepository.save` 持久化结果。

## 设计决定

1. 新建 `src/domain/mealEventActions.ts`，集中放置 `castVote`、`confirmDecision`、`returnToCollecting` 与 `recordMealHistory`。不让页面自己改写 `MealEvent` 数组或状态。
2. 每个操作统一返回 `{ event, issues }`：失败时原样返回同一事件，成功时创建新对象并刷新 `updatedAt`。这延续 `transitionMealStatus` 的领域契约。
3. 将操作所需的当前时刻作为可选参数注入，默认取当前 ISO 时间，测试使用固定时刻；不引入时钟依赖或网络时间。
4. `confirmDecision` 接收 `DecisionOption`，只信任其 `candidateId/date/mealPeriod/readyToConfirm/reasons` 字段；对候选、状态和现有否决重新做校验，避免 UI 伪造“可确认”结果。
5. 投票替换以成员和候选的组合为键；其他候选的票不受影响。否决判断只针对待确认候选。
6. 饭后记录第一次写入会经 `transitionMealStatus` 进入 `completed`；完成后修改记录只改 `history`，不再次执行状态迁移。
7. 本期不直接调用 Repository。未来页面遵循“纯操作 → `repository.save(result.event)`”顺序，因此真实数据库替换时领域代码不变。

## 实施顺序

1. 用失败测试定义投票替换、非法成员/候选/状态与不变性。
2. 实现最小 `castVote` 和通用结果、时间帮助函数。
3. 用失败测试定义确认的共同时间、否决、候选与状态约束。
4. 实现 `confirmDecision` 与 `returnToCollecting`。
5. 用失败测试定义饭后记录的范围校验、首次完成、后续更正与完成后禁止操作。
6. 实现 `recordMealHistory`，然后运行全量回归与生产构建。

## 风险与缓解

| 风险 | 缓解 |
| --- | --- |
| 页面传入伪造的可确认方案 | 再校验状态、候选、全员可用标志和现有否决；后续 UI 只消费决策引擎输出。 |
| 确认/完成状态被原地修改 | 成功与失败均由测试断言输入事件不变；失败直接返回原事件引用。 |
| 覆盖投票时误删其他候选的票 | 测试覆盖同成员不同候选、同候选不同成员和重复投票。 |
| 未成行饭局被要求填写评分 | `occurred: false` 不要求评分或实际花费；成功记录仍进入已完成状态。 |
| 存储逻辑渗入领域层 | 不导入 Repository 或 `localStorage`；未来调用者只保存成功结果。 |

## 验证检查点

| 阶段 | 必须成立 | 命令 |
| --- | --- | --- |
| 投票 | 替换与非法输入的纯函数行为固定 | `npm test -- src/domain/__tests__/mealEventActions.test.ts` |
| 确认 | 共同时间、否决和状态约束可复现 | `npm test -- src/domain/__tests__/mealEventActions.test.ts` |
| 饭后记录 | 校验、完成和更正路径可复现 | `npm test -- src/domain/__tests__/mealEventActions.test.ts` |
| 发布检查 | 旧功能与新领域操作均未回归 | `npm test; npm run build` |

## 不做的事

- 不为本模块新增详情页、投票按钮、历史表单或路由。
- 不对候选重算排名，也不向 AI 请求理由。
- 不直接调用 `repository.save` 或 `localStorage`，不实现同步冲突合并。
