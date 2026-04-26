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

## Run locally

```bash
npm install
npm run dev
```

Then visit `http://localhost:3000`.

## Notes

- 项目使用 Express 进行后端路由和静态文件托管。
- 前端页面在浏览器中通过 AJAX 请求 `/api/` 来加载后端内容。
- 如果你要添加更多后端功能，可以先在 `src/controllers/` 和 `src/services/` 中添加逻辑，然后把路由连接到 `src/routes/index.js`。
