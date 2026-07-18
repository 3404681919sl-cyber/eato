# Eato - Dining & Travel Planner App 🍽️

一款智能美食旅行规划应用，帮助你和朋友一起记录餐厅打卡、安排约饭时间、分析消费习惯，还能一键比对各平台优惠！

## ✨ 功能特性

| 功能 | 说明 |
|------|------|
| 🏠 **打卡表** | 收藏想去的餐厅，记录每次打卡评价和花费，支持评分/分类/心情标记 |
| 📅 **约饭日历** | 和朋友标记空闲时间，轻松安排聚餐，支持时段筛选（午餐/下午茶/晚餐） |
| 📊 **数据分析** | 可视化消费趋势、品类偏好、心情分布、评分分布、约饭搭档统计 |
| 💰 **智能比价** | 一键对比美团、抖音、大众点评、淘宝闪购、闲鱼等平台优惠，含真实跳转链接 |
| 👥 **多人协作** | 多用户（小美/阿帅/阿豪）空闲时间合并，自动计算最佳约饭时段 |
| ⚙️ **数据管理** | 导出备份/重置数据/编辑餐厅信息 |
| 📤 **导出CSV** | 导出打卡数据为CSV文件，兼容Excel/Numbers（含中文BOM） |
| 👫 **好友邀请** | 生成邀请码分享给好友 |

## 🏗️ 技术栈

| 层 | 技术 |
|-----|------|
| **前端框架** | React 18 + TypeScript |
| **构建工具** | Vite 6 |
| **样式** | Tailwind CSS 4 + shadcn/ui |
| **图表** | Recharts 2 |
| **图标** | Lucide React |
| **后端** | Express (API 骨架) |
| **状态持久化** | localStorage |

## 🚀 快速开始

### 环境要求
- Node.js >= 18
- npm（推荐）

### 安装 & 运行

```bash
# 1. 克隆项目
git clone https://github.com/3404681919sl-cyber/eato.git
cd eato

# 2. 安装前端依赖
npm install

# 3. 安装后端依赖（可选，比价功能需要）
cd server && npm install && cd ..

# 4. 启动开发（仅前端）
npm run dev

# 5. 前后端同时启动（需要后端依赖已安装）
npm run dev:all
```

访问 http://localhost:5173 即可看到应用。

## 📁 项目结构

```
eato/
├── src/                          # 前端源码
│   ├── app/App.tsx               # 应用入口
│   ├── components/               # UI组件
│   │   ├── analytics/            # 数据分析（6个图表组件）
│   │   ├── auth/                 # 登录页
│   │   ├── calendar/             # 约饭日历（Header/Grid/Legend）
│   │   ├── deals/                # 比价面板（Idle/Loading/Card/Best）
│   │   ├── export/               # 导出CSV
│   │   ├── forms/                # 表单（加店/编辑/个人资料）
│   │   ├── invite/               # 好友邀请
│   │   ├── landing/              # 落地页（Hero/Features/CTA）
│   │   ├── settings/             # 设置页（数据管理/关于）
│   │   └── table/                # 打卡表（SearchAdd/Row/Field）
│   ├── constants/                # 常量配置
│   ├── data/                     # Mock数据
│   ├── hooks/                    # 自定义Hooks
│   ├── types/                    # TypeScript类型定义
│   └── utils/                    # 工具函数（format/helpers/id）
├── server/                       # 后端
│   └── src/
│       ├── config/               # 平台配置
│       ├── data/                 # Mock数据
│       ├── middleware/           # 中间件（logger/errorHandler）
│       ├── models/               # 数据模型
│       ├── routes/               # API路由（deals/restaurants/users/analytics/calendar）
│       └── services/             # 业务逻辑
└── public/brands/                # 品牌图片
```

## 🔌 API 端点

详见 [API_DOCS.md](./API_DOCS.md)。

| 端点 | 说明 |
|------|------|
| `GET /api/health` | 健康检查 |
| `GET /api/deals?place=&category=` | 比价查询 |
| `GET /api/deals/platforms` | 平台列表 |
| `GET/POST /api/restaurants` | 餐厅CRUD |
| `GET/POST /api/users` | 用户查询/创建 |
| `GET /api/analytics/overview` | 聚合统计 |
| `GET /api/calendar/slots` | 日历slot查询 |

## 📐 项目约定

- **主题色**: 橙色系（#BF4E2A）
- **包管理**: npm（不要切换为 pnpm）
- **分支**: 开发在 `feature/codex-work`，`main` 为稳定版
- **构建**: `npm run build` 包含 TypeScript 类型检查（tsc -b）
- **测试**: `npm test` 运行 vitest 单元测试

## 📄 开源协议

MIT
