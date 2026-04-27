/**
 * @swagger
 * tags:
 *   name: Base
 *   description: 基础接口
 */

const express = require("express");
const { getHome } = require("../controllers/homeController");
const { getStatus } = require("../controllers/statusController");
const { getData } = require("../controllers/dataController");

const router = express.Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: 欢迎消息
 *     tags: [Base]
 *     responses:
 *       200:
 *         description: 返回欢迎消息和状态
 */
router.get("/", getHome);

/**
 * @swagger
 * /status:
 *   get:
 *     summary: 健康检查
 *     tags: [Base]
 *     responses:
 *       200:
 *         description: 返回服务状态和常识库统计
 */
router.get("/status", getStatus);

/**
 * @swagger
 * /data:
 *   get:
 *     summary: 数据接口
 *     tags: [Base]
 *     responses:
 *       200:
 *         description: 返回数据库查询结果或示例数据
 */
router.get("/data", getData);

router.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

module.exports = router;
