const fs = require("fs");
const path = require("path");
const logger = require("../lib/logger");

let intentData = null;
let workData = null;
let socialData = null;
let masterData = null;

const DATA_DIR = path.join(__dirname, "../../Kimi-Agent");

function loadJSON(filename) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    logger.warn("Agent data file not found: " + filePath);
    return [];
  }
  try {
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return Array.isArray(data) ? data : [];
  } catch (error) {
    logger.warn("Failed to load " + filename + ": " + error.message);
    return [];
  }
}

function loadAllData() {
  if (intentData) return;

  intentData = loadJSON("intent_classification_data.json");
  workData = loadJSON("work_agent_data.json");
  socialData = loadJSON("social_agent_data.json");
  masterData = loadJSON("master_agent_data.json");

  logger.info(
    "Loaded agent data: intents=" + intentData.length + ", work=" + workData.length + ", social=" + socialData.length + ", master=" + masterData.length
  );
}

// Extract meaningful tokens from Chinese text
function extractTokens(text) {
  const cleaned = text.toLowerCase().replace(/[^\u4e00-\u9fa5a-z0-9]/g, ' ');
  const tokens = cleaned.split(/\s+/).filter(t => t.length >= 2);
  // Also add bigrams for Chinese
  const bigrams = [];
  for (const token of tokens) {
    if (/^[\u4e00-\u9fa5]+$/.test(token) && token.length >= 3) {
      for (let i = 0; i <= token.length - 2; i++) {
        bigrams.push(token.slice(i, i + 2));
      }
    }
  }
  return [...new Set([...tokens, ...bigrams])];
}

// Simple keyword matching score
function scoreKeywords(query, keywords) {
  const queryLower = query.toLowerCase();
  let score = 0;
  for (const kw of keywords) {
    const kwLower = kw.toLowerCase();
    if (queryLower.includes(kwLower)) {
      score += 2;
      if (queryLower === kwLower) score += 1;
    }
  }
  return score;
}

// Token-level matching score
function scoreTokens(query, text) {
  const queryTokens = extractTokens(query);
  const textTokens = extractTokens(text);
  let score = 0;
  for (const qt of queryTokens) {
    for (const tt of textTokens) {
      if (qt === tt) score += 3;
      else if (tt.includes(qt) || qt.includes(tt)) score += 1.5;
    }
  }
  return score;
}

function classifyIntent(query) {
  loadAllData();
  if (intentData.length === 0) return null;

  let bestMatch = null;
  let bestScore = 0;

  for (const item of intentData) {
    let score = 0;

    // Match against user_queries
    for (const q of item.user_queries || []) {
      score += scoreTokens(query, q);
    }

    // Match against keywords
    score += scoreKeywords(query, item.keywords || []);

    // Match against intent name
    score += scoreTokens(query, item.intent);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }

  return bestMatch ? { item: bestMatch, score: bestScore } : null;
}

function searchAgentData(agentType, query, limit = 3) {
  loadAllData();

  let dataset = [];
  if (agentType === "职场Agent") dataset = [...workData, ...masterData];
  else if (agentType === "社交Agent") dataset = [...socialData, ...masterData];
  else if (agentType === "主控Agent") dataset = masterData;
  else {
    // Search all
    dataset = [...workData, ...socialData, ...masterData];
  }

  if (dataset.length === 0) return [];

  const scored = dataset.map((item) => {
    let score = 0;

    // Match intent
    score += scoreTokens(query, item.intent) * 3;

    // Match tags
    for (const tag of item.tags || []) {
      score += scoreTokens(query, tag) * 2;
    }

    // Match conversation content
    for (const turn of item.conversation || []) {
      score += scoreTokens(query, turn.content) * 0.5;
    }

    // Match source_lessons
    for (const lesson of item.source_lessons || []) {
      score += scoreTokens(query, lesson) * 0.5;
    }

    return { item, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function formatConversationResponse(item) {
  const conversation = item.conversation || [];
  if (conversation.length === 0) return null;

  // Find the assistant turn with the most content
  let bestResponse = "";
  for (const turn of conversation) {
    if (turn.role === "assistant" && turn.content.length > bestResponse.length) {
      bestResponse = turn.content;
    }
  }

  if (!bestResponse) return null;

  // Clean up markdown formatting for plain text response
  let output = bestResponse;

  // Add metadata
  const meta = [];
  if (item.agent_type) meta.push(`📌 ${item.agent_type}`);
  if (item.intent) meta.push(`主题：${item.intent}`);
  if (item.priority) meta.push(`优先级：${item.priority}`);

  if (meta.length > 0) {
    output = meta.join(" | ") + "\n\n" + output;
  }

  // Add source lessons if available
  if (item.source_lessons && item.source_lessons.length > 0) {
    output += "\n\n📚 相关课程：" + item.source_lessons.join("、");
  }

  // Add tags
  if (item.tags && item.tags.length > 0) {
    output += "\n🏷️ " + item.tags.join("、");
  }

  return output;
}

function getAgentStats() {
  loadAllData();
  return {
    intents: intentData.length,
    work: workData.length,
    social: socialData.length,
    master: masterData.length,
    total: intentData.length + workData.length + socialData.length + masterData.length
  };
}

module.exports = {
  loadAllData,
  classifyIntent,
  searchAgentData,
  formatConversationResponse,
  getAgentStats
};
