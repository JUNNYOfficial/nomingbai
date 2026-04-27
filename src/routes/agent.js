const express = require("express");
const { verifyToken } = require("../lib/auth");
const { invokeAgent } = require("../services/agentService");
const db = require("../lib/database");

const router = express.Router();

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

// GET /api/agent/history - 查询当前用户的对话历史
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
