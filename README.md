# Eato - Dining & Travel Planner App 🍽️

一款智能美食旅行规划应用，帮助你和朋友一起记录餐厅打卡、安排约饭时间、分析消费习惯，还能一键比对各平台优惠！

## ✨ 功能特性

| 功能 | 说明 |
|------|------|
| 🏠 **打卡表** | 收藏想去的餐厅，记录每次打卡评价和花费 |
| 📅 **约饭日历** | 和朋友标记空闲时间，轻松安排聚餐 |
| 📊 **数据分析** | 可视化消费趋势、品类偏好、约饭搭档统计 |
| 💰 **智能比价** | 一键对比美团、抖音、大众点评等平台优惠 |
| 👥 **多人协作** | 多用户空闲时间合并，自动计算最佳约饭时段 |

## 🚀 快速开始

### 环境要求
- Node.js >= 18
- pnpm（推荐）或 npm

### 安装依赖
\\\ash
# 前端
pnpm install

# 后端（可选，仅比价功能需要）
cd server && npm install && cd ..
\\\

### 启动开发服务器
\\\ash
# 同时启动前端 + 后端
pnpm dev:all

# 或分别启动
pnpm dev          # 前端 (http://localhost:5173)
cd server && npm run dev   # 后端API (http://localhost:3001)
\\\

### 构建
\\\ash
pnpm build
\\\

## 📁 项目结构

\\\
src/
├── app/App.tsx              # 主应用壳（精简后 ~80行）
├── components/
│   ├── landing/LandingPage.tsx   # 首页
│   ├── auth/AuthPage.tsx         # 登录/注册
│   ├── table/TableView.tsx       # 打卡表
│   ├── calendar/CalendarView.tsx # 约饭日历
│   ├── analytics/AnalyticsView.tsx # 数据分析
│   └── deals/DealsPanel.tsx      # 比价面板
├── types/index.ts           # TypeScript 类型定义
├── constants/index.ts       # 配置常量
├── data/index.ts            # 种子数据 + 比价逻辑
├── hooks/usePersistState.ts # 数据持久化 Hook
└── utils/index.ts           # 通用 UI 组件 (StarRow, MoodPicker...)

server/
└── src/index.js             # 后端 API 服务（比价/优惠查询）
\\\

## 🔌 API 对接说明

比价功能目前使用智能模拟数据 + 真实深链跳转。要接入真实电商平台价格，需要：

1. **淘宝联盟** (https://pub.alimama.com/) — 获取商品搜索 API
2. **京东联盟** (https://union.jd.com/) — 获取商品价格 API

在 \server/src/index.js\ 中搜索 \TODO: Real API\ 查看集成指南。

## 🎨 设计

本项目基于 Figma 设计稿构建，使用 Tailwind CSS 4 实现视觉效果。
Figma 设计源文件：https://www.figma.com/design/GimyFO0CYDp3uFLcQ9xdUx/Dining-and-Travel-Planner-App
