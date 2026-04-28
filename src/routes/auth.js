/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: 认证接口
 */

const express = require("express");
const { registerUser, authenticateUser, getUserById, updatePassword, listUsers, deleteUser, updateUserRole } = require("../services/userService");
const { signToken, verifyToken, requireAdmin, validatePassword } = require("../lib/auth");

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
function validateUsername(username) {
  if (!username || typeof username !== 'string') {
    return { valid: false, message: '用户名不能为空' };
  }
  const trimmed = username.trim();
  if (trimmed.length < 3 || trimmed.length > 30) {
    return { valid: false, message: '用户名长度应为 3-30 个字符' };
  }
  // Allow letters, digits, underscores, Chinese characters, hyphens
  if (!/^[\w\u4e00-\u9fa5-]+$/.test(trimmed)) {
    return { valid: false, message: '用户名只能包含字母、数字、下划线、中文和连字符' };
  }
  return { valid: true };
}

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "username and password are required" });
    }

    const uVal = validateUsername(username);
    if (!uVal.valid) {
      return res.status(400).json({ error: uVal.message });
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
    const token = signToken({ id: user.id, username: user.username, role: user.role });
    res.json({ token, username: user.username, role: user.role });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "用户不存在" });
    }
    res.json({ id: user.id, username: user.username, role: user.role || 'user', created_at: user.created_at });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/change-password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "currentPassword and newPassword are required" });
    }
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.message });
    }
    await updatePassword(req.user.id, currentPassword, newPassword);
    res.json({ message: "密码修改成功" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Admin-only user management
router.get("/users", verifyToken, requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 20));
    const result = await listUsers(page, limit);
    res.json({ data: result.users, total: result.total, page, limit });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/users/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    await deleteUser(Number(req.params.id));
    res.json({ message: "用户已删除" });
  } catch (error) {
    if (error.message === "用户不存在") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

router.put("/users/:id/role", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ error: "role is required" });
    }
    await updateUserRole(Number(req.params.id), role);
    res.json({ message: "角色已更新" });
  } catch (error) {
    if (error.message === "用户不存在" || error.message === "无效的角色") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

router.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

module.exports = router;
