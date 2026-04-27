const express = require("express");
const { registerUser, authenticateUser } = require("../services/userService");
const { signToken, validatePassword } = require("../lib/auth");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "username and password are required" });
    }

    const validation = validatePassword(password);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.message });
    }

    await registerUser(username.trim(), password);
    res.status(201).json({ message: "注册成功" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "username and password are required" });
    }

    const user = await authenticateUser(username.trim(), password);
    const token = signToken({ id: user.id, username: user.username });
    res.json({ token, username: user.username });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

router.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

module.exports = router;
