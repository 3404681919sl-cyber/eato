# `realtime-meal-sync` 实施计划

对应规格：[SPEC-realtime-meal-sync.md](../SPEC-realtime-meal-sync.md)。本模块只把数据库变化转化为“重新读取完整饭局”的请求，不把 Realtime 行载荷当作页面事实。

## 实施顺序

1. 定义可注入的 Realtime 端口与事件标准化类型；先测试仅云端模式订阅、八表事件过滤与取消订阅。
2. 实现同步协调器：按 `event_id` microtask 合并重复通知；不同饭局保留独立刷新；订阅错误转为云端错误状态。
3. 用 Supabase 浏览器客户端实现端口适配器，限定 Postgres Changes 的目标表和当前可见饭局事件；不传 service-role。
4. 把工作台接入同步协调器：使用仓储重新读取完整事件、应用最后一次刷新结果、卸载时取消。
5. 更新设置指南中的 publication 与 A/B/C 人工验证剧本；运行全量验证并本地归档。

## 依赖图

```text
Supabase Realtime channel
          ↓
event-id normalizer → per-event coalescing coordinator
                              ↓
                  CloudMealEventRepository.getById
                              ↓
                       MealWorkspaceView state
```

## 风险与缓解

| 风险 | 缓解 |
| --- | --- |
| 八张表连续更新触发事件风暴 | 同一 `event_id` 只排队一次刷新。 |
| 直接使用局部事件载荷造成页面不一致 | 事件只含标识；页面从仓储重读完整聚合。 |
| 卸载后状态更新 | 每个订阅返回取消函数，并用 active 标记忽略迟到结果。 |
| 非成员收到事件 | 依赖 Realtime/RLS 配置；人工 A/B/C 剧本验证，不把本地端口测试误报为在线安全性。 |
| 订阅服务失败时误切回本地 | 保持云端错误状态，允许后续重试，不切换数据源。 |

## 验证检查点

| 阶段 | 证据 |
| --- | --- |
| 协调器 | 事件过滤、合并、取消与错误分类的单元测试。 |
| Supabase 适配 | 注入客户端夹具后订阅正确表/事件，且取消一次。 |
| 工作台 | 组件测试确认刷新而非直接合并行载荷。 |
| 在线 | 用户授权后在真实项目开启 publication，并按 A/B/C 剧本验证。 |
