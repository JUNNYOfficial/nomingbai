/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: 认证接口
 */

const express = require("express");
const { registerUser, authenticateUser } = require("../services/userService");
const { signToken, validatePassword } = require("../lib/auth");

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: 用户注册
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username: { type: string }
 *               password: { type: string, minLength: 6 }
 *     responses:
 *       201:
 *         description: 注册成功
 *       400:
 *         description: 参数错误或用户名已存在
 */
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

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: 用户登录
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: 返回 JWT token
 *       401:
 *         description: 用户名或密码错误
 */
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
