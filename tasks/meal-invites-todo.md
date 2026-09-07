# `meal-invites` 任务清单

> 前置条件：`SPEC-meal-invites.md` 与 `tasks/meal-invites-plan.md` 已按当前 MVP 假设确认。

## 1. 邀请 URL 与输入契约

- [x] 测试 token fragment URL、解析、无 token 与空昵称拒绝。
- [x] 实现不含 Supabase SDK 的邀请 URL/输入服务。

验收：测试先失败后通过；链接不含饭局标题或成员信息。

## 2. 受控数据库 RPC

- [x] 添加 invite token schema 与 `create_or_rotate_meal_invite`、`join_meal_invite` RPC migration。
- [x] 由 `auth.uid()` 创建/加入；旧 token 轮换后拒绝；重复加入幂等。

验收：仅在用户授权后执行 migration，并通过 SQL/双访客验证。

## 3. 云端邀请端口

- [x] 以共享 Supabase 浏览器客户端实现邀请 RPC 端口与仓储。
- [x] 测试请求参数、错误分类和不配置时行为。

验收：无 service-role，无匿名本地回退。

## 4. 工作台邀请 UI

- [x] 创建者可复制/轮换链接；受邀者在 token 页面填写昵称加入。
- [x] 本地模式无邀请入口；云端失败信息准确。

验收：组件测试覆盖创建者、受邀者和本地模式。

## 5. 在线验证与归档

- [x] 真实执行 migration 后用 A/B 访客完成加入、刷新和旧链接撤销验证。
- [x] 运行全量测试、构建、差异检查，精确暂存后创建本地提交。

验收：线上结果与未验证缺口分开记录；GitHub 推送另行确认。
