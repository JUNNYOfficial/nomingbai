# 未言 (nomingbai)

> 一个专注于日常生活常识的 AI Agent，帮你理解那些明明应该知道却没人教的事情。

## 在线访问

- **前端（GitHub Pages）**: https://JUNNYOfficial.github.io/nomingbai/
- **API 文档（Swagger）**: https://你的后端地址/api-docs

## 项目简介

未言基于 52 条生活常识数据 + 107 条 Agent 训练数据，覆盖时间、社交、消费、职场等 8 大场景，通过自然语言对话为你解答生活中的隐性常识。

## 技术栈

| 层级 | 技术 |
|------|------|
| 后端 | Express + Node.js 18 + JWT + Rate Limit |
| 数据库 | PostgreSQL / MySQL 双支持（可选内存模式） |
| 前端应用 | React 18 + Vite 5 + Tailwind CSS 3 |
| 落地页 | React 19 + Vite 7 + TypeScript + Three.js |
| 测试 | Vitest + React Testing Library |
| 部署 | GitHub Actions + GitHub Pages / Docker |

## API 接口

### 基础接口
- `GET /api/status` — 健康检查 + 常识库统计

### 认证接口
- `POST /api/auth/register` — 用户注册
- `POST /api/auth/login` — 用户登录
- `GET /api/auth/me` — 当前用户信息
- `POST /api/auth/change-password` — 修改密码

### Agent 接口
- `POST /api/agent/invoke` — 调用 Agent（普通响应）
- `POST /api/agent/invoke-stream` — 调用 Agent（SSE 流式响应）⭐
- `GET /api/agent/history` — 对话历史

### 常识库接口
- `GET /api/commonsense?page=&limit=&category=&q=` — 列表/搜索
- `GET /api/commonsense/categories` — 分类列表
- `GET /api/commonsense/:id` — 详情
- `POST /api/commonsense` — 创建（管理员）
- `PUT /api/commonsense/:id` — 更新（管理员）
- `DELETE /api/commonsense/:id` — 删除（管理员）

## 核心功能

- 💬 **流式对话** — Agent 回答逐字显示，体验更自然
- 🌙 **暗黑模式** — 支持系统偏好检测和手动切换
- 📱 **PWA 支持** — 可安装到手机/桌面主屏
- 👤 **用户管理** — 个人资料、密码修改、角色权限
- 🛠️ **管理后台** — 常识数据 CRUD、用户管理
- 📤 **数据导出** — 对话历史导出为 Markdown / JSON / CSV
- ⌨️ **快捷键** — `/` 搜索聚焦、`Ctrl+L` 清空对话、`?` 快捷键帮助

## 数据规模

| 数据类型 | 数量 |
|---------|------|
| 常识条目 | 52 条（8 个分类） |
| Agent 训练数据 | 107 条（工作/社交/意图/主控 Agent） |

## 本地开发

```bash
# 1. 安装依赖
npm install
npm install --prefix frontend

# 2. 启动后端
PORT=3000 JWT_SECRET=dev node src/server.js

# 3. 启动前端（另开终端）
cd frontend && npm run dev

# 4. 访问 http://localhost:5173
```

## 部署

详见 [DEPLOY.md](./DEPLOY.md)

### 快速部署（GitHub Pages + Render）

1. 推送代码到 GitHub，Actions 自动部署前端到 GitHub Pages
2. 在 Render 创建 Web Service，绑定本仓库
3. 配置环境变量 `JWT_SECRET` 和 `DATABASE_URL`
4. 更新 `CORS_ORIGIN` 为你的 GitHub Pages 域名

### Docker 本地部署

```bash
docker-compose up -d
node scripts/migrate-db.js
```

## 环境变量

```bash
PORT=3000
NODE_ENV=production
DATABASE_URL=postgres://user:pass@host:5432/db
JWT_SECRET=your_strong_secret
CORS_ORIGIN=https://JUNNYOfficial.github.io
```

## 项目结构

```
├── src/                    # Express 后端
│   ├── server.js           # 入口
│   ├── routes/             # API 路由
│   ├── services/           # 业务逻辑
│   ├── lib/                # 工具库（数据库、日志、认证）
│   └── config/             # 配置
├── frontend/               # React 前端应用
│   ├── src/pages/          # 页面组件
│   ├── src/components/     # 复用组件
│   └── dist/               # 构建产物
├── app/                    # 落地页（React 19 + Three.js）
├── Kimi-Agent/             # 常识数据 JSON
├── scripts/                # 迁移/备份脚本
└── docker-compose.yml      # Docker 编排
```
