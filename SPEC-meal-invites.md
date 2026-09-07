# Spec: `meal-invites`

> Capability map: [`cloud-meal-collaboration`](./SPEC-CLOUD-CAPABILITY-MAP.md) → `meal-invites`

## Objective

让云端饭局的发起人生成可分享的邀请链接；另一位匿名访客打开链接、填写昵称并加入同一饭局。加入后成员可在既有工作台中读取饭局并仅修改自己的时间、偏好和投票。

## Assumptions

1. 本阶段继续采用已启用的 Supabase 匿名访客身份；微信 OAuth 不在本模块范围内。
2. 一个饭局同时仅有一个有效、可重复使用的邀请码；轮换而非过期时间或使用次数是 MVP 的撤销机制。
3. 链接中的令牌视为 bearer secret：获得链接的人可以申请加入，因此 UI 明确提示仅分享给受邀朋友。
4. 加入时昵称必填且只写入该访客自己的 `meal_members.display_name`。
5. 现有八张饭局表维持 Realtime；邀请码元数据无需订阅，成员加入事件已通过 `meal_members` 通知。

## Commands

`npm test -- src/services/__tests__/mealInviteService.test.ts`

`npm test`

`npm run build`

`git diff --check`

## Project structure

```text
supabase/migrations/..._meal_invites.sql         # invite token, RLS-safe RPCs
src/services/mealInviteService.ts                # token, join request contracts
src/services/supabaseMealInvitePort.ts           # publishable-key Supabase RPC adapter
src/services/mealInviteRepository.ts             # application-level invite boundary
src/components/meal/MealInvitePanel.tsx          # creator share / visitor join UI
src/pages/MealWorkspaceView.tsx                  # expose invite flow in cloud workspace
```

## Code style

```ts
const invitation = await inviteRepository.create(eventId);
const joinedEvent = await inviteRepository.join(invitation.token, displayName);
```

- 邀请端口只接受/返回令牌和已完整映射的饭局，页面不直连 Supabase RPC。
- 所有成员身份从 `auth.uid()` 派生；客户端永不提交可代替他人的 `user_id`。
- 链接使用 URL fragment 承载 token，避免 token 默认出现在 HTTP 请求路径和服务器日志中。

## Testing strategy

- 单元：令牌 URL 解析、空昵称拒绝、创建/轮换/加入端口的参数和失败分类。
- 组件：云端创建者可复制/轮换链接；链接携带 token 时显示加入表单；本地模式不显示邀请功能。
- 在线：A 创建链接，B 在独立访客会话加入，A/B 刷新后均可看到成员；轮换后 C 使用旧链接失败；B 更新自己的资料后 A 收到 Realtime 刷新。

## Boundaries

- Always: 令牌不进标题、日志或持久化页面状态；使用匿名会话的 `auth.uid()`；验证昵称并区分云端错误。
- Ask first: 执行新增 Supabase migration；启用新的 Realtime publication；推送 GitHub。
- Never: 浏览器使用 service-role；把邀请码当作成员身份；允许成员写入他人可用时间/偏好/投票；把邀请链接公开索引。

## Success criteria

1. 已登录的发起人可生成、复制和轮换一个饭局的链接。
2. 已登录的受邀访客能用链接和昵称加入，重复加入幂等。
3. 旧链接在轮换后被拒绝，非成员无 token 时仍不能发现饭局。
4. A/B 两个访客可按最小权限共同使用同一饭局；全量测试、构建通过。

## Open questions

- 微信登录接入后，是否需要把匿名访客升级并保留其已加入的成员记录。
- 产品后续是否需要单次链接、到期时间、人数上限或邀请审批准入。
