# Eato 项目长期记忆

## 原版 UI（关键，反复踩坑）
- **用户真正要的"原版" = git 提交 `105cdeb`**（"用 Figma Make 生成的完整版替换手写 eato"）。
- 该版本是**单文件自包含**的 `src/app/App.tsx`（1365 行，只依赖 react/lucide-react/recharts，无任何本地 import），内含 LandingPage / AuthPage / TableView / CalendarView / AnalyticsView / DealsPanel 全部页面。
- **正确还原方式**：`git show 105cdeb:src/app/App.tsx > src/app/App.tsx`，再 `npm run build`。不要用"按组件逐段重写"——会丢失细节且对不上。
- `ui-baseline` 标签已指向正确的整文件还原（commit `12b0ffd`，2026-07-18 18:50）。误改可 `git checkout ui-baseline -- src/app/App.tsx` 回滚。
- 早期 `0f4a1cf`/`04253d0` 两次"restore"是**按组件重写**的杂交版，并不等于原版，已被本次整文件还原纠正。

## 图片丢失根因
- 原版 `105cdeb` 大量使用 **Unsplash 外链图片**：
  - 登录/注册页(AuthPage) **左侧视觉大图**：`photo-1466978913421...?w=900&h=1200`
  - 表格行左侧头像：`place.image`（120×120，5 家餐厅各一张）
  - 首页/展示图（400×500）
- **Codex 提交 `7d08075`（"task1: 拆分数据层 + 清理Unsplash"）把这些 Unsplash URL 和 `image` 字段全删了** → 用户说的"预览页左边没图片""桌子左边没头像"就是这个。
- 还原后图片由用户浏览器直接拉 Unsplash，静态部署无需后端即可显示。

## 当前部署
- CloudStudio 静态站点：`https://93f7ca0f51f24e958ca6db9204ef43a6.app.codebuddy.work`（无后端；POI/高德需本地后端，静态版用 Unsplash 占位）。
- 本地跑：`npm run dev`（Vite），不是 dev:all（后端会 EADDRINUSE）。

## 孤儿文件（无害，但注意）
- 整文件还原后，`src/components/landing/LandingPage.tsx`、`auth/AuthPage.tsx`、`table/TableView.tsx`、`calendar/CalendarView.tsx`、`analytics/AnalyticsView.tsx`、`deals/DealsPanel.tsx` 等模块化文件**不再被 App.tsx 引用**，属死代码。可留作参考，勿误以为"当前在用"。

## 用户 UI 铁律（跨项目，见 ~/.workbuddy/MEMORY.md）
- 未经用户明确要求，**不得改动任何页面 UI 设计**；任何 UI 改动前先确认。
- 模型看不到用户贴的截图，靠 git 历史还原 UI 时必须精确核对版本，不要靠猜。
