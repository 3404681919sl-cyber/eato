# Eato 设计 Token 表

> 唯一事实来源。新增 UI 时从这里取值，禁止硬编码色值。

## 品牌色
| 名称 | 值 | 用途 |
|------|-----|------|
| 品牌主色 primary | `#BF4E2A` | 主按钮、强调、进度条、选中态 |
| 品牌辅助 | `#E8963C` | 徽章、次级强调、渐变 |

## 9 大分类配色（color 主色 / light 浅底）
| 分类 key | 中文 | emoji | color | light |
|----------|------|-------|-------|-------|
| hotpot | 火锅 | 🍲 | `#DC2626` | `#FEE2E2` |
| chinese | 中餐 | 🥢 | `#7C3AED` | `#EDE9FE` |
| fastfood | 面点 | 🍜 | `#16A34A` | `#DCFCE7` |
| asian | 日韩 | 🍣 | `#B45309` | `#FEF3C7` |
| western | 西餐 | 🍽️ | `#CA8A04` | `#FEF9C3` |
| bbq | 烧烤 | 🔥 | `#EA580C` | `#FFEDD5` |
| dessert | 茶饮 | 🧋 | `#DB2777` | `#FCE7F3` |
| seafood | 海鲜 | 🦐 | `#0369A1` | `#E0F2FE` |
| other | 其他 | 🍴 | `#6B7280` | `#F3F4F6` |

## 平台色（优惠比对）
| 平台 | color | bg | textColor |
|------|-------|-----|-----------|
| 美团 meituan | `#FFCC00` | `#FFFBE6` | `#664D00` |
| 抖音 douyin | `#161823` | `#F0F0F2` | `#161823` |
| 大众点评 dianping | `#FC5531` | `#FFF0ED` | `#C03010` |
| 淘宝闪购 taobao | `#FF4400` | `#FFF3EE` | `#C03010` |
| 闲鱼 xianyu | `#00B8C8` | `#E8FAFC` | `#007080` |

## 字体
| 角色 | 字体 |
|------|------|
| 标题（展示） | Playfair Display, serif |
| 正文 | DM Sans, sans-serif |
| 数字 / 代号 | DM Mono, monospace |

## 圆角 / 间距
- 卡片圆角：`rounded-2xl`（16px）
- 弹窗圆角：`rounded-2xl`
- 标签/头像：`rounded-full` / `rounded-xl`
- 标准间距节奏：4 / 8 / 12 / 16 / 24 / 32 px（Tailwind 默认 scale）
