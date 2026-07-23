# Eato 🍜 — 和朋友一起的约饭打卡本

> **共享餐厅清单 · 智能约饭协调 · 消费数据分析 · 多平台比价**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

---

## 📸 预览

![落地页](docs/screenshots/home.png)
![打卡列表与数据看板](docs/screenshots/dashboard.png)
![约饭日历协调](docs/screenshots/calendar.png)
![多平台比价面板](docs/screenshots/deals.png)
![消费分析](docs/screenshots/analytics.png)

> 截图计划放置于 `docs/screenshots/`，图片待补充。

---

## ✨ 功能一览

| 模块 | 功能 | 状态 |
|------|------|------|
| 🏠 **落地页** | 品牌介绍、功能展示、快速开始 | ✅ |
| 📋 **打卡表** | 餐厅收藏、打卡记录、评分/心情/分类标签、星级评分 | ✅ |
| 📅 **约饭日历** | 多人空闲时间标记、重叠检测、时段筛选（午餐/下午茶/晚餐） | ✅ |
| 📊 **数据看板** | 消费趋势、品类偏好、心情分布、评分分布、约饭搭档排行 | ✅ |
| 💰 **智能比价** | 一键对比美团/抖音/大众点评/淘宝闪购/闲鱼优惠，含真实跳转 | ✅ |
| 👥 **多人协作** | 多用户空间（小美/阿帅/阿豪），空闲时间自动合并 | ✅ |
| 👫 **好友邀请** | 生成邀请码分享给好友 | ✅ |
| 📤 **数据导出** | CSV 导出，含中文 BOM，兼容 Excel/Numbers | ✅ |
| ⚙️ **数据管理** | 备份、重置、编辑餐厅信息 | ✅ |
| 🌐 **国际化** | 简体中文 / English 切换 | 📝 规划中 |

---

## 🏗️ 技术架构

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (Vite)                   │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │  React 18 │  │  React   │  │  Recharts 图表    │  │
│  │  + TypeS  │  │  Router  │  │  (7种可视化组件)  │  │
│  └──────────┘  └──────────┘  └───────────────────┘  │
│  ┌────────────────────────────────────────────────┐  │
│  │  Tailwind CSS 4 + shadcn/ui 设计系统           │  │
│  │  (类Radix Primitive + CSS变量主题)              │  │
│  └────────────────────────────────────────────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ date-fns │  │ lucide   │  │ canvas-confetti   │  │
│  │ 日期处理 │  │ 图标库   │  │ 交互动效          │  │
│  └──────────┘  └──────────┘  └───────────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP (axios/fetch)
┌──────────────────────▼──────────────────────────────┐
│               Backend (Express)                      │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ REST API │  │ 数据模型 │  │ 比价聚合服务      │  │
│  │ 7个端点   │  │ 3个模型  │  │ 5平台数据抓取    │  │
│  └──────────┘  └──────────┘  └───────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### 技术栈详细

| 层 | 技术 | 版本 | 用途 |
|----|------|------|------|
| **运行时** | Node.js | ≥ 18 | 开发与运行环境 |
| **语言** | TypeScript | 5.8 | 类型安全的前端代码 |
| **UI 框架** | React + TypeScript | 18.3 | 组件化 UI 构建 |
| **路由** | React Router | 7.13 | 声明式页面路由 |
| **构建** | Vite | 6.3 | 极速 HMR 开发体验 |
| **样式** | Tailwind CSS 4 + shadcn/ui | 4.1 | Utility-first + 设计系统 |
| **图表** | Recharts | 2.15 | 7 种数据可视化组件 |
| **后端** | Express (JavaScript) | 4.x | RESTful API 服务 |
| **测试** | Vitest | 3.1 | 单元测试与组件测试 |
| **日期** | date-fns | 3.6 | 轻量日期工具函数 |
| **动效** | canvas-confetti | 1.9 | 打卡成功撒花🎉 |

---

## 🚀 快速开始

### 前置条件

- Node.js ≥ 18（推荐 20 LTS）
- npm ≥ 9

### 安装

```bash
# 克隆仓库
git clone https://github.com/3404681919sl-cyber/eato.git
cd eato

# 安装前端依赖
npm install

# （可选）安装后端依赖——比价功能需要启动 server
cd server && npm install && cd ..
```

### 运行

```bash
# 模式一：仅前端开发（Mock 数据模式）
npm run dev
# → 浏览器打开 http://localhost:5173

# 模式二：前后端全量模式
npm run dev:all
# → 前端 http://localhost:5173 + 后端 http://localhost:3001
```

### 构建

```bash
npm run build        # TypeScript 类型检查 + Vite 生产构建
npm run preview      # 预览构建产物
```

### 测试

```bash
npm test             # 运行 vitest 单元测试
npm run test:watch   # Watch 模式（开发时持续运行）
```

---

## 🚀 部署

### 前端：GitHub Pages

仓库名 `eato`，访问地址 <https://3404681919sl-cyber.github.io/eato/>。

1. 推送 `main` 分支即触发 `.github/workflows/deploy.yml` 自动构建并发布。
2. 仓库 **Settings → Pages → Source** 选择 **GitHub Actions**。
3. Vite 已配置 `base: '/eato/'`，工作流在构建后复制 `dist/index.html` → `dist/404.html` 以支持 SPA 刷新（避免 404）。

> 本地预览生产包：`npm run build && npm run preview`（预览服务器带 `/eato/` 基路径）。

### 生产环境：EdgeOne Pages（国内可达主站）

主生产站点部署在腾讯云 EdgeOne Pages，国内直连可达，不依赖 GitHub Pages：

- **访问地址**：<https://eato-deploy-dpox63ngkbdg.edgeone.cool/>
- 构建产物由 `DEPLOY_BASE=/ npm run build` 生成（根路径，适配 EdgeOne 根目录托管）。
- 部署方式：将 `dist/` 目录（或 `D:/eato-deploy.zip`）上传至 EdgeOne Pages 控制台，平台自动发布。
- 可选绑定自定义域名（需自行注册域名后，在 EdgeOne 控制台添加 CNAME 解析）。

> GitHub Pages 地址 <https://3404681919sl-cyber.github.io/eato/> 作为备用镜像保留。

### 后端：Render（可选，仅 Mock 比价）

比价服务可一键部署到 Render：

1. 在 Render 新建 **Web Service**，连接本仓库，选择 **Docker** 运行时。
2. 构建读取仓库 `server/` 下的 `Dockerfile` 与 `render.yaml`（`healthCheckPath: /api/health`）。
3. 环境变量：如需高德 POI 搜索可填 `AMAP_KEY`（不填则前端直连高德，不影响比价）。
4. 健康检查：`GET /api/health` 返回 `{ "status": "ok" }`。
5. 部署后在前端设置环境变量 `VITE_API_BASE` 指向你的 Render 地址，比价即走后端；
   **后端不可用时前端自动回退本地 Mock，绝不白屏。**

### ⚠️ 比价数据免责声明

> **比价为演示数据，仅供参考。** 当前比价结果由确定性种子算法在本地 / Mock 后端生成，并非真实平台实时报价，亦不构成任何消费建议。真实价格请以各平台官方页面为准。

---

## 📁 项目结构

```
eato/
├── src/                              # 前端源码
│   ├── main.tsx                      # 应用入口
│   ├── app/
│   │   └── App.tsx                   # 根组件 + 路由配置
│   ├── components/                   # UI 组件
│   │   ├── analytics/                # 数据看板（7个图表组件）
│   │   ├── auth/                     # 登录/注册
│   │   ├── calendar/                 # 约饭日历（Header/Grid/Legend）
│   │   ├── deals/                    # 比价面板（Idle/Loading/Card/Best）
│   │   ├── export/                   # CSV 导出
│   │   ├── forms/                    # 表单（新增/编辑/个人资料）
│   │   ├── invite/                   # 好友邀请
│   │   ├── landing/                  # 落地页（Hero + 特性 + CTA）
│   │   ├── settings/                 # 设置（数据管理/关于）
│   │   └── table/                    # 打卡表（SearchAdd/Row/Field）
│   ├── constants/                    # 常量与配置
│   ├── data/                         # 数据层（catalog + 种子数据）
│   ├── hooks/                        # 自定义 Hooks
│   ├── types/                        # TypeScript 类型定义
│   ├── styles/                       # 样式文件
│   │   ├── globals.css               # 全局样式
│   │   ├── theme.css                 # 主题变量
│   │   ├── tailwind.css              # Tailwind 入口
│   │   └── fonts.css                 # 字体加载
│   └── utils/                        # 工具函数
├── server/                           # 后端部分
│   └── src/
│       ├── config/                   # 平台配置
│       ├── middleware/               # Express 中间件
│       ├── models/                   # 数据模型（restaurant/user/visit）
│       ├── routes/                   # API 路由（7个端点）
│       └── services/                 # 业务逻辑
├── public/
│   └── brands/                       # 品牌图片资源
├── docs/                             # 文档（建议新增截图目录）
├── API_DOCS.md                       # API 接口文档
└── package.json                      # 依赖管理
```

---

## 🔌 API 端点一览

详见 [API_DOCS.md](./API_DOCS.md)。

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/health` | GET | 健康检查 |
| `/api/deals?place=&category=` | GET | 多平台比价查询 |
| `/api/deals/platforms` | GET | 支持的比价平台列表 |
| `/api/restaurants` | GET/POST | 餐厅 CRUD |
| `/api/users` | GET/POST | 用户查询与创建 |
| `/api/analytics/overview` | GET | 聚合统计分析 |
| `/api/calendar/slots` | GET | 日历空闲 slots |

---

## 📐 项目约定 & 开发规范

### 代码风格

- **TypeScript strict mode** 启用，类型定义集中在 `src/types/`
- 组件采用 **function component** + hooks，不使用 class component
- 样式统一使用 **Tailwind CSS utility classes**，避免内联 style
- 设计系统基于 **shadcn/ui**，主题变量定义在 `theme.css`

### Git 规范

```text
分支策略：main（稳定版） ← feature/codex-work（开发中）
提交格式：<type>: <简短描述>
示例：    feat: 新增多平台比价面板
          fix: 修复日历重叠计算偏差
          refactor: 抽取 DataProvider 层
          docs: 补充 API 文档
```

### 质量门禁

```bash
# 提交前运行
npm run build       # 类型检查 + 构建（必须通过）
npm test            # 单元测试（必须通过）
```

### 其他约定

| 项 | 约定 |
|----|------|
| 包管理 | npm（不要切换 pnpm） |
| 主题色 | 橙色系 `#BF4E2A` |
| Node 版本 | ≥ 18 |
| 端口分配 | 前端 5173 · 后端 3001 |

---

## 🧪 测试覆盖

| 范围 | 工具 | 状态 |
|------|------|------|
| 工具函数 | Vitest | ✅ 基础覆盖（format/id/helpers） |
| 持久化 Hook | Vitest | ✅ 基础覆盖 |
| 组件测试 | Vitest + React Testing Library | 🚧 开发中 |
| E2E 测试 | — | 📝 规划中 |

---

## 🗺️ 路线图

- [x] 餐厅打卡 CRUD
- [x] 数据可视化看板
- [x] 多平台比价
- [ ] 国际化（中/英） 📝 规划中
- [x] 好友邀请系统
- [ ] **后端接入真实数据库**（当前为 Mock）
- [ ] **用户认证系统**（JWT / OAuth）
- [ ] **移动端适配优化**
- [ ] **推送通知**（约饭提醒）
- [ ] **E2E 测试**（Playwright）

---

## 📄 开源协议

MIT © 2025 邱梓真

---

<p align="center">
  <b>和朋友一起，好好吃饭 🍜</b>
</p>
