# `realtime-meal-sync` 任务清单

> 前置条件：`SPEC-realtime-meal-sync.md` 与 `tasks/realtime-meal-sync-plan.md` 已确认。
>
> 边界：只创建本地代码、测试、文档和配置说明；不在真实项目开启 publication 或执行远程配置。

## 1. 同步协调器测试先行

- [x] 测试八张饭局表事件提取 `event_id`、未知表忽略、同事件合并、不同事件分开、取消后不回调。
- [x] 测试读取失败保留云端错误，绝不改用本地仓储。

验收：测试先失败，且断言针对可观察刷新行为。

## 2. 实现 Realtime 同步协调器

- [x] 定义最小订阅端口和可取消协调器；只将变化事件转换为 `eventId`。
- [x] 在 microtask 中合并重复饭局通知，并暴露订阅错误状态。

验收：协调器单元测试通过，未引入 Supabase 依赖到领域层。

## 3. Supabase Realtime 适配器

- [x] 用可注入浏览器客户端实现八表 Postgres Changes 订阅、事件标准化和 channel 清理。
- [x] 测试目标表限制与 unsubscribe，不使用 service-role。

验收：适配器只依赖 Publishable Key 客户端；真实 publication 留待人工执行。

## 4. 工作台刷新接入

- [x] 仅在云端模式启用同步；收到 `eventId` 后调用现有云端仓储读取完整饭局。
- [x] 展示同步中/失败状态；组件卸载后忽略迟到读取。

验收：组件测试证明页面不直接写入 Realtime payload，本地模拟不创建订阅。

## 5. 指南、验证与归档

- [x] 更新 Supabase 设置指南的 publication 步骤和 A/B/C 验证剧本。
- [x] 运行目标测试、完整测试、构建和 `git diff --check`。
- [ ] 精确暂存并创建本地 Git 提交；不包含既有用户改动，推送另行确认。

验收：本地验证可复现；真实 Realtime/RLS 在线验证缺口明确记录。
