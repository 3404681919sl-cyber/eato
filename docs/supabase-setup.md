# Supabase 本地接入与 RLS 验证

本指南配置的是 Eato 的访客云端会话与餐局权限基础。它不包含、不需要、也不应记录任何服务角色密钥。

## 1. 创建项目并打开访客登录

1. 在 Supabase Dashboard 新建项目。
2. 打开 **Authentication → Providers → Anonymous**，启用 Anonymous sign-ins。
3. 在项目的 Connect/API 页面复制 **Project URL** 与 **Publishable key**。浏览器只使用这两个公开配置；不要把 `service_role` 放入前端或 `.env`。

## 2. 配置本地环境

复制 `.env.example` 为未提交的 `.env.local`，填写：

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

不要提交 `.env.local`。现有应用在缺少这两个值时会继续处于“本地模拟”身份模式，这是预期的安全降级。

## 3. 在 SQL Editor 执行迁移

请先按顺序审阅并执行以下迁移：

1. [`20260828000000_meal_access.sql`](../supabase/migrations/20260828000000_meal_access.sql)
2. [`20260828010000_cloud_event_store.sql`](../supabase/migrations/20260828010000_cloud_event_store.sql)

第二份迁移提供饭局聚合读取、保存与删除 RPC；它以当前 `auth.uid()` 为权限主体，云端首版只能由当前访客创建自己的单人饭局。确认后：

1. 打开 **SQL Editor**，新建查询。
2. 粘贴该迁移文件的全部内容并执行一次。
3. 在 Table Editor 确认出现八张表：`meal_events`、`meal_members`、`meal_availabilities`、`meal_preferences`、`meal_candidates`、`meal_votes`、`meal_decisions`、`meal_histories`，并在 Database Functions 中确认 `list_meal_events`、`get_meal_event`、`save_meal_event`、`delete_meal_event`。
4. 在每张表的 Policies 页面确认 RLS 已启用。

迁移包含创建者自动入会触发器。首版不提供成员自助加入、邀请链接或二维码：只能由饭局创建者通过后续受控的成员管理界面/API 加入其他已登录用户。

## 4. 启用饭局实时通知

在第 3 节的八张表与 RPC 均已确认后，打开 **Database → Replication → Supabase Realtime**，将以下八张表加入 `supabase_realtime` publication：

`meal_events`、`meal_members`、`meal_availabilities`、`meal_preferences`、`meal_candidates`、`meal_votes`、`meal_decisions`、`meal_histories`。

应用收到变更后只把它作为“需要刷新”的信号，并会通过既有 RPC 重新读取完整饭局；实时消息载荷不会直接写进页面状态。这样 RLS 和饭局聚合读取仍是唯一的数据事实来源。若连接断开，当前页面会提示“云端饭局同步暂时不可用”，本地已经加载的内容仍可查看。

请在两个不同的已获饭局访问权的浏览器 profile 中进行人工验证：

1. A 打开“我的饭局”，B 修改同一饭局的可用时间、偏好、候选、投票、决议或历史中的任意一项。
2. 确认 A 的页面自动更新为服务端重新读取后的完整饭局，而不是只显示消息载荷中的字段。
3. 关闭 A 的页面或切换离开饭局工作台，再让 B 修改；确认 A 不再保留活跃订阅。

## 5. 三位访客用户的人工 RLS 验证

使用三个独立浏览器 profile（或三个不同隐私窗口，且分别完成匿名登录）创建用户 A、B、C。请仅在测试项目中进行下列操作。

| 场景 | 操作 | 预期结果 |
| --- | --- | --- |
| 创建者自动入会 | A 插入 `creator_id = auth.uid()` 的 `meal_events` 行 | `meal_members` 自动出现 A 的 `creator` 行。 |
| 成员可读且仅能修改自己 | 由 A 通过受控流程添加已登录的 B；B 读饭局并写自己的时段、偏好、投票 | B 可读取同餐局数据；对自己的三类记录可写。 |
| 成员不能改共享核心内容 | B 尝试更改候选、成员、决议或历史 | 请求被 RLS 拒绝或影响零行。 |
| 非成员隔离 | C 查询八张餐局表，并尝试写入 A 的饭局关联行 | 查询不到 A 的饭局事实；写入被拒绝或影响零行。 |

当 B 被加入饭局前，请不要直接向 `meal_members` 发送任意用户 ID 的浏览器请求。生产中的“邀请并加入”需要单独设计受控 RPC 或 Edge Function，并验证被邀请用户的真实身份。

## 6. 证据边界

当前仓库能验证的是行映射、应用编译和 SQL 工件审阅。只有在真实项目中执行第 3、4、5 节后，才能确认 RLS 与实时订阅已在云端实际生效。
