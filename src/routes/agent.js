const express = require("express");
const { verifyToken } = require("../lib/auth");
const { invokeAgent } = require("../services/agentService");

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

module.exports = router;
