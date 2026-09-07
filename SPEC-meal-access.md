# Spec: `meal-access`

> Capability map: [`cloud-meal-collaboration`](./SPEC-CLOUD-CAPABILITY-MAP.md) → `meal-access`

## Objective

为真实多人饭局建立 Postgres 数据模型、成员关系和 Row Level Security（RLS）。所有访问以 Supabase Auth 的 `auth.uid()` 为准，而不是浏览器昵称。创建者可以管理饭局和成员；成员只读取可见饭局，并编辑自己的可用时间、偏好与投票。领域决策规则继续在前端纯函数中执行，数据库只保存可追溯事实。

## Scope

### Tables

| Table | Purpose | Primary owner |
| --- | --- | --- |
| `meal_events` | 饭局基础信息、候选日期、状态、创建者 | creator |
| `meal_members` | 饭局成员及显示名、角色 | creator manages |
| `meal_availabilities` | 成员可用日期和餐段 | row member |
| `meal_preferences` | 成员菜系、忌口、预算和灵活度 | row member |
| `meal_candidates` | 人工候选地点/菜系与可选价格 | creator |
| `meal_votes` | 成员对候选的支持/中立/否决 | row member |
| `meal_decisions` | 创建者确认的候选、日期、理由 | creator |
| `meal_histories` | 确认后的实际花费、评分、备注 | creator |

### Data rules

- 所有主键为 UUID；`meal_events.creator_id`、`meal_members.user_id` 都引用 `auth.users`。
- `meal_events` 创建时通过触发器为 `creator_id` 创建一条 `creator` 成员记录；客户端不直接伪造创建者成员。
- `meal_members` 的 `(event_id, user_id)` 唯一；可用时间的 `(event_id, user_id, date, meal_period)` 唯一；投票的 `(event_id, user_id, candidate_id)` 唯一。
- `meal_preferences`、`meal_decisions`、`meal_histories` 每饭局/成员或饭局至多一条，使用主键约束代替“最后一条覆盖”的隐式约定。
- 菜系、忌口是 `text[]`；预算、实际人均消费为非负数；评分限制 1–5；饭局状态限制为领域状态集合。
- `created_at`、`updated_at` 使用 UTC `timestamptz`；更新触发器统一维护 `updated_at`。

## Permission model

| Actor | Select | Insert/Update/Delete |
| --- | --- | --- |
| 未认证请求 | 无 | 无 |
| 成员 | 所在饭局及所有协作所需事实 | 仅自己的可用时间、偏好、投票 |
| 创建者 | 所在饭局及所有协作所需事实 | 饭局基础信息、成员、候选、确认结果、饭后记录 |

RLS 的可复用边界：

```sql
create function public.is_meal_member(target_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.meal_members
    where event_id = target_event_id and user_id = auth.uid()
  );
$$;
```

- 函数只回答当前认证用户是否为目标饭局成员；不接受任意用户 ID，避免客户端扩大查询范围。
- 所有表先启用 RLS，再授予 `authenticated` 最小表权限，再创建 policy。
- Supabase Publishable/Anon Key 只能依赖 RLS；`service_role` 只允许未来可信服务端使用。

## Commands

```powershell
# 本模块实现后的本地回归
npm test -- --run src/services/__tests__/mealAccessSchema.test.ts
npm test
npm run build

# 用户在 Supabase SQL Editor 明确授权后执行（文件路径待计划确定）
# 将 supabase/migrations/<timestamp>_meal_access.sql 的内容粘贴执行
```

## Project structure

```text
supabase/migrations/<timestamp>_meal_access.sql  # schema, triggers, RLS, grants; 不包含密钥
src/services/mealAccessSchema.ts                 # 领域模型到行模型的共享类型/映射，仅在后续仓储使用
src/services/__tests__/mealAccessSchema.test.ts  # 纯映射、约束输入及权限意图测试
docs/supabase-setup.md                           # 创建项目、启用匿名登录、执行 migration 的人工步骤
```

## Code style

SQL policy 必须同时声明 `using` 与 `with check`，避免“可读但能写他人行”或“可插入但不能读取结果”的不对称漏洞：

```sql
create policy "members_manage_own_votes"
on public.meal_votes
for all to authenticated
using (user_id = auth.uid() and public.is_meal_member(event_id))
with check (user_id = auth.uid() and public.is_meal_member(event_id));
```

应用层不复制 RLS 作为安全边界；应用检查只用于提供友好提示，权限最终由数据库保证。

## Testing strategy

- 单元：字段/行映射不丢失饭局领域事实，拒绝不能安全落库的值。
- Supabase SQL Editor 人工验证（需要真实项目）：
  1. 以两个匿名用户创建 session。
  2. 创建者创建饭局；触发器自动加入创建者。
  3. 通过受控成员添加流程让第二用户加入。
  4. 验证第二用户读得到饭局、只能修改自己的资料/投票，不能改候选、成员或确认结果。
  5. 验证无成员关系的第三用户对每张饭局表均返回零行/权限拒绝。
- 不把“SQL 文件存在”当作验证；未配置真实 Supabase 项目前，不宣称 RLS 已实际生效。

## Boundaries

- Always: RLS 覆盖每张 `public` 饭局表；以 `auth.uid()` 绑定写入；为关键唯一性、数值范围和状态设数据库约束；迁移可重复审阅。
- Ask first: 创建 Supabase 项目、启用匿名登录、运行任何 migration、在 Realtime publication 加表、改变既有生产表、运行 service-role 脚本。
- Never: 使用前端传来的 `user_id` 授权；为方便开发关闭 RLS；在 migration、日志、测试夹具或 README 放入 Token/数据库 URL；实施邀请链接、微信 OAuth、推送或第三方数据接入。

## Open questions

- 真实项目尚未创建：尚无 URL/Publishable Key，不能执行 migration 或测试 RLS。
- 首版的“邀请成员”交付形态待定。数据库层先提供创建者管理成员的安全基础；可分享邀请链接/二维码属于独立产品能力，不能由前端直接插入任意用户成员关系替代。
