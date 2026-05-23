# Dopamine Beads 拼豆图纸生成器

纯前端 HTML 页面，将图片转换为拼豆图纸，支持 Mard 221 标准色号。

## 启动方式

右键 `index.html` → Open with Live Server，或直接双击用浏览器打开。

## 技术栈

- 纯 HTML/CSS/JS，无框架
- 色库：MARD 221 标准色（221 色）
- 颜色匹配算法：CIELAB ΔE / 加权 RGB / 欧几里得 RGB
- Canvas API 做像素化和渲染

## 已知问题 & 解决记录

### JS 完全不执行（上传无反应）

**现象**：页面能打开，但上传区没反应，Toast 不出现，控制台无日志。

**根因**：色库数组 `MARD_PALETTE` 中有两个条目 `rgb:` 误写为 `rgb"`，导致 JS 语法错误，浏览器跳过整个 `<script>` 块。

**具体位置**（已修复）：
- C63 荧光绿：`rgb":[60,240,60]` → `rgb:[60,240,60]`
- C72 松石绿：`rgb":[35,185,155]` → `rgb:[35,185,155]`

**排查方法**：
1. 先在脚本末尾加可视化 DOM 改动（改文字/颜色），确认 JS 是否执行
2. 提取 JS 做语法检查：
   ```bash
   sed -n '/<script>/,/<\/script>/p' index.html | sed '1d;$d' > check.js
   node -c check.js
   ```

### Windows 文件类型检测

`loadImage()` 只检查 `file.type`（MIME），Windows 上部分文件 `file.type` 为空。已加文件扩展名回退校验。

## 文件结构

- `index.html` — 主页面，包含全部 HTML/CSS/JS
- `beads-generator/` — React + TypeScript 重构版（开发中）
