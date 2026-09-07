# `identity` 任务清单

- [x] Task: 用失败测试定义身份快照、配置缺失与匿名会话行为
  - Acceptance: 未配置时明确为本地模拟；已有 session 直接恢复；无 session 时仅发起一次匿名登录；失败不暴露原始错误或伪造用户。
  - Verify: `npm test -- --run src/services/__tests__/identityService.test.ts`
  - Files: `src/services/__tests__/identityService.test.ts`, `src/services/identityService.ts`

- [x] Task: 实现独立于 SDK 的身份服务与可注入 Auth 端口
  - Acceptance: `initialize/getSnapshot/subscribe` 满足规格；取消订阅后不再通知；Supabase 类型不泄漏到调用方。
  - Verify: `npm test -- --run src/services/__tests__/identityService.test.ts`
  - Files: `src/services/identityService.ts`

- [x] Task: 用失败测试并实现 Supabase 公开客户端工厂
  - Acceptance: 仅在 URL 和 Publishable Key 都存在时创建客户端；不读取服务端密钥；配置缺失不产生网络调用。
  - Verify: `npm test -- --run src/services/__tests__/supabaseClient.test.ts`
  - Files: `src/services/__tests__/supabaseClient.test.ts`, `src/services/supabaseClient.ts`, `.env.example`

- [x] Task: 用失败测试定义并实现 React 身份订阅 Hook
  - Acceptance: Hook 初始为 loading，初始化后更新快照，并在卸载时清理订阅。
  - Verify: `npm test -- --run src/hooks/__tests__/useIdentity.test.ts`
  - Files: `src/hooks/__tests__/useIdentity.test.ts`, `src/hooks/useIdentity.ts`

- [x] Task: 将身份状态接入饭局入口且保留本地降级
  - Acceptance: AppShell 显示“云端访客”或“本地模拟”；现有三 tab 和本地饭局创建/工作台路径不变。
  - Verify: `npm test -- --run src/app/__tests__/AppShell.test.tsx`
  - Files: `src/app/AppShell.tsx`, `src/app/__tests__/AppShell.test.tsx`

- [x] Task: 加入客户端依赖、执行全量验证与本地归档
  - Acceptance: `@supabase/supabase-js` 版本固定在 package manifest；不提交 `.env` 或密钥；所有身份测试、全量测试和构建通过；提交只包含本模块文件。
  - Verify: `npm test`; `npm run build`; `git diff --check`; `git status --short`
  - Files: `package.json`, `SPEC-CLOUD-CAPABILITY-MAP.md`, `SPEC-identity.md`, `tasks/identity-plan.md`, `tasks/identity-todo.md`
