# Perler-Beans · 拼豆图纸生成器

上传任意图片，自动生成拼豆（Perler Beads）图纸。基于 **Mard 221 标准色库**，支持多种颜色匹配算法，精准还原图像颜色。

## 功能

- **图片上传** — 支持拖拽或点击上传 JPG / PNG / WebP
- **像素化预览** — 实时预览像素化效果
- **拼豆图纸生成** — 将每个像素映射到最接近的 Mard 标准色号
- **网格线 / 色号标注** — 可切换显示，方便对照制作
- **材料清单** — 自动统计每种颜色的拼豆数量
- **图纸下载** — 导出 PNG 图纸
- **材料清单导出** — 导出 CSV，用 Excel 打开即可
- **可调参数** — 分辨率（32×32 ~ 256×256）、颜色匹配算法

## 快速开始

```bash
git clone https://github.com/by652851913/Perler-Beans.git
```

然后双击 `index.html`，用浏览器打开即可使用。**无需安装任何依赖**。

> 如果是 React + TypeScript 开发版，进入 `beads-generator/frontend/` 执行：
>
> ```bash
> npm install
> npm run dev
> ```

## 使用方法

1. 打开 `index.html`
2. 拖拽或点击上传一张图片
3. 调整分辨率（默认 64×64）
4. 勾选"显示色号"可在图纸上标注色号
5. 点击"下载图纸"保存 PNG
6. 点击"导出材料清单"保存 CSV（可用 Excel 打开）

## 颜色匹配算法

| 算法 | 说明 |
|------|------|
| **LAB 感知（推荐）** | 基于 CIELAB 色彩空间的 ΔE 色差公式，最接近人眼感知 |
| **加权 RGB** | 对红色分量加权，模拟人眼对红色的敏感度 |
| **欧几里得 RGB** | 标准 RGB 空间欧几里得距离 |

## 色库

内置 **Mard 221 标准色**（221 色），覆盖：

- 白/黑/灰色系（C01–C12）
- 红色系（C13–C28）
- 橙色系（C29–C42）
- 黄色系（C43–C56）
- 绿色系（C57–C78）
- 蓝绿色系（C79–C90）
- 蓝色系（C91–C112）
- 紫色系（C113–C132）
- 粉色系（C133–C146）
- 棕色系（C147–C168）
- 特殊色 / 珠光 / 荧光 / 透明系（C169–C195）
- 补充色（C196–C221）

## 项目结构

```
Perler-Beans/
├── index.html          ← 🎯 主页面（纯前端，双击即用）
├── CLAUDE.md           ← 开发文档
├── Mard 221.csv        ← 色库数据
├── beads-generator/    ← React + TypeScript + Python 重构版
│   ├── frontend/       ← React 前端（Vite + Tailwind）
│   ├── backend/        ← Python FastAPI 后端
│   ├── data/           ← 色库 JSON/CSV
│   └── scripts/        ← 辅助脚本
└── package.json        ← 仅用于 xlsx 依赖（解析 CSV）
```

## 技术栈

**`index.html`（即用版）**
- 纯 HTML + CSS + JavaScript，零依赖
- Canvas API 图像处理
- CIE76 ΔE 色差计算

**`beads-generator/`（开发版）**
- 前端：React 19 + TypeScript + Vite + Tailwind CSS
- 后端：Python FastAPI + Pillow
- 颜色匹配：CIELAB 色彩空间

## 许可证

MIT License
