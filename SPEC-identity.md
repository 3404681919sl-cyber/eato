# Spec: `identity`

> Capability map: [`cloud-meal-collaboration`](./SPEC-CLOUD-CAPABILITY-MAP.md) → `identity`

## Objective

为 Eato 的真实多人协作提供不可伪造的稳定用户标识。首版在浏览器启动时通过 Supabase Auth 恢复已有匿名会话，或创建一个新的匿名会话；UI 能明确说明当前是“访客云端会话”还是“本地模拟”。饭局领域与 UI 只依赖一个小的身份边界，后续加入微信一键登录时不改动饭局权限或仓储接口。

### Success criteria

1. 云端配置完整时，应用启动可恢复 Supabase 会话；无会话时仅创建匿名会话，不要求手机号、邮箱或密码。
2. 云端配置缺失、初始化或登录失败时，不伪造云端用户，不请求云端数据库，并向 UI 返回可解释状态。
3. 业务代码只从 `IdentityService` 获得当前 `userId`、状态和订阅；不直接读取 Supabase Auth。
4. 浏览器构建产物只包含 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_PUBLISHABLE_KEY`，永不包含 `service_role` 或数据库密码。
5. 会话变化（初始化、登录、登出、错误）可被订阅，且销毁订阅不会泄漏监听器。
6. 现有本地饭局功能在未配置云端时保持可用，并明确标注为本地模拟。

## Tech stack

- React 18、TypeScript 5.8、Vite 6。
- `@supabase/supabase-js` v2，用于浏览器 Auth 客户端；其默认会话持久化能力用于恢复匿名会话。
- Supabase Auth 匿名登录。微信登录、邮箱/手机号登录、用户资料页均不属于本模块。

## Commands

```powershell
npm test -- --run src/services/__tests__/identityService.test.ts
npm test
npm run build
```

## Project structure

```text
src/services/supabaseClient.ts                  # 仅从 Vite 环境读取公开配置并创建浏览器客户端
src/services/identityService.ts                 # 身份边界：初始化、读取、订阅、登出
src/services/__tests__/identityService.test.ts  # 服务行为测试
src/hooks/useIdentity.ts                        # React 订阅包装（仅当工作台 UI 接入时新增）
src/app/AppShell.tsx                            # 展示真实访客/本地模拟状态，不承担登录逻辑
.env.example                                    # 仅公开变量名，绝不填真实值
```

## Code style

服务返回可判定状态而不是吞掉失败或伪造结果：

```ts
export type IdentitySnapshot = {
  mode: "cloud-guest" | "local-simulation";
  status: "loading" | "ready" | "unconfigured" | "error";
  userId: string | null;
  message?: string;
};

export interface IdentityService {
  initialize(): Promise<IdentitySnapshot>;
  getSnapshot(): IdentitySnapshot;
  subscribe(listener: (snapshot: IdentitySnapshot) => void): () => void;
}
```

- 领域模型不引用 Supabase 类型；Supabase SDK 限于 `services/` 边界。
- 错误消息面向用户且不包含 URL、密钥、Token 或服务端原始响应。
- 所有测试使用注入的 Auth 端口，不在测试中读取真实 `.env` 或发网络请求。

## Testing strategy

- Vitest 单元测试，以一个内存 Auth 端口模拟 SDK 边界。
- 必测：缺失配置、本地模拟、首次匿名登录、已有会话恢复、匿名登录失败、会话变化订阅、取消订阅。
- AppShell 测试验证状态文案，不对 Supabase SDK 做集成伪测。
- 实际项目接入后，人工在浏览器验证首次访问/刷新后 `userId` 稳定；该步骤需要用户提供公开项目配置。

## Boundaries

- Always: 先写失败测试；RLS 前不让匿名 Key 访问饭局表；本地模拟和云端会话在 UI 中区分；提交前跑全量测试与构建。
- Ask first: 新增 npm 依赖、创建/修改 Supabase 项目、运行 SQL migration、变更 CI/部署环境变量、接入微信 OAuth。
- Never: 提交 `.env`、`service_role`、数据库连接串、用户 Token；在前端绕过 RLS；将匿名会话标为微信或实名认证账户。

## Open questions

- Supabase 项目尚未创建，暂时没有 URL 和 Publishable/Anon Key；因此本模块实现可验证配置缺失路径，但不能声称已连到真实云端。
- 匿名用户的显示名/头像由 `meal-access` 中的成员资料处理，而非在 Auth 元数据中存储。
