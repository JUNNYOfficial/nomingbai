# 部署指南

## 方案一：GitHub Pages + 免费后端（推荐）

### 1. 部署前端到 GitHub Pages

1. 打开 GitHub 仓库 → **Settings** → **Pages**
2. **Source** 选择 "GitHub Actions"
3. 推送代码到 `main` 分支，GitHub Actions 会自动构建并部署
4. 访问地址：`https://JUNNYOfficial.github.io/nomingbai/`

### 2. 部署后端（二选一）

#### A. Render（推荐，免费）

1. 注册 [render.com](https://render.com)
2. 创建 **Web Service**，选择本 GitHub 仓库
3. 配置：
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node src/server.js`
   - **Environment Variables**:
     - `NODE_ENV=production`
     - `JWT_SECRET=`（生成强密钥）
     - `DATABASE_URL=`（可选，支持 PostgreSQL）
4. 获取服务 URL（如 `https://nomingbai.onrender.com`）

#### B. Railway

1. 注册 [railway.app](https://railway.app)
2. 从 GitHub 导入项目
3. 添加 PostgreSQL 插件
4. 设置环境变量（同上）

### 3. 连接前后端

后端部署后，更新 `.github/workflows/pages.yml` 中的 `VITE_API_BASE_URL`：

```yaml
env:
  VITE_API_BASE_URL: 'https://你的后端地址/api'
```

同时更新后端 `src/config/index.js` 中的 `CORS_ORIGIN`：

```js
CORS_ORIGIN: "https://JUNNYOfficial.github.io"
```

### 4. 使用自定义域名（可选）

如果你有域名（如 `weiyan.app`）：

1. GitHub 仓库 → Settings → Pages → Custom domain → 输入域名
2. DNS 添加 CNAME 记录指向 `JUNNYOfficial.github.io`
3. 修改 `.github/workflows/pages.yml`：
   ```yaml
   env:
     VITE_BASE_PATH: /
     VITE_API_BASE_URL: 'https://你的后端地址/api'
   ```

---

## 方案二：Docker 一键部署（自有服务器）

```bash
# 1. 构建并启动（含 PostgreSQL）
docker-compose up -d

# 2. 初始化数据库
node scripts/migrate-db.js

# 3. 访问 http://localhost:3000
```

---

## 方案三：本地开发

```bash
# 终端 1：启动后端
cd /path/to/project
npm install
PORT=3000 JWT_SECRET=dev node src/server.js

# 终端 2：启动前端
cd frontend
npm install
npm run dev
# 访问 http://localhost:5173
```
