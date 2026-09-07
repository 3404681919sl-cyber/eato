# `meal-ui` 实施计划

对应规格：[SPEC-meal-ui.md](../SPEC-meal-ui.md)。本计划在既有暖色 Eato 壳层内完成单设备饭局闭环，不增加依赖、不接网络服务。

## 设计决定

1. 新增 `src/domain/mealCollectionActions.ts` 作为 `meal-ui` 的内部支撑：用纯函数更新成员可用时间、偏好和人工候选。它不是新的顶层能力模块，而是为了避免 React 组件直接拼改 `MealEvent`。
2. `MealWorkspaceView` 持有当前事件 ID、从 `MealEventRepository.list/getById` 读取事件，并在每次领域操作成功后调用 `repository.save`。组件不直接读写 `localStorage`。
3. 工作台分为三个窄组件：`MealCollectionPanel`、`DecisionOptionsPanel`、`MealHistoryPanel`。每个只接收当前事件与保存回调，不重复仓储逻辑。
4. `CreateMealEventView` 增加可选 `onCreated(event)` 回调；`AppShell` 接到回调后切换到工作台并选中新事件。另加可访问的“我的饭局”入口，用于再次打开已保存事件。
5. 人工候选只支持名称、菜系标签和可选人均消费；不暴露 Offer/链接输入，以免暗示真实优惠或第三方数据已接入。
6. 决策面板只读取 `rankMealOptions` 输出；投票、确认、回退和饭后记录一律调用 `mealEventActions`，再通过工作台保存。
7. 局部状态仅用于未保存表单、当前代填成员和 UI 反馈；保存失败保留草稿，成功明确提示“已保存到本设备”。

## 实施顺序

1. 先为收集数据写失败测试：成员时间增删、偏好更新、人工候选与不变性。
2. 实现收集纯操作，作为 UI 的唯一事件编辑入口。
3. 用失败测试定义工作台空状态、列表选择和仓储保存反馈；实现列表与容器。
4. 用失败测试定义收集面板：成员切换、填写时间/偏好/候选、保存前校验和本地保存。
5. 用失败测试定义决策面板：前三方案、冲突披露、投票替换、仅可确认方案的确认路径。
6. 用失败测试定义确认/历史面板：重新协调、记录完成、完成后禁用操作。
7. 在 `AppShell` 和创建页接入工作台入口/创建成功跳转，最后做全量回归与构建。

## 风险与缓解

| 风险 | 缓解 |
| --- | --- |
| 工作台逐渐复制领域规则 | 所有编辑、投票、确认和历史都走已测试的领域函数。 |
| 多处保存导致选中事件过期 | 容器保存后更新单一当前事件状态，并刷新列表摘要。 |
| 没有完整时间交集时用户误以为能确认 | 决策卡保留冲突和不可确认原因，确认按钮禁用且给出文字说明。 |
| 单设备能力看起来像实时协作 | 标题与反馈明确写本设备模拟；不显示邀请/在线/同步图标。 |
| 表单过长、移动端难用 | 按阶段渐进披露，小屏单列，成员切换后只显示当前成员表单。 |
| 修改旧壳层造成回归 | AppShell 的新增入口独立于既有三 tab；保留其切换测试。 |

## 验证检查点

| 阶段 | 必须成立 | 命令 |
| --- | --- | --- |
| 收集操作 | 时间、偏好、候选操作纯且不改入参 | `npm test -- src/domain/__tests__/mealCollectionActions.test.ts` |
| 工作台/收集 | 本地列表、代填与保存路径可用 | `npm test -- src/pages/__tests__/MealWorkspaceView.test.tsx` |
| 决策/历史 | 投票、确认、重新协调、饭后记录交互可复现 | `npm test -- src/components/meal/__tests__/DecisionOptionsPanel.test.tsx src/components/meal/__tests__/MealHistoryPanel.test.tsx` |
| 壳层 | 创建后可进入工作台，旧 tab 未回归 | `npm test -- src/app/__tests__/AppShell.test.tsx` |
| 发布检查 | 全部领域/UI/既有功能均无失败 | `npm test; npm run build` |

## 不做的事

- 不在本模块接入真实数据库、登录、邀请、实时协作、地图或第三方餐厅/优惠数据。
- 不重构旧打卡/日历/分析页，不更换整体设计系统。
- 不将 AI 输出当作决策依据；本期只展示已有规则引擎结果。
