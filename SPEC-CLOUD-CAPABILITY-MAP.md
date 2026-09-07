# Capability Map: `cloud-meal-collaboration`

目标：把当前“仅本设备模拟”的饭局数据迁移到受权限保护的云端，并为多人同时填写、投票与确认预留实时同步。现有本地仓储保留为离线演示/未配置云端时的显式降级路径。

## 已知约束

- 前端为 React + Vite 单页应用；不在浏览器保存任何服务端密钥。
- 当前没有数据库项目、项目 URL 或公开密钥；本地图形与饭局领域模型已存在。
- 真实多人协作需要可验证身份；不能以可伪造的本地昵称作为权限依据。
- 本期不接第三方餐厅、优惠、地图或支付数据，也不将 AI 输出写入决策事实。

## 已确认决策

1. 云端目标采用 Supabase（Postgres + Auth + Realtime），浏览器仅使用 Publishable/Anon Key 和 RLS。
2. 首版身份先使用轻量访客/匿名会话；微信一键登录作为后续同一 identity 模块的 provider，不在本轮实现。
3. 每个饭局由创建者管理成员；受邀成员只能读取/更新自己的可用时间、偏好与投票，不能编辑他人的资料或确认结果。
4. 仍保留单设备代填模式，但它必须在 UI 中明确为“模拟”，不能被误认为真实多人数据。

| Module id | Responsibility | Depends on |
| --- | --- | --- |
| `identity` | 建立/恢复受 Supabase Auth 保护的用户会话，暴露稳定 `userId`；后续可添加微信 provider。 | — |
| `meal-access` | 数据库迁移、饭局/成员/资料/候选/投票/结果表及 RLS；定义创建者与成员的权限边界。 | `identity` |
| `cloud-event-store` | 用 Supabase 实现现有 `MealEventRepository` 的云端读写与领域模型映射；明确加载、冲突和离线错误。 | `meal-access` |
| `realtime-meal-sync` | 订阅有权限的饭局变动、更新本地视图、清理订阅；不绕开 RLS。 | `identity`, `meal-access`, `cloud-event-store` |

Build order: `identity` → `meal-access` → `cloud-event-store` → `realtime-meal-sync`.

## 首模块的完成定义

`identity` 完成后，浏览器启动时能安全恢复或创建本期允许的轻量会话；业务代码只从一个身份边界获取当前用户；缺少 Supabase 配置时显示明确的本地模拟状态，不会静默伪造云端登录。

## 接入时需要的项目配置

创建 Supabase 项目后，需要提供 **Project URL** 与 **Publishable/Anon Key**；不要提供 `service_role` 密钥。
