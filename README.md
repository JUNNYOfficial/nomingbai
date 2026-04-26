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

- `GET /api/` - 返回欢迎消息和状态
- `GET /api/status` - 返回服务健康检查信息
- `GET /api/data` - 返回数据接口，如果未配置数据库则返回示例数据
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录，返回 JWT token
- `POST /api/agent/invoke` - 使用已登录用户的 Token 调用 Agent

## Configuration

Copy `.env.example` to `.env` and fill in your database connection URL and JWT secret:

```bash
cp .env.example .env
```

Supported database URLs:

- PostgreSQL: `postgres://user:password@host:5432/database`
- MySQL: `mysql://user:password@host:3306/database`

If no `DATABASE_URL` is set, `/api/data` will return sample data and a hint.

## Authentication

1. Register with `POST /api/auth/register` using JSON body `{ "username": "name", "password": "secret" }`
2. Login with `POST /api/auth/login` and receive `{ "token": "..." }`
3. Call `/api/agent/invoke` with header `Authorization: Bearer <token>` and body `{ "prompt": "你的问题" }`

## Run locally

```bash
npm install
npm run dev
```

Then visit `http://localhost:3000`.

## Notes

- 项目使用 Express 进行后端路由和静态文件托管。
- 使用 `dotenv` 读取 `.env` 中的数据库连接信息。
- 用户注册和登录逻辑封装在 `src/services/userService.js`。
- Agent 调用逻辑封装在 `src/services/agentService.js`。
- 如果你要添加更多后端功能，请在 `src/controllers/` 和 `src/services/` 中添加逻辑，并把路由连接到 `src/routes/index.js`。
