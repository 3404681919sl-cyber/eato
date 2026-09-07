# `event-input` 实施计划

对应规格：[SPEC-event-input.md](../SPEC-event-input.md)。本模块在既有 Eato 页面旁新增饭局创建入口；创建结果写入既有 `MealEventRepository`，不改其存储实现，也不接入真实服务。

## 设计决定

1. 在 `src/services/mealEventFactory.ts` 放置“表单输入 → 完整 `MealEvent`”的纯创建函数。它依赖 `meal-domain`，但不依赖 React、`localStorage` 或路由。
2. 创建函数显式接受可注入的 `id` 与 `now`，使测试可重复；默认 ID 生成优先使用浏览器 `crypto.randomUUID()`，并只在不可用时使用本地降级生成器。
3. `CreateMealEventInput` 用单独的模拟成员结构表达昵称与头像；函数负责生成成员 ID、角色和默认偏好，避免 UI 重复领域初始化逻辑。
4. 补充创建阶段特有校验：日期范围、模拟成员昵称的空值与重复。基础预算、标题和人数仍复用 `validateMealDraft`，最终统一返回 `DomainIssue[]`。
5. UI 以 `CreateMealEventView` 为一个独立小页面接入，接收仓储实例而不自行读写 `localStorage`。提交成功后仅显示本地已创建和事件 ID；饭局详情跳转留给 `meal-ui`，不制造不存在的邀请/同步体验。
6. `AppShell` 只增加一个饭局入口和相应视图分支；现有三项 tab、数据 Provider 和布局不重构。

## 实施顺序

1. 先写创建工厂的失败测试，覆盖完整初始化、领域校验、日期范围、重复昵称和确定性 ID/时间。
2. 以最小实现建立输入类型、创建函数、ID 生成和默认偏好。
3. 先写创建页的交互失败测试，覆盖字段错误、仓储调用一次、失败时保留输入、成功反馈。
4. 实现创建页及其受控表单状态；将仓储错误转为页面可显示的消息。
5. 用一个窄的壳层改动接入“发起饭局”入口，保持旧 tab 正常可访问。
6. 运行模块测试、全量测试和生产构建；确认仅本模块文件进入提交。

## 风险与缓解

| 风险 | 缓解 |
| --- | --- |
| 表单层自行拼装领域对象而逐步偏离模型 | 所有 `MealEvent` 初始化集中于纯创建工厂并由单测固定。 |
| 创建按钮重复点击造成重复饭局 | 页面在请求期间禁用提交，测试断言仓储只调用一次。 |
| 模拟协作被误解为真实邀请 | 成功提示明确写“已保存到本设备”；不出现分享或同步状态。 |
| 新入口破坏旧工具流 | `AppShell` 仅增量扩展；保留原三项 tab 与数据 Provider。 |
| localStorage 错误在 UI 中丢失 | 仓储异常被捕获并显示为可恢复错误，草稿不清空。 |

## 验证检查点

| 阶段 | 必须成立 | 命令 |
| --- | --- | --- |
| 创建工厂 | 新测试先失败，再覆盖所有输入与默认值 | `npm test -- src/services/__tests__/mealEventFactory.test.ts` |
| 创建页 | 成功、失败与校验路径可通过 DOM 交互复现 | `npm test -- src/pages/__tests__/CreateMealEventView.test.tsx` |
| 壳层接入 | 现有视图不回归，新入口可达 | `npm test` |
| 发布检查 | TypeScript 与 Vite 生产构建成功 | `npm run build` |

## 不做的事

- 不改 `LocalMealEventRepository` 的数据格式或迁移策略。
- 不在客户端保存任何第三方密钥，不调用 AI、餐厅、地图或优惠 API。
- 不实现分享、鉴权、真实成员、实时刷新或饭局详情页。
