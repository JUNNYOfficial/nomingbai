const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "nomingbai API",
      version: "0.1.0",
      description: "nomingbai 常识 Agent 后端 API 文档",
    },
    servers: [
      {
        url: "/api",
        description: "当前服务器",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes/*.js", "./src/controllers/*.js"],
};

module.exports = swaggerJsdoc(options);
