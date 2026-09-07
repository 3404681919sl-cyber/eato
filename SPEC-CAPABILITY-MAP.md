# Eato 第一阶段能力图

## 已确认范围

第一阶段在单一浏览器中用模拟成员跑通完整饭局决策闭环。数据存于本地；真实跨设备协作、身份和数据库在闭环稳定后接入。现有 Eato 的暖色视觉和既有页面保留，新饭局流程以增量方式加入。

| 模块 ID | 责任 | 依赖 |
| --- | --- | --- |
| `meal-domain` | 定义饭局、成员、时间、偏好、候选、投票、决策和历史的领域模型与校验 | — |
| `event-store` | 提供本地饭局仓储与版本化迁移；后续以相同接口接入真实数据库 | `meal-domain` |
| `decision-engine` | 计算共同时间、硬约束、可解释评分和前三方案 | `meal-domain` |
| `event-input` | 创建饭局、代入模拟成员、填写时间/偏好/候选/优惠入口 | `meal-domain`, `event-store` |
| `vote-and-history` | 投票、否决、确认结果与饭后记录 | `event-store`, `decision-engine` |
| `meal-ui` | 在既有视觉基线上呈现饭局流程 | 前述全部 |

构建顺序：`meal-domain` → `event-store` → `decision-engine` → `event-input` → `vote-and-history` → `meal-ui`。

## 第二阶段（不属于本期）

- `identity-and-sharing`：访客身份、可撤销分享 token、发起人身份绑定；微信登录仅在具备相应资质与密钥后评估。
- `realtime-store`：以 Supabase/Postgres 或等效真实数据库替换 `event-store`，并实现成员权限和实时同步。
- `live-ai-provider`：在服务端配置可替换的模型 Provider；浏览器不保存任何密钥。
- `restaurant-and-offer-provider`：只接入有授权或开放的数据源；不做未授权批量抓取。
