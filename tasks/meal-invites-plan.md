# `meal-invites` 实施计划

对应规格：[SPEC-meal-invites.md](../SPEC-meal-invites.md)。本模块建立邀请令牌和受控加入边界，不改变既有饭局聚合存储结构。

## 实施顺序

1. 先定义纯前端邀请链接与输入校验服务，并以测试固定 token fragment 解析和空昵称拒绝。
2. 增加 Supabase migration：每饭局一个随机令牌，创建/轮换/加入 RPC；由数据库从 `auth.uid()` 写入成员。
3. 实现可注入 Supabase 邀请端口与仓储，复用共享浏览器客户端和现有错误分类。
4. 在云端工作台加入创建者分享/轮换面板及受邀者加入入口；本地模式不显示。
5. 执行 migration 后进行 A/B 匿名访客、旧链接撤销和 Realtime 人员刷新验证；再完成完整测试与 Git 存档。

## 依赖图

```text
invite token migration + RPC
          ↓
Supabase invite port → invite repository → invite URL service
                                             ↓
                                  MealInvitePanel / workspace route
                                             ↓
                           A/B anonymous visitor E2E + Realtime
```

## 风险与缓解

| 风险 | 缓解 |
| --- | --- |
| 链接泄露 | 使用高熵 token、URL fragment、支持创建者轮换。 |
| 客户端伪造成员身份 | 加入 RPC 仅信任 `auth.uid()`，不接收 `user_id`。 |
| 重复点击/重复打开 | `meal_members(event_id, user_id)` 主键与 RPC 幂等返回。 |
| 令牌进分析/日志 | 不放 query/path；页面不将 token 写入普通饭局状态。 |
| 本地模拟被误当多人 | 本地模式隐藏邀请入口和加入路由。 |

## 验证检查点

| 阶段 | 证据 |
| --- | --- |
| URL 服务 | token 生成、fragment URL、解析和无效输入测试。 |
| RPC 适配 | 仅调用批准的 RPC、没有 service-role、错误可分类。 |
| UI | 云端创建者/受邀者路径组件测试，本地模式不可见。 |
| 在线 | A 创建→B 加入→双端刷新；轮换→旧链接拒绝；成员变更触发刷新。 |
