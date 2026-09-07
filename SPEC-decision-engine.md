# Spec: decision-engine

## Assumptions

1. 第一阶段的输入来自本地 `MealEventRepository`，所有成员资料均为同一设备中的模拟数据。
2. 规则引擎必须在没有 AI Key、网络、地图数据或历史数据时工作；AI 只在后续负责把已有结论写成自然语言。
3. 忌口/过敏、明确预算上限和确认饭局的共同可用时间属于硬约束，不允许被加权总分覆盖。
4. 候选没有路线或历史信息时，距离与新鲜度使用中性分，并在理由中披露数据缺失。

## Objective

基于饭局成员的时间、口味、预算、候选餐厅与历史信息，产出至多三个可解释方案。该模块不做页面渲染、投票、写入数据库或 LLM 调用。

## Tech Stack

- TypeScript 5.8，strict mode
- Vitest 3
- 依赖 `src/domain/meal.ts`

## Commands

```powershell
npm test -- src/domain/__tests__/decisionEngine.test.ts
npm test
npm run build
```

## Project Structure

```text
src/domain/decisionEngine.ts                    # 纯评分与排序函数
src/domain/__tests__/decisionEngine.test.ts     # 决策行为测试
```

## Interface Contract

```ts
type DecisionOption = {
  candidateId: string;
  date: string;
  mealPeriod: "lunch" | "afternoon" | "dinner";
  totalScore: number;
  scoreBreakdown: {
    time: number;
    cuisine: number;
    budget: number;
    distance: number;
    freshness: number;
  };
  readyToConfirm: boolean;
  reasons: string[];
  conflicts: string[];
};

rankMealOptions(event: MealEvent, context?: DecisionContext): DecisionOption[]
```

### 1. 硬约束

- 候选菜系命中任一成员 `taboos` 时排除，并在 `conflicts` 中说明。
- 候选人均价高于任一成员的明确最高预算时排除。
- 所有人均可用的时间组合为 `readyToConfirm: true`；没有完全交集时，仍可返回冲突最少的候选时间，但必须标记 `readyToConfirm: false`，禁止进入自动确认。

### 2. 透明评分

只为未被硬约束排除的“时间 × 候选”组合评分，并保留完整分项：

| 维度 | 权重 | 第一阶段计算 |
| --- | ---: | --- |
| 时间匹配 | 35% | 该时间段可参与成员比例 × 100 |
| 口味匹配 | 25% | 喜欢该菜系成员比例，减去“不想吃”偏好影响 |
| 预算匹配 | 15% | 在每位成员区间内得高分；缺失人均价时为 50 分 |
| 距离匹配 | 15% | 没有通勤数据时为 50 分；后续由地图 Provider 替换 |
| 新鲜度 | 10% | 未提供历史时为 50 分；后续按重复就餐扣分 |

总分为五项加权和，保留一位小数。按总分降序；同分时优先完整时间交集、再优先预算匹配。最多返回三项。

### 3. 理由与冲突

- `reasons` 使用确定性、面向用户的短句，例如“4 位成员均可参加”“3 位成员偏好火锅”。
- `conflicts` 清晰披露不完整时间交集、缺失距离/历史数据等信息。
- AI Provider 以后只能总结这些结构化理由，不能改写分数、解除硬约束或选择最终方案。

## Code Style

```ts
const weightedScore = round1(
  score.time * 0.35 + score.cuisine * 0.25 + score.budget * 0.15
  + score.distance * 0.15 + score.freshness * 0.10,
);
```

- 使用纯函数；不可读取 localStorage、调用网络或生成随机数。
- 将权重导出为受控常量；测试不依赖实现内部排序细节以外的业务结果。
- 所有缺失数据都进入 `conflicts` 或 `reasons`，不伪装成真实资料。

## Testing Strategy

- 先写失败测试，再实现一个独立评分行为。
- 覆盖：硬忌口剔除、预算剔除、完整时间交集、无共同时间时不可自动确认、权重计算、排序与前三限制、缺失数据披露。
- 使用固定饭局 fixture，直接断言分项、总分和理由；不 mock 时间、AI 或网络。

## Boundaries

- Always：硬约束先过滤；输出完整分项和缺失数据；默认无 AI 也能运行。
- Ask first：变更评分权重、将“不想吃”改为硬否决、接地图/AI/真实餐厅数据源。
- Never：把 mock 数据称为真实推荐；允许 LLM 越过硬约束；自动确认 `readyToConfirm: false` 的方案。

## Success Criteria

1. 相同输入得到完全相同的前三方案与分数。
2. 忌口、明确预算上限不会被高分候选绕过。
3. 无共同时间时可给出协调建议，但不能返回可直接确认的方案。
4. 每个分数与缺失数据均可向用户解释。
5. 新增行为按 TDD 验证，且全量测试与构建通过。

## Open Questions

- 高德 POI 接入后，以路线分钟数还是直线距离作为距离评分输入，将在 Restaurant Provider 阶段确定。
- 用户是否把“不想吃”视为软偏好或硬否决，默认按软偏好处理；忌口始终是硬约束。
