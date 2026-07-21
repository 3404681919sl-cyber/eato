---
name: eato-ui-design
description: Eato 约饭打卡 App 的产品 UI 设计系统：品牌色、9 大分类配色 token、品牌头像规范、卡片/弹窗组件模式、图片加载兜底与字体层级。当需要新增 UI、统一视觉风格或修复“图标/头像区分不清、图片破图”类问题时参考。
agent_created: true
---

# Eato 产品 UI 设计系统

本 skill 沉淀 Eato 的视觉规范，确保跨页面一致、品牌可识别、弱网下不破图。

## 设计 Token（唯一事实来源见 references/design-tokens.md）

- **品牌主色**：`#BF4E2A`（赤陶橙，用于主按钮、强调、进度）。辅助暖色 `#E8963C`。
- **分类配色**：9 大类各有一组 `{ color 主色, light 浅底 }`（火锅红 / 中餐紫 / 面点绿 / 日韩棕 / 西餐金 / 烧烤橙 / 茶饮粉 / 海鲜蓝 / 其他灰）。所有分类标签、选中态、筛选 chip 统一用这组 token，禁止硬编码色值。
- **字体**：标题 `Playfair Display`（serif，质感）；正文 `DM Sans`；数字/代号 `DM Mono`。已在 Landing/App 统一使用。

## 品牌头像规范（关键区分度）

店铺头像必须能区分「知名品牌」与「普通分类」：
- **品牌命中**（见 `utils/avatar.ts` 的 `resolveBrand`/`resolvePlaceImage`）：渲染 **品牌主色圆角方块 + 白色首字 + 右上角 emoji**（如“野茶花”→绿底白“野”+🍵）。
- **未命中品牌**：用 **分类浅底 + 大 emoji**（如火锅→浅红底🍲）。

二者视觉差异明显，用户一眼能分辨“这是不是我认识的品牌”。

## 组件模式

- **卡片**：`rounded-2xl` + `border border-border` + `bg-card`，hover 轻微阴影/位移。
- **弹窗（MenuPicker）**：`fixed inset-0 z-[60]` 半透明遮罩 + 居中 `max-w-3xl max-h-[88vh]` 卡片，点击遮罩关闭（`onClick={onClose}` + 内容 `stopPropagation`）。
- **标签/徽章**：`rounded-full` + 小字号，分类用 `cat.light` 底 + `cat.color` 字。
- **主按钮**：`bg-primary text-primary-foreground`（primary 已映射品牌色），hover `opacity-90`。

## 图片加载兜底（强约束）

外链图片（POI 照片、AI 生成菜品图）**不稳定**，必须兜底：
- 菜品卡 `onError`：回退到「分类 emoji + 浅底」生成图（不是 `opacity:0` 隐藏，隐藏=空白）。
- 店铺头像 `onError`：回退到 `brandAvatar(cat.emoji, cat.light)` 分类图标。
- 原则：宁可显示“分类占位图”，也不留灰底/破图。

## 修复“图片破图/乱码”的检查清单

1. emoji 必须用真实字符（🍅），禁止 Python 风格 `\U0001F345` 转义文本。
2. 外链图一律配 `onError` 兜底。
3. AI 生成图（如 pollinations）仅作增强，不可作唯一图源；弱网/失败必须回退到本地生成图。

## 何时使用本 skill

- 新增任何 UI 元素前，先取 `references/design-tokens.md` 的 token，勿硬编码色值。
- 出现“头像区分不清 / 图片破图 / 字体不统一”时，逐项核对本规范。
