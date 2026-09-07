# `identity` 实施计划

对应规格：[SPEC-identity.md](../SPEC-identity.md)。本模块仅建立匿名访客身份边界，不创建数据库表、不执行迁移、不接微信 OAuth。

## 实施顺序

1. **定义可替换的身份端口与快照**
   - 在服务层定义 `IdentitySnapshot`、`IdentityAuthPort`、`IdentityService`。
   - 先用内存端口测试配置缺失、会话恢复、匿名登录、错误与订阅；生产实现不直接暴露 SDK 类型。

2. **增加受限的 Supabase 客户端工厂**
   - 只读取 `VITE_SUPABASE_URL`、`VITE_SUPABASE_PUBLISHABLE_KEY`。
   - 两者任一缺失时返回“未配置”而非构造半有效客户端；禁止读取服务端密钥名。
   - 新增 `.env.example` 只列公开变量名并在 `.gitignore` 保持 `.env*` 忽略。

3. **实现匿名会话服务**
   - `initialize()`：已有 session 直接恢复；没有则调用匿名登录；异常转为无敏感信息的错误快照。
   - `subscribe()`：桥接 Auth 状态变化并允许调用方取消监听。
   - 登出不在首版 UI 暴露，但服务接口为后续登录 provider 保持可扩展。

4. **接入应用状态提示**
   - 添加 `useIdentity` React 订阅 Hook。
   - AppShell 在饭局入口显示“云端访客”或“本地模拟”；不改变旧打卡、日历和数据页。
   - 暂不将云端身份写入饭局数据；该工作在 `meal-access` / `cloud-event-store` 完成。

5. **配置与回归验证**
   - 运行身份服务、Hook、AppShell 的测试以及全量测试/构建。
   - 手动配置真实 Supabase URL/Publishable Key 后，验证首开创建匿名 session、刷新恢复同一 `userId`；无配置时验证本地模拟提示。

## 依赖图

```text
环境公开配置
      ↓
Supabase client factory ──→ IdentityAuthPort
                               ↓
                         IdentityService
                               ↓
                         useIdentity Hook
                               ↓
                           AppShell 提示
```

## 风险与缓解

| 风险 | 缓解 |
| --- | --- |
| 未配置项目时误报已云端登录 | 客户端工厂返回 `null`，服务快照固定为 `unconfigured`。 |
| 前端误放服务密钥 | `.env.example` 只出现 Publishable Key；代码不读取 `SERVICE_ROLE`。 |
| SDK 事件监听泄漏 | `subscribe()` 必须返回清理函数，测试验证取消后不再收到快照。 |
| 现有本地饭局被云端配置阻断 | 身份初始化失败不阻止本地饭局工作台；仅改变状态文案。 |
| 匿名会话与未来微信登录耦合 | 应用只依赖稳定 `userId` 和快照，provider 细节封装在端口内。 |

## 验证检查点

| 阶段 | 必须成立 | 命令 |
| --- | --- | --- |
| 身份服务 | 未配置、恢复、匿名登录、失败、订阅都可复现 | `npm test -- --run src/services/__tests__/identityService.test.ts` |
| UI 提示 | 饭局入口清楚显示云端访客或本地模拟 | `npm test -- --run src/app/__tests__/AppShell.test.tsx` |
| 发布检查 | 既有功能与类型构建无回归 | `npm test`; `npm run build` |
