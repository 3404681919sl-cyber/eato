# `cloud-event-store` 实施计划

对应规格：[SPEC-cloud-event-store.md](../SPEC-cloud-event-store.md)。目标是把当前同步本地餐局仓储升级为可切换的异步仓储，并为真实 Supabase 读写准备安全、可验证的事务边界。

## 实施顺序

1. **先收紧仓储接口与错误模型**
   - 将 `MealEventRepository` 变为 Promise 接口，定义可展示、不可伪装的 `unconfigured`、`unauthorized`、`network`、`invalid-data` 错误。
   - 为本地仓储添加异步适配，保留既有 localStorage 行为与错误语义。
   - 用现有页面行为作为回归基线，避免一次性掺入 Supabase。

2. **补足双向行映射与失败测试**
   - 在已有 `mealAccessSchema` 增加数据库行到 `MealEvent` 的纯反向映射，验证八类行的归属、唯一性和完整性。
   - 先测 malformed/越权可见的孤儿行不被还原为可编辑餐局。

3. **实现可注入的 Supabase 云端仓储**
   - 定义最小数据端口，避免单元测试依赖真实网络。
   - 实现列表/详情聚合读取、创建/保存 RPC 调用、创建者删除及错误翻译。
   - 所有云端写入都从身份会话/数据库 `auth.uid()` 推导权限；仓储 API 不接受授权身份参数。

4. **在独立迁移中加入原子聚合保存 RPC**
   - 新建不可变 migration，提供 security-invoker、固定搜索路径的 RPC。
   - 事务内写入饭局和全部子行；服务器侧验证创建者、成员、候选、预算、状态和关联归属。
   - 不执行该 migration，直到用户创建项目并明确授权 SQL Editor 操作。

5. **页面接入与可见状态**
   - 新增仓储选择器/Hook：身份未配置用本地模拟；云端访客就绪用云端仓储；已配置但请求失败显示云端错误和重试。
   - 把创建与工作台改为等待异步读写，避免旧同步状态掩盖加载或失败；云端创建入口只生成当前访客一个 `creator` 成员，本地入口才保留 3–8 人代填。
   - 不接 Realtime；实时变动由下一个模块处理。

6. **验证、人工剧本与归档**
   - 单元、组件、全量测试、构建与差异检查。
   - 更新 Supabase 指南，明确两份 migration 的顺序及 A/B/C 三匿名用户验证剧本。
   - 精确暂存本模块文件、创建本地提交；推送前再次询问。

## 依赖图

```text
async repository port + local adapter
             ↓
row hydration/validation ←→ Supabase port adapter
             ↓                       ↓
          page state            transaction RPC migration
             └───────────────→ end-to-end manual RLS verification
```

## 主要风险与缓解

| 风险 | 缓解 |
| --- | --- |
| 异步接口破坏当前页面 | 先用异步 local adapter 跑页面回归，再接云端实现。 |
| 多请求写入留下部分数据 | 写入统一收束到事务 RPC；页面不拼八张表请求。 |
| 将模拟成员写入 `auth.users` 外键 | 云端创建只使用当前 `auth.uid()`；3–8 人代填固定留在本地模拟模式。 |
| RPC 成为绕过 RLS 的后门 | 使用 security invoker、固定 `search_path`、内部按 `auth.uid()` 验证，不授予匿名角色。 |
| 云端故障被误报为保存成功 | `cloud-guest` 模式禁止静默回退；错误经 Hook 显式呈现。 |
| 当前没有项目不能误报在线可用 | 本地测试与 SQL Editor 人工验证分开报告。 |

## 验证检查点

| 阶段 | 证据 |
| --- | --- |
| 接口收敛 | 本地仓储的 Promise 行为和既有页面测试均通过。 |
| 映射 | 完整聚合行可还原；畸形关系被拒绝。 |
| 云端适配器 | 使用严格数据端口夹具验证请求、读取与错误分类。 |
| RPC 工件 | 参数、事务、权限边界和 migration 顺序经人工审阅。 |
| 页面 | 本地/云端加载、保存错误与重试均有组件测试。 |
| 在线验证 | 仅真实 Supabase 项目实际执行后记录。 |
