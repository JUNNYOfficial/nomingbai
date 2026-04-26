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

## Configuration

Copy `.env.example` to `.env` and fill in your database connection URL:

```bash
cp .env.example .env
```

Supported database URLs:

- PostgreSQL: `postgres://user:password@host:5432/database`
- MySQL: `mysql://user:password@host:3306/database`

If no `DATABASE_URL` is set, `/api/data` will return sample data and a hint.

## Run locally

```bash
npm install
npm run dev
```

Then visit `http://localhost:3000`.

## Notes

- 项目使用 Express 进行后端路由和静态文件托管。
- 使用 `dotenv` 读取 `.env` 中的数据库连接信息。
- 数据库访问逻辑封装在 `src/lib/database.js`，业务逻辑在 `src/services/dataService.js`。
- 如果你要添加更多后端功能，请在 `src/controllers/` 和 `src/services/` 中添加逻辑，并把路由连接到 `src/routes/index.js`。
