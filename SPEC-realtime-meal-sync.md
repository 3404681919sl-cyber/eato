# Spec: `realtime-meal-sync`

> Capability map: [`cloud-meal-collaboration`](./SPEC-CLOUD-CAPABILITY-MAP.md) → `realtime-meal-sync`

## Objective

在已配置云端、且 `cloud-guest / ready` 的会话中订阅当前用户可读取的饭局变化。收到事件后只触发受 RLS 保护的仓储重新读取，不把 Realtime payload 直接写入页面状态；这样可复用行映射与完整性校验，并避免部分表变更造成页面半更新。

成功的可验证定义：

- 仅在云端仓储模式创建订阅，退出页面、身份改变或组件卸载时可靠取消。
- 事件按 `event_id` 合并，在短时间内只发起一次刷新；失序或重复事件不会覆盖最新完整读取结果。
- Realtime 订阅不能扩大 RLS 可见范围；刷新失败显示云端错误，不回退或伪造本地同步成功。
- 未配置云端时没有 WebSocket、订阅或 Realtime publication 依赖。

## Assumptions

1. 用户将在真实项目中执行 `meal-access` 与 `cloud-event-store` 两份迁移后，才执行本模块所需的 publication 配置。
2. Postgres Changes 事件只是“数据可能变化”的信号；页面真实内容永远从 `CloudMealEventRepository.list/getById` 重读。
3. 首版仅同步饭局成员已获授权可读取的变更；邀请、在线状态、光标、聊天和冲突自动合并不在范围内。
4. 本地模拟模式继续完全离线；不尝试把 localStorage 变化广播给其他浏览器。

## Commands

```powershell
npm test -- --run src/services/__tests__/mealRealtimeSync.test.ts
npm test
npm run build
git diff --check

# 真实 Supabase 项目由用户明确授权后执行
# 在 Database → Replication 为以下表开启 Realtime：
# meal_events, meal_members, meal_availabilities, meal_preferences,
# meal_candidates, meal_votes, meal_decisions, meal_histories
```

## Project structure

```text
src/services/mealRealtimeSync.ts                 # 可注入订阅端口、按 event_id 合并刷新
src/services/__tests__/mealRealtimeSync.test.ts  # 订阅过滤、合并、清理与错误路径
src/services/supabaseMealRealtimePort.ts         # Supabase Postgres Changes 适配器
src/app/AppShell.tsx                             # 仅云端模式加载并注入订阅器
src/pages/MealWorkspaceView.tsx                  # 展示同步中/失败，不直写 Realtime payload
docs/supabase-setup.md                           # 补充 publication 和两浏览器验证剧本
```

## Code style

```ts
const unsubscribe = sync.subscribe(eventId => {
  void repository.getById(eventId).then(replaceLoadedEvent);
});

return () => unsubscribe();
```

- Realtime port 只暴露订阅、取消和标准化 `eventId`，不向页面泄露底层 channel。
- 对同一 `eventId` 的连续通知进行 microtask 合并；刷新保留最后一次请求结果。
- 订阅失败和读取失败按云端错误显示，绝不调用 `LocalMealEventRepository` 兜底。

## Testing strategy

- 单元：仅云端启用、八表事件过滤、同事件合并、不同事件分别刷新、订阅取消、读取失败。
- 组件：工作台加载后显示云端状态，收到通知后刷新正确饭局；卸载后不再更新状态。
- 人工：A/B 两个匿名访客先按受控成员流程加入同一饭局；A 修改候选或决议，B 页面刷新；C（非成员）看不到饭局且不会被订阅回调暴露内容。

## Boundaries

- Always: 事件后重读并做领域映射；清理 channel；显示同步/失败状态；在真实项目验证前区分“工件已完成”和“实时已生效”。
- Ask first: 在 Realtime publication 加表；启用 Replication；执行任何真实数据库配置。
- Never: 在浏览器用 service-role；信任 Realtime payload 绕过仓储校验；为本地模拟模式建立 WebSocket；实现邀请、聊天或在线状态。

## Success criteria

1. 云端模式可以安全订阅已授权饭局变更，并以完整仓储读取更新页面。
2. 同一事件风暴不会产生重复读取或 UI 抖动；订阅可被完全清理。
3. 本地模式行为与性能不变。
4. 所有本地测试与构建通过；真实 publication/RLS 验证的缺口明确保留。

## Open questions

- 真实 Supabase 项目、publication 与第二位已加入成员都尚不存在，不能在本地证明端到端实时性。
- 当前受控邀请入口未交付；双用户人工验证需在该能力完成后进行。
