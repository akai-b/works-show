# 个人作品展示页（GitHub Pages）

一个纯静态的 H5 作品展示页面，适合直接部署到 GitHub Pages。

## 文件结构

```text
.
├─ index.html
├─ style.css
├─ script.js
└─ *.webp（你的作品动图）
```

## 本地预览

直接双击 `index.html` 即可打开。

如果你想用本地服务预览（更接近线上环境），可用：

```bash
npx serve .
```

## 部署到 GitHub Pages

### 1) 推送到 GitHub 仓库

在当前目录执行：

```bash
git init
git add .
git commit -m "feat: init portfolio page"
git branch -M main
git remote add origin 你的仓库地址.git
git push -u origin main
```

### 2) 开启 Pages

进入仓库页面：

`Settings` → `Pages` → `Build and deployment`

- Source 选择：`Deploy from a branch`
- Branch 选择：`main`
- Folder 选择：`/ (root)`
- 点击 `Save`

### 3) 访问地址

通常 1~3 分钟后生效，访问：

```text
https://你的用户名.github.io/你的仓库名/
```

## 后续维护

- 新增作品：在 `index.html` 里复制一个 `.work-card` 块，替换 `src` 与标题
- 调整风格：改 `style.css` 顶部 `:root` 颜色变量
- 动效节奏：改 `script.js` 里的 `0.06s`（入场错峰）和旋转角度系数
