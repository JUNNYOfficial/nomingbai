# nomingbai

A backend-first web project scaffold for a web application.

## Project structure

- `src/server.js` - Express server entrypoint
- `src/routes/index.js` - HTTP routes
- `src/controllers/homeController.js` - main API response
- `src/controllers/statusController.js` - health check endpoint
- `src/services/messageService.js` - backend business logic sample
- `public/index.html` - frontend page that fetches backend data

## APIs

### 基础接口
- `GET /api/` - 返回欢迎消息和状态
- `GET /api/status` - 返回服务健康检查信息（含常识库统计）
- `GET /api/data` - 返回数据接口，如果未配置数据库则返回示例数据

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录，返回 JWT token

### Agent 接口
- `POST /api/agent/invoke` - 使用已登录用户的 Token 调用 Agent（基于常识库回答）
- `GET /api/agent/history?page=&limit=` - 查询当前用户的对话历史

### 常识库接口
- `GET /api/commonsense?page=&limit=&category=&q=` - 常识列表（支持分类、分页、搜索）
- `GET /api/commonsense/categories` - 分类列表
- `GET /api/commonsense/:id` - 单条常识详情
- `POST /api/commonsense` - 创建常识（需登录）
- `PUT /api/commonsense/:id` - 更新常识（需登录）
- `DELETE /api/commonsense/:id` - 删除常识（需登录）

## Configuration

Copy `.env.example` to `.env` and fill in your database connection URL and JWT secret:

```bash
cp .env.example .env
```

Supported database URLs:

- PostgreSQL: `postgres://user:password@host:5432/kimi_agent`
- MySQL: `mysql://user:password@host:3306/kimi_agent`

If no `DATABASE_URL` is set, `/api/data` will return sample data and a hint.

## Authentication

1. Register with `POST /api/auth/register` using JSON body `{ "username": "name", "password": "secret" }`
2. Login with `POST /api/auth/login` and receive `{ "token": "..." }`
3. Call `/api/agent/invoke` with header `Authorization: Bearer <token>` and body `{ "prompt": "你的问题" }`

## Commonsense Data

The project includes a commonsense knowledge base in `Kimi-Agent/` directory, containing **52** data entries across **8** categories:

- 时间常识 (Time commonsense) — 8 条
- 流程常识 (Process commonsense) — 8 条
- 社交语义 (Social semantics) — 8 条
- 量化常识 (Quantitative commonsense) — 8 条
- 空间常识 (Spatial commonsense) — 5 条
- 消费常识 (Consumer commonsense) — 5 条
- 数字生活常识 (Digital life commonsense) — 5 条
- 生活避险常识 (Life safety commonsense) — 5 条

The Agent service uses this data to provide relevant answers to user queries.

## Run locally

```bash
# 安装后端依赖
npm install

# 安装前端依赖
npm install --prefix frontend

# 开发模式（仅启动后端，前端需另启）
npm run dev

# 或分别启动
npm run dev          # 后端
npm run dev:frontend # 前端（Vite dev server）
```

Then visit `http://localhost:3000`.

## Notes

- 项目使用 Express 进行后端路由和静态文件托管。
- 使用 `dotenv` 读取 `.env` 中的数据库连接信息。
- 用户注册和登录逻辑封装在 `src/services/userService.js`。
- Agent 调用逻辑封装在 `src/services/agentService.js`，基于常识库回答问题。
- 常识库支持 JSON 文件或 PostgreSQL/MySQL 数据库双模式。
- 前端使用 React + Vite + Tailwind CSS，构建输出到 `frontend/dist`。
- 如果你要添加更多后端功能，请在 `src/controllers/` 和 `src/services/` 中添加逻辑，并把路由连接到 `src/routes/index.js`。
