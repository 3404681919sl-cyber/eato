# Spec: meal-domain

## Objective

为“让一群人约成一顿饭”提供稳定、可测试的领域模型。第一阶段中，发起人可以在同一设备为 3–8 名模拟成员填写信息，并在不依赖网络、账号或 AI Key 的条件下完成一次饭局。

本模块不负责渲染、存储、网络访问或模型调用；它只定义共享业务语言和输入校验，防止页面和后续数据库实现各自发明不兼容的数据结构。

## Tech Stack

- TypeScript 5.8，strict mode
- React 18 / Vite 6（本模块不依赖 React）
- Vitest 3

## Commands

```powershell
npm test -- src/domain/__tests__/mealDomain.test.ts
npm test
npm run build
```

## Project Structure

```text
src/domain/meal.ts                       # 领域类型、常量与纯校验函数
src/domain/__tests__/mealDomain.test.ts  # 领域行为测试
src/services/                            # 后续的本地/真实仓储实现
src/pages/                               # 后续的 UI 流程
```

## Domain Contract

- `MealEvent`：饭局的标题、发起人、城市/区域、日期范围、预算、状态和成员。
- `Participant`：显示名、头像占位、角色（发起人/成员）、参与状态。
- `Availability`：每位成员选定的日期与时间段；时间段使用受控枚举，避免页面自行拼接字符串。
- `PreferenceProfile`：想吃/不想吃菜系、忌口、预算范围、最大通勤时间，以及“都可以”状态。
- `Candidate`：餐厅或菜系候选，带可选地址、菜系、人均、来源链接和最多 3 条手工优惠。
- `Vote`：成员对一个方案的支持/中立/否决及可选原因。
- `Decision`：已确定时间、候选、规则理由、置信度与确认时间。
- `MealHistory`：饭局完成后的成行状态、实际人均、评分和备注。

饭局状态顺序固定为：`draft → collecting → deciding → confirmed → completed`。状态只能向前推进；在 `confirmed` 前允许回到 `collecting` 重新决策。

## Code Style

```ts
export function validateBudget(range: BudgetRange): DomainIssue[] {
  return range.min > range.max
    ? [{ field: "budget", message: "最低预算不能高于最高预算" }]
    : [];
}
```

- 用不可变数据与纯函数；不在领域模块读写 `localStorage`。
- 所有公开类型和字段使用英文代码名，面向用户的文案留在 UI 层。
- 不使用 `any`，不在页面里重复定义领域类型。

## Testing Strategy

- 先为每个新校验/状态迁移写一个会失败的 Vitest 测试，再写最小实现。
- 覆盖正常流、无效预算、成员数上下限、空名称、非法状态迁移、候选优惠上限。
- 本模块只做单元测试；本地持久化和页面交互在后续模块单独测试。

## Boundaries

- Always：保持旧版打卡数据可读；新增模型使用独立、版本化的存储键；每次改动先跑对应测试。
- Ask first：新增依赖、改变现有页面整体视觉、迁移/删除现有用户本地数据、接入外部服务。
- Never：在浏览器存 API Key；把模拟优惠描述成实时价格；移除既有失败测试来获得通过。

## Success Criteria

1. TypeScript 能表达一场饭局从创建到完成的全部本期状态。
2. 领域校验能拒绝不合法的预算、成员和状态迁移，并给出可呈现的中文错误信息。
3. 数据结构可无损映射到后续关系型数据库，而页面不依赖数据库细节。
4. 所有新增领域行为均有先失败后通过的测试，并且全量测试和构建通过。

## Open Questions

- 第二阶段真实数据库优先选用 Supabase/Postgres，除非用户在开始该阶段前改选其他服务。
- 第一阶段的模拟成员是否需要提供预设头像；默认使用当前 Eato 的色彩头像占位。
