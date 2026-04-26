const fs = require("fs");
const path = require("path");

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

function extractKeywords(query) {
  const cleaned = query
    .toLowerCase()
    .replace(/[^\u4e00-\u9fa5a-z0-9\s]/g, " ") // 保留中文、英文、数字、空格
    .trim();

  const tokens = cleaned.split(/\s+/).filter((t) => t.length > 0);
  const keywords = [];

  for (const token of tokens) {
    // 保留长度 >= 2 且非停用词的基础 token
    if (token.length >= 2 && !STOP_WORDS.has(token)) {
      keywords.push(token);
    }

    // 对纯中文长 token（>= 3 字），额外提取 2-gram 增强匹配
    if (/^[\u4e00-\u9fa5]+$/.test(token) && token.length >= 3) {
      for (let i = 0; i <= token.length - 2; i++) {
        const bigram = token.slice(i, i + 2);
        if (!STOP_WORDS.has(bigram)) {
          keywords.push(bigram);
        }
      }
    }
  }

  // 去重
  const unique = [...new Set(keywords)];

  // 如果过滤后没有关键词，退而求其次使用原始 token（去掉纯停用词）
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
        // 完全匹配额外加分
        if (value === keyword) {
          score += weight * 0.5;
        }
      }
    }
    if (keywordMatched) {
      keywordMatchCount++;
    }
  }

  // 关键词覆盖率加成：匹配的关键词越多，得分越高
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
    // 无法提取有效关键词时，退化为完整字符串包含匹配
    const lowerQuery = query.toLowerCase();
    const matches = data.filter(
      (item) =>
        item.question.toLowerCase().includes(lowerQuery) ||
        item.answer.toLowerCase().includes(lowerQuery) ||
        item.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
    return matches.slice(0, limit).map((item) => ({ item, score: 1 }));
  }

  // 计算每条数据的相关性得分
  const scored = data.map((item) => ({
    item,
    score: calculateRelevance(item, keywords)
  }));

  // 按得分降序排序，过滤掉 0 分
  const sorted = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return sorted.slice(0, limit);
}

function getRandomCommonsense(limit = 1) {
  const data = loadCommonsenseData();
  const shuffled = data.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, limit);
}

function getCommonsenseByCategory(category) {
  const data = loadCommonsenseData();
  return data.filter((item) => item.category === category);
}

module.exports = {
  loadCommonsenseData,
  searchCommonsense,
  getRandomCommonsense,
  getCommonsenseByCategory
};
