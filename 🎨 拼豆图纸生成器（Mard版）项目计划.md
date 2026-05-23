# Dopamine Beads — 拼豆图纸生成器

> 基于 Mard 221 标准色号的拼豆图纸生成工具。上传图片 → 像素化 → 颜色匹配 → 生成图纸 + 材料清单。

---

## 一、功能概述

| 功能 | 说明 |
|---|---|
| 图片上传 | 支持 JPG / PNG / WebP，拖拽或点击 |
| 分辨率调节 | 预设 32 / 48 / 64 / 96 / 128，支持自定义 4~300 |
| 颜色匹配 | LAB 感知距离 / 加权 RGB / 欧几里得 RGB 三种算法 |
| 图纸生成 | 网格化拼豆图纸 PNG，可切换网格线 + 色号标签 |
| 材料清单 | 自动统计每种色号的用量，按数量降序排列 |
| 下载导出 | PNG 图纸下载 + CSV 材料清单导出 |

---

## 二、技术架构

```
用户浏览器 (React + Tailwind)
       │  POST /api/generate
       ▼
FastAPI 后端
  ├── image_service     图片解码 + Pillow 像素化 (NEAREST)
  ├── color_matcher     逐像素 RGB→LAB → CIE76 ΔE → 匹配最接近色号
  ├── grid_renderer     Pillow 绘制拼豆网格 PNG
  └── palette_service   预加载 221 色 LAB 值
```

### 颜色匹配算法

```
sRGB → 线性 RGB (gamma解码)
     → XYZ (D65参考白)
     → CIELAB (L*, a*, b*)
     → CIE76 ΔE = √(ΔL² + Δa² + Δb²)
     → 选最小 ΔE 的色号
```

### 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 19 + TypeScript + Vite + Tailwind CSS 3 |
| 后端 | FastAPI + Pillow + Pydantic |
| 颜色科学 | sRGB → XYZ(D65) → CIELAB + CIE76 ΔE |
| 数据 | Mard 221 色号表 (CSV → palette.json) |

---

## 三、项目结构

```
beads-generator/
├── README.md
│
├── data/                        # 色号数据
│   ├── Mard 221.csv             # 原始色号表 (221色)
│   └── palette.json             # 解析后 JSON（脚本生成）
│
├── scripts/
│   └── parse_palette.py         # CSV → palette.json 解析脚本
│
├── backend/                     # FastAPI 后端
│   ├── main.py                  # 入口：CORS、静态文件、路由注册
│   ├── config.py                # 路径、限制等配置
│   ├── requirements.txt         # Python 依赖
│   ├── routes/
│   │   └── generate.py          # POST /api/generate  GET /api/palette  GET /api/health
│   ├── services/
│   │   ├── palette_service.py   # 色库加载 + 启动时预计算 LAB
│   │   ├── image_service.py     # base64 解码 + 像素化
│   │   ├── color_matcher.py     # LAB/加权RGB/欧几里得 匹配引擎
│   │   └── grid_renderer.py     # 绘制拼豆图纸 PNG
│   ├── models/
│   │   └── schemas.py           # Pydantic 请求/响应模型
│   └── output/                  # 生成 PNG 存放目录
│
└── frontend/                    # React 前端
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js       # 多巴胺配色主题
    ├── index.html
    └── src/
        ├── main.tsx             # 入口
        ├── App.tsx              # 主组件：状态管理 + 布局编排
        ├── index.css            # Tailwind 指令 + 动画 + 滚动条
        ├── api/
        │   └── client.ts        # 后端 API 封装
        ├── types/
        │   └── index.ts         # TypeScript 类型定义
        ├── hooks/
        │   ├── useGeneration.ts # 生成管线状态机
        │   └── useToast.ts      # Toast 状态
        └── components/
            ├── Header.tsx           # Logo + 标语
            ├── UploadZone.tsx       # 拖拽上传区
            ├── ControlsBar.tsx      # 分辨率/算法/开关/按钮
            ├── PreviewPanels.tsx    # 预览面板容器
            ├── OriginalPreview.tsx  # 原图展示
            ├── PixelatedPreview.tsx # 像素化预览 (Canvas)
            ├── BeadGridPreview.tsx  # 拼豆图纸 (后端 PNG)
            ├── SummaryStats.tsx     # 总豆数/颜色数/尺寸
            ├── MaterialList.tsx     # 色号 + 颜色球 + 数量
            ├── DownloadButtons.tsx  # PNG/CSV 下载
            └── Toast.tsx            # 通知提示
```

---

## 四、API 接口

### POST /api/generate

```
请求: { image: "data:image/png;base64,...", size: 64, show_grid: true, show_labels: false }
响应: { grid: [["A1","B3"],...], materials: {"A1":120}, image_url: "/output/xxx.png",
        dimensions: [64,48], total_beads: 3072, unique_colors: 23 }
```

### GET /api/palette

返回完整 221 色库：`[{id, name, rgb, hex}, ...]`

### GET /api/health

健康检查：`{status: "ok", palette_colors: 221}`

---

## 五、快速启动

```bash
# 1. 数据处理（首次）
cd beads-generator
python scripts/parse_palette.py

# 2. 启动后端
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# 3. 启动前端
cd frontend
npm install
npm run dev
```

- 后端：http://localhost:8000 （API 文档：/docs）
- 前端：http://localhost:5173

---

## 六、UI 设计（多巴胺风格）

- 主色 `#FF4D6D` / 辅助 `#FFD93D` / 强调 `#00F5D4`
- 深色渐变背景 + 动态光晕 + 毛玻璃卡片
- 高饱和、年轻化、糖果色

---

## 七、关键设计决策

| 决策 | 理由 |
|---|---|
| 后端生成 PNG（非前端 Canvas） | Pillow 图片输出跨浏览器一致 |
| palette.json 预计算 LAB 并提交 | 免去运行时依赖 pandas，启动即用 |
| CIE76 而非 CIE94/CIEDE2000 | 221 种分明颜色，CIE76 足够且更快 |
| 前端上传前压缩至 800px | 减少 base64 JSON 体积 |
| 无数据库 | 纯无状态转换工具 |

---

## 八、更新日志

- 2026-05-23：完成项目搭建，前后端分离架构，集成真实 Mard 221 色号表
