# Eato API 文档

> API 基地址: `http://localhost:3001`
>
> 前端开发服务器已配置 `/api` 代理到后端，前端代码中直接请求 `/api/xxx` 即可。

---

## 健康检查

### `GET /api/health`

返回服务器运行状态。

**响应示例:**
```json
{
  "status": "ok",
  "timestamp": "2026-07-18T00:00:00.000Z"
}
```

---

## 比价

### `GET /api/deals`

按餐厅和品类查询各平台优惠。

**参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `place` | string | 是 | 餐厅名称（如 "海底捞火锅"） |
| `category` | string | 是 | 品类（hotpot/cafe/noodles/sushi/western/bbq/local/other） |

**响应:**
```json
{
  "deals": [
    {
      "platform": "meituan",
      "platformName": "美团",
      "description": "双人火锅套餐 含饮料",
      "price": 118,
      "originalPrice": 158,
      "discount": 25,
      "isBest": false,
      "deepLink": "https://i.meituan.com/awp/h5/search/all/?keyword=海底捞火锅",
      "tag": "热销"
    }
  ],
  "bestStack": "先买套餐券（¥108），再用会员折扣，最终到手约 ¥99",
  "saving": 59,
  "finalPrice": 99,
  "bestUrl": "https://...",
  "keyword": "%E6%B5%B7%E5%BA%95%E6%8D%9E"
}
```

### `GET /api/deals/platforms`

获取支持的平台列表。

**响应:**
```json
[
  { "id": "meituan",  "name": "美团",     "color": "#FFCC00", "searchUrl": "..." },
  { "id": "douyin",   "name": "抖音",     "color": "#161823", "searchUrl": "..." },
  { "id": "dianping", "name": "大众点评", "color": "#FC5531", "searchUrl": "..." },
  { "id": "taobao",   "name": "淘宝闪购", "color": "#FF4400", "searchUrl": "..." },
  { "id": "xianyu",   "name": "闲鱼",     "color": "#00B8C8", "searchUrl": "..." }
]
```

---

## 餐厅

### `GET /api/restaurants`

获取所有餐厅列表。

**参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `q` | string | 否 | 搜索关键词（按名称模糊匹配） |

### `GET /api/restaurants/:id`

获取单个餐厅详情。

### `POST /api/restaurants`

创建新餐厅。

**请求体:**
```json
{
  "name": "新餐厅",
  "category": "hotpot",
  "mood": "excited",
  "stars": 4,
  "plannedMenu": "招牌菜"
}
```

### `PATCH /api/restaurants/:id`

更新餐厅信息（部分更新）。

### `DELETE /api/restaurants/:id`

删除餐厅。

---

## 用户

### `GET /api/users`

获取用户列表。

### `GET /api/users/:id`

获取单个用户。

### `POST /api/users`

创建新用户。

---

## 分析

### `GET /api/analytics/overview`

获取聚合分析数据。

**响应:**
```json
{
  "totalRestaurants": 8,
  "avgStars": 4.1,
  "byCategory": { "hotpot": 1, "noodles": 1, ... },
  "topRated": [...],
  "monthlySpending": [...]
}
```

---

## 日历

### `GET /api/calendar/slots`

获取所有约饭时间段。

### `POST /api/calendar/slots/toggle`

切换用户在某时间段的标记状态。

**请求体:**
```json
{
  "day": "周一",
  "time": "12:00",
  "userId": "a"
}
```

### `GET /api/calendar/users`

获取日历用户列表。

---

## 数据说明

当前所有数据均为 **mock 数据**，存储在服务器内存中。重启后会重置。

真实第三方 API 集成（淘宝客 / 京东联盟）已在 `server/src/services/deals.js` 中预留注释桩，填入 API Key 后即可对接真实比价数据。
