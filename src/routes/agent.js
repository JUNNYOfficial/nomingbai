/**
 * @swagger
 * tags:
 *   name: Agent
 *   description: Agent 对话接口
 */

const express = require("express");
const { verifyToken } = require("../lib/auth");
const { invokeAgent } = require("../services/agentService");
const db = require("../lib/database");

const router = express.Router();

/**
 * @swagger
 * /agent/invoke:
 *   post:
 *     summary: 调用 Agent
 *     tags: [Agent]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt: { type: string }
 *     responses:
 *       200:
 *         description: 返回 Agent 回答
 *       401:
 *         description: 未登录
 */
router.post("/invoke", verifyToken, async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "prompt is required" });
    }

    const response = await invokeAgent(req.user, prompt);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /agent/history:
 *   get:
 *     summary: 对话历史
 *     tags: [Agent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: 返回对话历史列表
 *       401:
 *         description: 未登录
 */
router.get("/history", verifyToken, async (req, res) => {
  try {
    if (!db.isConfigured()) {
      return res.json({ data: [], total: 0 });
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const countResult = await db.query(
      "SELECT COUNT(*) as cnt FROM agent_logs WHERE username = ?",
      [req.user.username]
    );
    const total = Number(countResult[0].cnt);

    const logs = await db.query(
      "SELECT * FROM agent_logs WHERE username = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [req.user.username, limit, offset]
    );

    res.json({
      data: logs,
      total,
      page,
      limit
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

module.exports = router;
