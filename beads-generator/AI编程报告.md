# AI 编程报告 — 拼豆（Perler Beads）网页生产工具

## 一、使用的 AI 工具

| 工具 | 用途 |
|---|---|
| **Claude Code (Claude Agent SDK)** | 主要开发工具：架构设计、代码编写、调试、文件操作 |
| Claude Code 内置 Plan Agent | 首次项目架构设计 |
| Claude Code 内置 Explore Agent | 代码库探索（解析 CSV 编码、验证数据） |
| DeepSeek-V4-pro | Claude Code 底层大模型 |

---

## 二、工作流复盘：如何与 AI 协作

### 总体策略

整个项目采用 **「人类决策 + AI 执行」** 的协作模式。我负责确认需求、审查代码质量、做架构决策，AI 负责具体的代码实现和文件操作。

### 协作过程分 5 个阶段

**阶段 0：需求理解**

用户提供了项目计划 Markdown 和真实的 Mard 221 色号表（CSV 格式）。AI 首先解析了 CSV 文件，发现了编码问题（终端显示乱码但实际是正确 UTF-8），确认了 221 条颜色数据的结构。这一步非常关键——如果跳过数据验证直接写代码，色库可能完全不可用。

**阶段 1：第一版原型（翻车）**

AI 最初写了一个单一 `index.html` 文件，内置了虚构的色号（C01-C221），虽然功能跑通了，但用户明确指出两个问题：
- 有色号表（真实的 Mard 数据），不是虚构的
- 这应该是完整的多文件项目，不该只有一个 HTML

**反思**：这是典型的「AI 过度简化需求」。AI 看到"网页工具"就默认做了个单文件，忽略了项目计划中明确的 React + FastAPI 架构要求，也忽略了用户明明附件里有真实色号表的事实。

**阶段 2：规划（Plan Mode）**

切换到 Plan 模式后，AI（Plan Agent）设计了完整的前后端分离架构，包括：
- 项目目录结构（data/scripts/backend/frontend）
- API 设计（POST /api/generate）
- 数据流（CSV → palette.json → LAB 匹配 → PNG 渲染）
- 组件树（11 个 React 组件）
- 关键设计决策（为什么后端生成 PNG 而非前端 Canvas）

这个过程让我确认了架构方向，避免了再次翻车。

**阶段 3：逐层实现**

实际编码分 3 层进行：
1. **数据层**：`parse_palette.py` 解析 CSV → `palette.json`
2. **后端层**：FastAPI + Pillow，重点是 `color_matcher.py`（LAB 颜色匹配引擎）
3. **前端层**：React + Vite + Tailwind，重点是 `useGeneration` 状态机和 11 个组件

每完成一层，AI 都做了验证（Python import 测试、TypeScript 编译检查、Vite build）。

**阶段 4：Bug 修复 + UX 增强**

对照考试要求逐项检查后，发现了算法选择器 Bug（前端有 UI 但后端硬编码 `method="lab"`），以及多个可增强的用户体验点（PDF 导出、实时预览、圆形拼豆、示例图片、图例）。

每项增强都遵循了相同的「改 5 个文件」模式（schema → route → type → client → hook → component），确保数据从前端到后端整条链路一致。

### 关键协作原则

1. **不要信任 AI 的第一次输出** — 原型翻车证明了这一点
2. **每次改动后立即验证** — TS 编译 + Python import + curl 测试
3. **保持数据流完整** — 添加参数时同时改动前后端所有相关文件
4. **用户反馈优先** — 用户说"要完整项目"就立即切换到多文件架构

---

## 三、难点分析

### 难点 1：算法选择器完全无效（数据流断裂 Bug）

**问题描述**：

前端 ControlsBar 有一个"匹配算法"下拉框，可以选择 LAB/加权RGB/欧几里得，但选择后没有任何效果——后端始终使用 LAB 算法。这是一个典型的「前端 UI 和后端逻辑脱节」的 Bug。

**根因分析**：

回头看代码，发现数据流有 3 处断裂：
1. `useGeneration` hook 有 `method` 状态，但 `generatePattern()` 函数签名里没有 `method` 参数
2. `api/client.ts` 的 JSON body 里没有 `method` 字段
3. 后端 `routes/generate.py` 硬编码了 `method="lab"`，且 `GenerateRequest` schema 里没有 `method` 字段

AI 写前端 UI 时加了选择器，但写后端 API 时独立行事，两边没对齐。

**修复方法**：

我让 AI 追踪完整的数据流路径，要求「同时修改所有相关文件」：

```
前端: types/index.ts → api/client.ts → hooks/useGeneration.ts → ControlsBar.tsx → App.tsx
后端: models/schemas.py → routes/generate.py
```

共修改了 7 处代码，确保 `method` 参数从用户点击一路传到后端的 `color_matcher.match_pixels(method=method)`。

**启示**：AI 在需要跨多层修改时容易遗漏。正确的做法是先列出所有需要改的文件，然后逐个修改并验证。

---

### 难点 2：CSV 文件编码问题（数据不可读）

**问题描述**：

`Mard 221.csv` 在终端显示为乱码（如 `A1,ǳ�׻�`），无法确认中文颜色名称是否正确。

**排查过程**：

AI 首先尝试了 GBK 解码（常见的 Windows 中文编码），结果更乱。然后改用 `TextDecoder` 尝试了 utf8/gbk/gb2312/latin1 四种编码，发现：
- UTF-8 解码后 `hasChinese=true`（说明解析正确）
- 终端显示乱码是因为终端不支持中文渲染

验证方式：读取文件原始字节，确认 `e6b585e7b1b3e9bb84` = "浅米黄"（UTF-8 标准编码）。

**修复方法**：

在 `parse_palette.py` 中使用 `encoding="utf-8-sig"`（处理 BOM 头），并用 `json.dump(ensure_ascii=False)` 保存，确保 `palette.json` 中中文直接可读。

**启示**：数据文件的编码问题不能只看终端输出。要检查原始字节、尝试多种编码、并最终用正确的编码解析。

---

## 四、成功 Prompt 示例

### 示例 1：架构规划

```
Prompt: "I need to design a complete full-stack project for a 'Perler Beads Pattern Generator'.
Existing assets: Mard 221.csv (real color chart with 221 colors)..."
```

**效果**：Plan Agent 产出了完整的架构设计，包括目录结构、数据流、API 设计、组件树、设计决策表。这成为后续实现的蓝图。

### 示例 2：Bug 修复

```
观察: "The method selector in the frontend has no effect — the backend hardcodes method='lab'."

AI 追踪数据流后发现 7 处需要修改，一次性给出了所有改动。
```

### 示例 3：UX 增强迭代

```
观察: "对比考试要求，缺少 PDF 导出、实时预览、示例图片、图例。"

AI 逐项分析并实现，每项都保持「前后端数据流一致」。
```

---

## 五、AI 翻车点与纠正

| 翻车点 | AI 做了什么 | 如何纠正 |
|---|---|---|
| 单文件原型 | 忽略项目计划中的多文件架构，写了一个 index.html | 用户指出后，切换到 Plan Mode 重新设计架构 |
| 虚构色号 | 内置了 C01-C221 假数据，忽略真实 CSV | 用户指出有色号表后，解析真实 CSV 并生成 palette.json |
| 算法选择器无效 | 前端写了 UI 但没接通后端 | 追踪整条数据流，同时修改 7 处代码 |
| 初次生成单一文件无后端 | AI 默认"网页工具=单文件" | 明确要求「完整的多文件项目，前后端分离」 |
| CSV 编码误判 | 终端乱码后 AI 怀疑是 GBK | 检查原始字节后确认是 UTF-8，只是终端不支持中文显示 |

---

## 六、总结

本次开发中 AI 工具承担了约 85% 的代码编写工作，但关键决策（架构方向、需求取舍、质量把关）均由人类完成。最有效的协作方式是：

1. **Plan → Implement → Verify 循环**：先规划，再编码，立即验证
2. **数据流追踪**：添加功能时，从前端 UI 一路追踪到后端数据库/文件
3. **小步迭代**：每次改动 3-7 个文件，编译/测试通过后再继续
4. **人类把关**：AI 擅长写代码，但不擅长判断「用户真正需要什么」
