# `meal-access` 实施计划

对应规格：[SPEC-meal-access.md](../SPEC-meal-access.md)。本模块交付可审阅的 Supabase migration、行映射和人工验证指南；不在没有项目授权的情况下执行 SQL。

## 实施顺序

1. **定义关系模型与领域行映射**
   - 将现有 `MealEvent` 的饭局基础字段、成员、时间、偏好、候选、投票、决策与饭后记录映射为独立行。
   - 先写测试约束：映射保留所有领域事实，不允许将未知成员或不安全数值直接变成可写行。
   - 保持 Supabase SDK 类型在仓储模块之外，映射只使用项目领域类型。

2. **编写不可变的初始 migration**
   - 创建枚举/检查约束、八张饭局表、唯一索引、`updated_at` 函数与创建者自动入会触发器。
   - 为成员关系建立仅依赖 `auth.uid()` 的 helper；全表先 `enable row level security`。
   - migration 不写项目 URL、密钥或用户测试数据。

3. **逐表写 RLS policy 与最小权限**
   - 以“成员可读、创建者管理共享事实、成员仅管理自己”的权限矩阵逐表落实 `using` 与 `with check`。
   - 加入数据 API 所需的 `authenticated` 最小 `grant`；不向 `anon` 授予饭局表权限。
   - 复核触发器/辅助函数的 `security definer` 和固定 `search_path`，避免权限绕过。

4. **写项目配置与人工验证指南**
   - 记录创建 Supabase 项目、启用 Anonymous Sign-Ins、配置 `.env`、通过 SQL Editor 执行 migration 的最短步骤。
   - 给出三位匿名用户的验证剧本，明确每一步预期允许/拒绝结果。
   - 将“前端已编译”与“真实 RLS 已执行”的证据分开报告。

5. **全量验证与本地归档**
   - 运行映射/既有测试与构建；SQL 做语法和结构复核。
   - `git diff --check`、检查暂存范围后提交。没有用户授权、没有项目 URL/Key 时不执行 migration、不声称云端数据已可用。

## 依赖图

```text
MealEvent domain model
        ↓
row mapping and validation ──→ migration schema and constraints
                                      ↓
                                RLS policies and grants
                                      ↓
                              human Supabase verification
```

## Risks and mitigations

| 风险 | 缓解 |
| --- | --- |
| 将客户端昵称当作权限主体 | 所有写入 policy 以 `auth.uid()` 绑定，昵称仅为成员资料。 |
| RLS policy 漏掉一张子表 | migration 末尾逐表声明 RLS、grant 与 policy；规格权限矩阵逐项复核。 |
| 创建饭局和创建者成员不是原子操作 | `meal_events` insert 触发器自动写入 creator membership。 |
| 用户能加入任意饭局 | 首版不开放成员自助插入；后续邀请能力走受控 RPC/Edge Function。 |
| 尚无真实项目而误报验证 | 文档分别列出静态/本地测试与待执行的 SQL Editor 验证。 |

## Verification checkpoints

| Stage | Evidence | Command / action |
| --- | --- | --- |
| Mapping | 行映射完整、不可写值被拒绝 | `npm test -- --run src/services/__tests__/mealAccessSchema.test.ts` |
| Migration review | 每张表有约束、RLS、最小授权与 policy | 逐表审查 `supabase/migrations/*_meal_access.sql` |
| Project setup guide | 无密钥的可执行人工步骤 | 审阅 `docs/supabase-setup.md` |
| Regression | 应用和既有模块无回归 | `npm test`; `npm run build` |
