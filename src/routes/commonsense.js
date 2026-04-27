const express = require("express");
const { verifyToken } = require("../lib/auth");
const commonsenseService = require("../services/commonsenseService");

const router = express.Router();

// GET /api/commonsense - 列表（支持分类、分页、搜索）
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

// GET /api/commonsense/categories - 分类列表
router.get("/categories", async (req, res) => {
  try {
    const categories = commonsenseService.getCategories();
    res.json({ data: categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/commonsense/:id - 单条详情
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

// POST /api/commonsense - 创建（需登录）
router.post("/", verifyToken, async (req, res) => {
  try {
    const item = await commonsenseService.createCommonsense(req.body);
    res.status(201).json({ data: item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/commonsense/:id - 更新（需登录）
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const item = await commonsenseService.updateCommonsense(req.params.id, req.body);
    res.json({ data: item });
  } catch (error) {
    if (error.message === "常识条目不存在") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/commonsense/:id - 删除（需登录）
router.delete("/:id", verifyToken, async (req, res) => {
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
