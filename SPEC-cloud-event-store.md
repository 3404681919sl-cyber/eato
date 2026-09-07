# Spec: `cloud-event-store`

> Capability map: [`cloud-meal-collaboration`](./SPEC-CLOUD-CAPABILITY-MAP.md) → `cloud-event-store`

## Objective

让已经处于 `cloud-guest / ready` 身份状态的用户，将饭局读写到 Supabase，并继续以现有 `MealEvent` 作为页面领域模型。未配置云端时保留明确的本地模拟仓储；云端已配置但写入失败时绝不静默写回本地，避免用户误以为多人数据已经同步。

成功的可验证定义：

- 云端访客先以自己的 `auth.uid()` 创建单人饭局；返回行完整还原为 `MealEvent`，后续受控邀请才加入真实成员。
- 创建、保存和删除以当前 `auth.uid()` 的数据库权限为最终边界；前端不传入可用于越权的身份主体。
- 聚合饭局保存具有单个数据库事务语义，不会因中间一张子表失败而留下半份饭局。
- 未配置时 UI 明示“本地模拟”；云端已配置而请求失败时 UI 明示可重试的云端错误。

## Assumptions

1. Supabase 项目会由用户创建，并先执行 `meal-access` 迁移；本模块不替代该前置条件。
2. 首版继续使用匿名访客身份；用户的 `auth.uid()` 是云端行权限主体，微信登录不在本模块范围。
3. 云端建局不复用“3–8 名模拟成员”的本地创建规则：仅创建当前访客为 `creator` 的单人饭局。现有 3–8 人代填流程仍只在本地模拟仓储可用。
4. 现有页面需要由同步仓储迁移为异步接口，避免把网络 I/O 伪装成 `localStorage` 同步读取。
5. 聚合写入新增一个受控、**security invoker** 的 Postgres RPC；它在事务内完成子表替换/写入，且仍受 RLS 和 `auth.uid()` 约束。它不是可被浏览器任意调用的 service-role 后门。
6. 本模块不做 Realtime 订阅、离线队列、冲突自动合并、邀请链接或 UI 视觉改版。

## Commands

```powershell
# 单元与组件回归
npm test -- --run src/services/__tests__/cloudMealEventRepository.test.ts
npm test
npm run build
git diff --check

# 真实项目由用户在 SQL Editor 明确授权后执行
# 依次执行 supabase/migrations/20260828000000_meal_access.sql
# 与后续 cloud-event-store migration 的内容
```

## Project structure

```text
src/services/mealEventRepository.ts                  # 异步仓储端口与可观察错误类型
src/services/localMealEventRepository.ts             # 保留本地模拟实现，适配异步端口
src/services/cloudMealEventRepository.ts             # Supabase 读写适配器，不含 UI 状态
src/services/mealAccessSchema.ts                      # 已有领域行映射；补充安全的反向映射
src/services/__tests__/cloudMealEventRepository.test.ts
src/hooks/useMealEventRepository.ts                   # 加载、保存、错误、重试的页面状态边界
supabase/migrations/<timestamp>_cloud_event_store.sql # 原子聚合保存 RPC 与必要约束
docs/supabase-setup.md                                # 补充执行顺序和人工验证
```

## Code style

仓储返回可判定的业务错误，不把权限/网络失败改写为本地成功：

```ts
export type MealStoreError = {
  code: "unconfigured" | "unauthorized" | "network" | "invalid-data";
  message: string;
};

export interface MealEventRepository {
  list(): Promise<MealEvent[]>;
  save(event: MealEvent): Promise<MealEvent>;
}
```

- 领域字段使用 camelCase；仅数据库边界使用 snake_case。
- 云端适配器只依赖浏览器 Publishable Key 和已登录会话，不接收 service role key。
- 页面不直接拼 Supabase 查询；它只依赖仓储端口和显式加载/错误状态。

## Data flow and transaction boundary

```text
UI action
  → async MealEventRepository
    → toMealAccessRows(event)
      → Supabase RPC: save_meal_event(rows)
        → one database transaction + RLS/auth.uid()
          → MealEvent returned to UI
```

- `list`/`getById` 从八张允许读取的表加载，按 `event_id` 聚合并校验关联完整性。
- 云端 `create` 只从当前访客生成一个 `creator` 成员；不能把本地生成的模拟成员 ID 写入云端。
- `create` 和 `save` 通过同一 RPC 写入；RPC 对创建事件限定 `creator_id = auth.uid()`，对既有事件限定创建者权限。
- `delete` 只删除当前创建者的 `meal_events` 行，依赖外键级联删除子表。
- 后续 `realtime-meal-sync` 只负责刷新此仓储的读取结果，不直接改写页面领域状态。

## Testing strategy

- 单元：真实的映射和仓储适配器输入输出；无配置、权限拒绝、网络错误、RLS 空结果、完整聚合和部分/畸形行都具有覆盖。
- 组件：切换本地/云端模式时加载状态、错误提示、重试路径；云端错误不可显示为“本地保存成功”。
- 数据库人工验证（真实项目）：两个匿名访客分别测试创建、读取、成员受限修改、创建者保存、非成员隔离和 RPC 事务回滚。
- 不测试“SQL 文件包含某段文字”；只有实际项目执行后才能宣称 RPC 与 RLS 生效。

## Boundaries

- Always: 保留本地模拟降级；所有云端访问走异步仓储；将网络、权限和无配置状态区分展示；测试后再提交。
- Ask first: 在真实 Supabase 项目执行 `meal-access` 或本模块迁移；填入任何项目 URL/Publishable Key；新增/修改 RPC；改变已部署表。
- Never: 浏览器保存/使用 service-role key；云端失败时静默回写本地；以昵称/前端 `userId` 作为授权依据；引入实时订阅或自动冲突合并。

## Success criteria

1. 本地模式的既有 3–8 人饭局创建、代填和历史流程仍可用，且明确显示“本地模拟”。
2. 配置云端并拥有访客会话后，饭局列表和饭局详情可通过受 RLS 保护的仓储读写。
3. 云端建局只生成当前访客的创建者成员；邀请加入真实用户属于后续模块，不能由浏览器伪造成员记录。
4. 一次聚合保存要么全部落库、要么返回错误；不会产生部分子表更新。
5. 非成员查询或写入不泄露数据、不被本地缓存伪装为成功。
6. 完整测试、构建、差异检查通过；真实 RLS/RPC 验证的缺口单独报告。

## Open questions

- 真实 Supabase 项目尚未创建，也没有 URL/Publishable Key；本模块暂不能完成在线集成或 RPC/RLS 验证。
- 首版受控添加成员的产品入口仍未定义。云端仓储不会假设客户端能把任意未知用户加入饭局；它仅保留数据库基础供后续邀请模块使用。
