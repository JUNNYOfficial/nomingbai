/**
 * @swagger
 * tags:
 *   name: Commonsense
 *   description: 常识库接口
 */

const express = require("express");
const { verifyToken, requireAdmin } = require("../lib/auth");
const commonsenseService = require("../services/commonsenseService");

const router = express.Router();

/**
 * @swagger
 * /commonsense:
 *   get:
 *     summary: 常识列表
 *     tags: [Commonsense]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: 搜索关键词
 *     responses:
 *       200:
 *         description: 返回常识列表
 */
router.get("/", async (req, res) => {
  try {
    const { category, page = 1, limit = 20, q } = req.query;

    if (q) {
      const results = commonsenseService.searchCommonsense(q, Number(limit) || 10);
      return res.json({
        data: results.map((r) => r.item),
        query: q,
        total: results.length
      });
    }

    const list = await commonsenseService.getCommonsenseList({
      category,
      page: Number(page),
      limit: Number(limit)
    });
    const total = await commonsenseService.countCommonsense(category);

    res.json({
      data: list,
      total,
      page: Number(page),
      limit: Number(limit),
      category: category || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /commonsense/categories:
 *   get:
 *     summary: 分类列表
 *     tags: [Commonsense]
 *     responses:
 *       200:
 *         description: 返回所有分类
 */
router.get("/categories", async (req, res) => {
  try {
    const categories = commonsenseService.getCategories();
    res.json({ data: categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /commonsense/{id}:
 *   get:
 *     summary: 常识详情
 *     tags: [Commonsense]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: 返回单条常识详情
 *       404:
 *         description: 常识条目不存在
 */
router.get("/:id", async (req, res) => {
  try {
    const item = await commonsenseService.getCommonsenseById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: "常识条目不存在" });
    }
    res.json({ data: item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /commonsense:
 *   post:
 *     summary: 创建常识（需登录）
 *     tags: [Commonsense]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category: { type: string }
 *               question: { type: string }
 *               answer: { type: string }
 *               trap: { type: string }
 *               context: { type: string }
 *               related: { type: array, items: { type: string } }
 *               source: { type: string }
 *               difficulty: { type: string, enum: [easy, medium, hard] }
 *               tags: { type: array, items: { type: string } }
 *     responses:
 *       201:
 *         description: 创建成功
 *       401:
 *         description: 未登录
 */
function validateCommonsenseBody(body) {
  const { category, question, answer } = body;
  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    return { valid: false, message: '分类不能为空' };
  }
  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    return { valid: false, message: '问题不能为空' };
  }
  if (!answer || typeof answer !== 'string' || answer.trim().length === 0) {
    return { valid: false, message: '答案不能为空' };
  }
  if (question.length > 500) {
    return { valid: false, message: '问题长度不能超过 500 字符' };
  }
  if (answer.length > 5000) {
    return { valid: false, message: '答案长度不能超过 5000 字符' };
  }
  return { valid: true };
}

router.post("/", verifyToken, requireAdmin, async (req, res) => {
  try {
    const v = validateCommonsenseBody(req.body);
    if (!v.valid) {
      return res.status(400).json({ error: v.message });
    }
    const item = await commonsenseService.createCommonsense(req.body);
    res.status(201).json({ data: item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /commonsense/{id}:
 *   put:
 *     summary: 更新常识（需登录）
 *     tags: [Commonsense]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: 更新成功
 *       401:
 *         description: 未登录
 *       404:
 *         description: 常识条目不存在
 */
router.put("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const v = validateCommonsenseBody(req.body);
    if (!v.valid) {
      return res.status(400).json({ error: v.message });
    }
    const item = await commonsenseService.updateCommonsense(req.params.id, req.body);
    res.json({ data: item });
  } catch (error) {
    if (error.message === "常识条目不存在") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /commonsense/{id}:
 *   delete:
 *     summary: 删除常识（需登录）
 *     tags: [Commonsense]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: 删除成功
 *       401:
 *         description: 未登录
 *       404:
 *         description: 常识条目不存在
 */
router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    await commonsenseService.deleteCommonsense(req.params.id);
    res.json({ message: "删除成功" });
  } catch (error) {
    if (error.message === "常识条目不存在") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

router.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

module.exports = router;
