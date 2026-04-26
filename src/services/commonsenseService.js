const fs = require("fs");
const path = require("path");
const db = require("../lib/database");

let commonsenseData = null;

// 中文常见停用词
const STOP_WORDS = new Set([
  "的", "了", "在", "是", "我", "有", "和", "就", "不", "人", "都", "一", "一个", "上", "也",
  "很", "到", "说", "要", "去", "你", "会", "着", "没有", "看", "好", "自己", "这", "那",
  "什么", "怎么", "吗", "呢", "吧", "啊", "哦", "嗯", "与", "及", "等", "或", "但是",
  "然而", "因为", "所以", "如果", "虽然", "比如", "例如", "一下", "多少", "多久", "多长",
  "多大", "几", "问", "问题", "回答", "解答", "告诉", "知道", "了解", "关于", "有关",
  "一些", "哪", "哪些", "谁", "为什么", "可以", "需要", "应该", "能", "会", "让",
  "把", "被", "对", "将", "还", "而", "且", "又", "并", "但", "只", "最", "更", "太",
  "非常", "已经", "正在", "曾经", "过", "得", "地", "着", "过", "给", "向", "从",
  "比", "跟", "同", "为", "以", "于", "即", "便", "即使", "尽管", "无论", "不管"
]);

function loadCommonsenseData() {
  if (commonsenseData) {
    return commonsenseData;
  }

  const dataDir = path.join(__dirname, "../../Kimi-Agent");
  const mainDb = path.join(dataDir, "commonsense_database.json");

  commonsenseData = [];
  if (fs.existsSync(mainDb)) {
    try {
      const data = JSON.parse(fs.readFileSync(mainDb, "utf8"));
      if (Array.isArray(data)) {
        commonsenseData = data;
        console.log(`Loaded ${data.length} commonsense items from commonsense_database.json`);
      } else {
        console.warn("commonsense_database.json is not an array");
      }
    } catch (error) {
      console.warn("Failed to load commonsense_database.json:", error.message);
    }
  } else {
    // Fallback to legacy individual files
    const files = [
      "时间常识_data.json",
      "流程常识.json",
      "社交语义_5条常识数据.json",
      "量化常识_5条.json"
    ];
    for (const file of files) {
      const filePath = path.join(dataDir, file);
      if (fs.existsSync(filePath)) {
        try {
          const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
          commonsenseData.push(...data);
        } catch (error) {
          console.warn(`Failed to load ${file}:`, error.message);
        }
      }
    }
  }

  return commonsenseData;
}

// ---------- Database integration ----------

async function ensureCommonsenseTable() {
  if (!db.isConfigured()) return;

  const dialect = db.getDialect();
  let sql;
  if (dialect === "postgres") {
    sql = `CREATE TABLE IF NOT EXISTS commonsense (
      id VARCHAR(50) PRIMARY KEY,
      category VARCHAR(50) NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      trap TEXT,
      context TEXT,
      related TEXT,
      source TEXT,
      difficulty VARCHAR(20) DEFAULT 'medium',
      tags TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`;
  } else {
    sql = `CREATE TABLE IF NOT EXISTS commonsense (
      id VARCHAR(50) PRIMARY KEY,
      category VARCHAR(50) NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      trap TEXT,
      context TEXT,
      related TEXT,
      source TEXT,
      difficulty VARCHAR(20) DEFAULT 'medium',
      tags TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;
  }

  await db.query(sql);
}

function parseRow(row) {
  return {
    ...row,
    related: JSON.parse(row.related || "[]"),
    tags: JSON.parse(row.tags || "[]")
  };
}

async function initFromDatabase() {
  if (!db.isConfigured()) return;

  try {
    await ensureCommonsenseTable();
    const rows = await db.query("SELECT * FROM commonsense ORDER BY id");
    if (rows.length > 0) {
      commonsenseData = rows.map(parseRow);
      console.log(`Loaded ${rows.length} commonsense items from database`);
      return;
    }

    // DB empty: sync from JSON
    const jsonData = loadCommonsenseData();
    if (jsonData.length > 0) {
      for (const item of jsonData) {
        await db.query(
          `INSERT INTO commonsense (id, category, question, answer, trap, context, related, source, difficulty, tags)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [item.id, item.category, item.question, item.answer, item.trap || "", item.context || "",
           JSON.stringify(item.related || []), item.source || "", item.difficulty || "medium",
           JSON.stringify(item.tags || [])]
        );
      }
      commonsenseData = jsonData;
      console.log(`Synced ${jsonData.length} commonsense items from JSON to database`);
    }
  } catch (error) {
    console.warn("Failed to init commonsense from database:", error.message);
  }
}

// ---------- CRUD ----------

async function getCommonsenseList({ category, page = 1, limit = 20 } = {}) {
  page = Math.max(1, Number(page));
  limit = Math.max(1, Math.min(100, Number(limit)));

  if (db.isConfigured()) {
    let sql = "SELECT * FROM commonsense WHERE 1=1";
    const params = [];
    if (category) {
      sql += " AND category = ?";
      params.push(category);
    }
    sql += " ORDER BY id LIMIT ? OFFSET ?";
    params.push(limit, (page - 1) * limit);
    const rows = await db.query(sql, params);
    return rows.map(parseRow);
  }

  let data = loadCommonsenseData();
  if (category) {
    data = data.filter((item) => item.category === category);
  }
  const start = (page - 1) * limit;
  return data.slice(start, start + limit);
}

async function getCommonsenseById(id) {
  if (db.isConfigured()) {
    const rows = await db.query("SELECT * FROM commonsense WHERE id = ? LIMIT 1", [id]);
    return rows.length > 0 ? parseRow(rows[0]) : null;
  }
  return loadCommonsenseData().find((item) => item.id === id) || null;
}

async function createCommonsense(data) {
  const item = {
    id: data.id || `${data.category || "custom"}-${Date.now()}`,
    category: data.category,
    question: data.question,
    answer: data.answer,
    trap: data.trap || "",
    context: data.context || "",
    related: Array.isArray(data.related) ? data.related : [],
    source: data.source || "",
    difficulty: data.difficulty || "medium",
    tags: Array.isArray(data.tags) ? data.tags : []
  };

  if (db.isConfigured()) {
    await ensureCommonsenseTable();
    await db.query(
      `INSERT INTO commonsense (id, category, question, answer, trap, context, related, source, difficulty, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [item.id, item.category, item.question, item.answer, item.trap, item.context,
       JSON.stringify(item.related), item.source, item.difficulty, JSON.stringify(item.tags)]
    );
  }

  const list = loadCommonsenseData();
  const idx = list.findIndex((d) => d.id === item.id);
  if (idx >= 0) {
    list[idx] = item;
  } else {
    list.push(item);
  }
  return item;
}

async function updateCommonsense(id, data) {
  const existing = await getCommonsenseById(id);
  if (!existing) {
    throw new Error("常识条目不存在");
  }

  const updated = {
    ...existing,
    ...data,
    id // prevent id change
  };

  if (db.isConfigured()) {
    await db.query(
      `UPDATE commonsense SET category = ?, question = ?, answer = ?, trap = ?, context = ?,
       related = ?, source = ?, difficulty = ?, tags = ? WHERE id = ?`,
      [updated.category, updated.question, updated.answer, updated.trap, updated.context,
       JSON.stringify(updated.related), updated.source, updated.difficulty, JSON.stringify(updated.tags), id]
    );
  }

  const list = loadCommonsenseData();
  const idx = list.findIndex((d) => d.id === id);
  if (idx >= 0) {
    list[idx] = updated;
  }
  return updated;
}

async function deleteCommonsense(id) {
  const existing = await getCommonsenseById(id);
  if (!existing) {
    throw new Error("常识条目不存在");
  }

  if (db.isConfigured()) {
    await db.query("DELETE FROM commonsense WHERE id = ?", [id]);
  }

  const list = loadCommonsenseData();
  const idx = list.findIndex((d) => d.id === id);
  if (idx >= 0) {
    list.splice(idx, 1);
  }
  return existing;
}

function getCategories() {
  const data = loadCommonsenseData();
  const cats = new Set(data.map((item) => item.category));
  return [...cats].sort();
}

async function countCommonsense(category) {
  if (db.isConfigured()) {
    let sql = "SELECT COUNT(*) as cnt FROM commonsense WHERE 1=1";
    const params = [];
    if (category) {
      sql += " AND category = ?";
      params.push(category);
    }
    const rows = await db.query(sql, params);
    return rows[0].cnt;
  }
  let data = loadCommonsenseData();
  if (category) {
    data = data.filter((item) => item.category === category);
  }
  return data.length;
}

// ---------- Search ----------

function extractKeywords(query) {
  const cleaned = query
    .toLowerCase()
    .replace(/[^\u4e00-\u9fa5a-z0-9\s]/g, " ")
    .trim();

  const tokens = cleaned.split(/\s+/).filter((t) => t.length > 0);
  const keywords = [];

  for (const token of tokens) {
    if (token.length >= 2 && !STOP_WORDS.has(token)) {
      keywords.push(token);
    }
    if (/^[\u4e00-\u9fa5]+$/.test(token) && token.length >= 3) {
      for (let i = 0; i <= token.length - 2; i++) {
        const bigram = token.slice(i, i + 2);
        if (!STOP_WORDS.has(bigram)) {
          keywords.push(bigram);
        }
      }
    }
  }

  const unique = [...new Set(keywords)];
  if (unique.length === 0) {
    return tokens.filter((t) => !STOP_WORDS.has(t));
  }
  return unique;
}

function calculateRelevance(item, keywords) {
  const fields = [
    { key: "tags", weight: 10 },
    { key: "question", weight: 8 },
    { key: "category", weight: 6 },
    { key: "id", weight: 5 },
    { key: "answer", weight: 4 },
    { key: "trap", weight: 3 },
    { key: "context", weight: 2 },
    { key: "source", weight: 1 }
  ];

  let score = 0;
  let keywordMatchCount = 0;

  for (const keyword of keywords) {
    let keywordMatched = false;
    for (const { key, weight } of fields) {
      const value = String(item[key] || "").toLowerCase();
      if (value.includes(keyword)) {
        score += weight;
        keywordMatched = true;
        if (value === keyword) {
          score += weight * 0.5;
        }
      }
    }
    if (keywordMatched) {
      keywordMatchCount++;
    }
  }

  if (keywords.length > 0) {
    const coverage = keywordMatchCount / keywords.length;
    score += coverage * 5;
  }

  return score;
}

function searchCommonsense(query, limit = 3) {
  const data = loadCommonsenseData();
  const keywords = extractKeywords(query);

  if (keywords.length === 0) {
    const lowerQuery = query.toLowerCase();
    const matches = data.filter(
      (item) =>
        item.question.toLowerCase().includes(lowerQuery) ||
        item.answer.toLowerCase().includes(lowerQuery) ||
        item.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
    return matches.slice(0, limit).map((item) => ({ item, score: 1 }));
  }

  const scored = data.map((item) => ({
    item,
    score: calculateRelevance(item, keywords)
  }));

  const sorted = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return sorted.slice(0, limit);
}

function getRandomCommonsense(limit = 1) {
  const data = loadCommonsenseData();
  const shuffled = [...data].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, limit);
}

function getCommonsenseByCategory(category) {
  const data = loadCommonsenseData();
  return data.filter((item) => item.category === category);
}

module.exports = {
  loadCommonsenseData,
  initFromDatabase,
  getCommonsenseList,
  getCommonsenseById,
  createCommonsense,
  updateCommonsense,
  deleteCommonsense,
  getCategories,
  countCommonsense,
  searchCommonsense,
  getRandomCommonsense,
  getCommonsenseByCategory
};
