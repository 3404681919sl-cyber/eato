---
name: eato-architecture
description: Eato 约饭打卡 App（React+TS+Vite）的整体程序架构规范与模块边界约定。当需要在 Eato 新增功能、拆分模块、做代码评审或排查“改一处崩全局”类问题时，参考本 skill，避免重蹈“单文件巨石组件 + 仓库内双架构并行”的坑。
agent_created: true
---

# Eato 整体程序设计（架构规范）

本 skill 沉淀 Eato 项目的程序架构基线。它是从一次真实事故中总结出来的：早期 `src/app/App.tsx` 是 1849 行的巨石组件，且仓库内同时存在两套并行架构（旧骨架 `components/ services/ data/...` 用旧分类体系，运行中巨石用新 9 分类），两套 `Category` 类型冲突、旧骨架已成伤残死代码却仍被 `tsc -b` 编译，导致任何类型改动都会炸掉构建。

## 目标模块结构（单一事实来源）

```
src/
├── types/index.ts        # 唯一类型源头（新 9 分类体系，含 AppState/Tab/Category/Mood/Place/Dish/Deal…）
├── data/catalog.ts       # 纯数据：CAT/MOOD/PLATFORMS 配置、DISH_DB(96菜)、BRAND_DB(28品牌)、generateDeals、SEED、buildSeedCalendar、USERS、PIE_COLORS、DAYS、HOURS
├── utils/
│   ├── avatar.ts         # brandAvatar / resolveBrand / resolvePlaceImage（品牌感知头像，纯函数）
│   └── poi.ts            # gaodeJSONP（高德 REST API 的 JSONP 封装，绕过浏览器 CORS）
├── components/
│   └── MenuPicker.tsx    # 菜品选择器弹窗（积木块式卡片）
├── app/App.tsx           # 编排层：仅做状态管理与组件组合，不含业务数据/纯函数
├── styles/               # 全局样式（被 main.tsx 引用，live）
└── legacy/               # 旧骨架归档，已排除出 tsconfig 编译，勿在此修改
```

数据 / 逻辑 / UI 三层职责严格分离：
- **types**：只声明类型，不写逻辑。新增模型先改这里，全仓唯一来源。
- **data**：只放常量与纯数据，不依赖 React。
- **utils**：纯函数（无 JSX、无 hook），可单测。
- **components**：带 JSX 的展示/交互组件，通过 props 通信。
- **app/App.tsx**：用 `useState/useMemo` 编排上述模块，渲染页面。

## 强制约定（团队基线）

1. **提交纪律（最高优先级）**：任何超过 50 行的改动，完成一个独立功能点就 `git commit`。绝不允许带着未提交的核心代码离开工作台（曾因 `git checkout --` 丢失整层菜品工作）。
2. **破坏性 git 命令禁令**：`git checkout -- <file>`、`git reset --hard`、`git clean -f` 执行前必须先 `git stash` 或 `git commit` 保护现场。
3. **外部资源兜底**：所有 `<img>` 必须有 `onError` 回退到本地/生成图，禁止裸外链（菜品图曾因 AI 生图服务不稳定整片灰底）。
4. **单文件不超过 800 行**：超出必须按“data / utils / components / app 编排”拆分。
5. **构建门禁**：每次改动后必须 `npm run build`（即 `tsc -b && vite build`）通过再部署。
6. **Code Review**：合并到 main 前至少 1 人 review；AI 协作者（如 Codex）只在 `feature/codex-work` 分支产出，由人审核后合并。

## 高德 POI 的 CORS 约束（重要）

浏览器端 `fetch()` 调高德 REST API（`restapi.amap.com`）会被 CORS 拦截。标准解法是用 **JSONP**（`utils/poi.ts` 的 `gaodeJSONP`）：动态注入 `<script>` 并带 `callback` 参数。搜索框 `onFocus` 时触发 `navigator.geolocation` 获取定位，作为 `location` 参数传入做就近排序。

## 何时使用本 skill

- 新增页面 / 功能前，先确认数据放 `data/`、纯函数放 `utils/`、UI 放 `components/`。
- 代码评审时，逐项核对上方 6 条约定。
- 排查“类型一改全崩”时，先想是否在制造第二套类型源头（参见 `legacy/` 教训）。
