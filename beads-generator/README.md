# Dopamine Beads — 拼豆图纸生成器

基于 **Mard 221 标准色号** 的拼豆图纸生成工具。上传图片，自动匹配最接近的 Mard 拼豆颜色，生成可打印的拼豆图纸和材料清单。

## 项目结构

```
beads-generator/
├── data/
│   ├── Mard 221.csv          # 原始色号数据（221色）
│   └── palette.json           # 解析后的色库（由脚本生成）
├── scripts/
│   └── parse_palette.py       # CSV → JSON 数据解析脚本
├── backend/
│   ├── main.py                # FastAPI 入口
│   ├── config.py              # 配置文件
│   ├── requirements.txt       # Python 依赖
│   ├── routes/
│   │   └── generate.py        # API 路由
│   ├── services/
│   │   ├── palette_service.py # 色库加载 + LAB 预计算
│   │   ├── image_service.py   # 图片解码 + 像素化
│   │   ├── color_matcher.py   # LAB 颜色匹配引擎
│   │   └── grid_renderer.py   # 拼豆图纸 PNG 渲染
│   ├── models/
│   │   └── schemas.py         # Pydantic 模型
│   └── output/                # 生成的 PNG 图纸
├── frontend/
│   ├── src/                   # React + TypeScript 源码
│   ├── tailwind.config.js     # Tailwind 配置（多巴胺主题）
│   └── package.json
└── README.md
```

## 快速开始

### 1. 环境要求

- Python 3.10+
- Node.js 18+

### 2. 数据处理（首次运行）

```bash
cd beads-generator
python scripts/parse_palette.py
```

### 3. 启动后端

```bash
cd beads-generator/backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

后端运行在 http://localhost:8000

API 文档：http://localhost:8000/docs

### 4. 启动前端

```bash
cd beads-generator/frontend
npm install
npm run dev
```

前端运行在 http://localhost:5173

## API 接口

### POST /api/generate

生成拼豆图纸。

**请求：**
```json
{
  "image": "data:image/png;base64,...",
  "size": 64,
  "show_grid": true,
  "show_labels": false
}
```

**响应：**
```json
{
  "grid": [["A1","B3","C5"],["A1","B3","C5"]],
  "materials": {"A1": 2, "B3": 2, "C5": 2},
  "image_url": "/output/bead_abc123.png",
  "dimensions": [3, 2],
  "total_beads": 6,
  "unique_colors": 3
}
```

### GET /api/palette

返回完整 221 色 Mard 色库。

### GET /api/health

健康检查。

## 功能特性

- **图片上传**：支持 JPG / PNG / WebP，拖拽或点击上传
- **分辨率调节**：预设 32/48/64/96/128，支持自定义 4~300
- **颜色匹配**：LAB 感知距离（默认）/ 加权 RGB / 欧几里得 RGB 三种算法
- **拼豆图纸**：网格化显示，可选网格线和色号标签
- **材料清单**：按用量降序排列，显示色号、名称、颜色预览和数量
- **下载导出**：PNG 图纸下载 + CSV 材料清单导出

## 技术栈

| 层级 | 技术 |
|---|---|
| 前端 | React 19 + TypeScript + Vite + Tailwind CSS 3 |
| 后端 | FastAPI + Pillow + Pydantic |
| 颜色科学 | sRGB → XYZ(D65) → CIELAB + CIE76 ΔE |

## 快捷键

| 快捷键 | 功能 |
|---|---|
| Ctrl+S | 下载图纸 PNG |
