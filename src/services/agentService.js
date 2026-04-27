const db = require("../lib/database");
const logger = require("../lib/logger");
const { searchCommonsense, getRandomCommonsense } = require("./commonsenseService");
const { classifyIntent, searchAgentData, formatConversationResponse } = require("./agentDataService");

function difficultyToStars(difficulty) {
  const map = { easy: "⭐", medium: "⭐⭐", hard: "⭐⭐⭐" };
  return map[difficulty] || difficulty;
}

async function invokeAgent(user, prompt) {
  const response = {
    user: user.username,
    prompt,
    output: await generateResponse(prompt),
    createdAt: new Date().toISOString()
  };

  if (db.isConfigured()) {
    try {
      await saveAgentLog(user, prompt, response.output);
    } catch (error) {
      logger.warn("Agent log save failed: " + error.message);
    }
  }

  return response;
}

async function generateResponse(prompt) {
  // Search multiple data sources in parallel
  const scoredResults = searchCommonsense(prompt, 5);
  const topCommonsenseScore = scoredResults.length > 0 ? scoredResults[0].score : 0;

  // Classify intent and search agent training data
  const intentResult = classifyIntent(prompt);
  let agentResults = [];
  let agentType = null;

  if (intentResult && intentResult.score >= 3) {
    agentType = intentResult.item.agent_type;
    agentResults = searchAgentData(agentType, prompt, 3);
  }

  // If no intent match, try searching all agent data
  if (agentResults.length === 0) {
    agentResults = searchAgentData(null, prompt, 3);
  }

  const topAgentScore = agentResults.length > 0 ? agentResults[0].score : 0;

  // Decide which data source is more relevant
  const useAgentData = topAgentScore >= 6 && topAgentScore > topCommonsenseScore * 2;
  const useCommonsenseHigh = topCommonsenseScore >= 12 && !useAgentData;
  const useCommonsenseMedium = topCommonsenseScore >= 5 && !useAgentData && topAgentScore < 6;

  // Priority 1: Agent training data (when clearly more relevant than commonsense)
  if (useAgentData) {
    const primary = agentResults[0].item;
    const formatted = formatConversationResponse(primary);
    if (formatted) {
      let output = formatted;

      if (agentResults.length >= 2 && agentResults[1].score >= 4) {
        const secondary = agentResults[1].item;
        const secFormatted = formatConversationResponse(secondary);
        if (secFormatted) {
          output += `\n\n📌 你可能还想了解：${secondary.intent}\n${secFormatted.split("\n\n").slice(1).join("\n\n").substring(0, 200)}...`;
        }
      }

      // Blend with commonsense if also relevant
      if (topCommonsenseScore >= 5) {
        const cs = scoredResults[0].item;
        output += `\n\n📖 相关常识：${cs.question}\n${cs.answer}`;
      }

      return output;
    }
  }

  // Priority 2: Commonsense data (high confidence)
  if (useCommonsenseHigh) {
    const primary = scoredResults[0].item;
    let output = `${primary.answer}`;

    if (scoredResults.length >= 2 && scoredResults[1].score >= 8) {
      const secondary = scoredResults[1].item;
      output += `\n\n📌 你可能还想了解：${secondary.question}\n${secondary.answer}`;
    }

    output += `\n\n⚠️ 认知陷阱：${primary.trap}`;
    output += `\n📊 难度：${difficultyToStars(primary.difficulty)}`;

    if (primary.related && primary.related.length > 0) {
      output += `\n🔗 关联条目：${primary.related.join(", ")}`;
    }

    return output;
  }

  // Priority 3: Commonsense medium confidence
  if (useCommonsenseMedium) {
    const primary = scoredResults[0].item;
    let output = `${primary.answer}`;

    if (scoredResults.length >= 2 && scoredResults[1].score >= 8) {
      const secondary = scoredResults[1].item;
      output += `\n\n📌 你可能还想了解：${secondary.question}\n${secondary.answer}`;
    }

    output += `\n\n⚠️ 认知陷阱：${primary.trap}`;
    output += `\n📊 难度：${difficultyToStars(primary.difficulty)}`;

    if (primary.related && primary.related.length > 0) {
      output += `\n🔗 关联条目：${primary.related.join(", ")}`;
    }

    return output;
  }

  if (topCommonsenseScore >= 5) {
    const primary = scoredResults[0].item;
    let output = `根据你的问题，我找到了相关内容：\n\n${primary.question}\n\n${primary.answer}`;

    if (scoredResults.length >= 2) {
      const others = scoredResults.slice(1, 3);
      output += "\n\n💡 相关常识：";
      for (const r of others) {
        output += `\n  · ${r.item.question}`;
      }
    }

    return output;
  }

  // Priority 3: Agent data with lower score but still relevant
  if (topAgentScore >= 3) {
    const primary = agentResults[0].item;
    const formatted = formatConversationResponse(primary);
    if (formatted) return formatted;
  }

  // Low relevance or no match: fallback to random commonsense
  const randomData = getRandomCommonsense(1);
  if (randomData.length > 0) {
    const item = randomData[0];
    return `我没有找到与你问题直接相关的常识，但这里有一条你可能感兴趣的「${item.category}」常识：\n\n${item.question}\n\n${item.answer}\n\n如果你想问的是其他内容，可以尝试用更具体的关键词描述，比如「${item.tags.slice(0, 3).join("、")}」等。`;
  }

  // Final fallback
  return `Agent 正在学习中，暂时无法回答「${prompt}」。请尝试换种方式提问，或联系管理员补充相关常识数据。`;
}

async function saveAgentLog(user, prompt, output) {
  await db.init();
  const dialect = db.getDialect();
  if (!dialect) {
    return;
  }

  if (dialect === "postgres") {
    await db.query(`CREATE TABLE IF NOT EXISTS agent_logs (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL,
      prompt TEXT NOT NULL,
      response TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
  } else if (dialect === "mysql") {
    await db.query(`CREATE TABLE IF NOT EXISTS agent_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL,
      prompt TEXT NOT NULL,
      response TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
  }

  await db.query("INSERT INTO agent_logs (username, prompt, response) VALUES (?, ?, ?)", [user.username, prompt, output]);
}

async function* streamResponse(prompt) {
  const fullText = await generateResponse(prompt);
  const chunkSize = 4; // characters per chunk
  const delayMs = 12;    // ms between chunks

  for (let i = 0; i < fullText.length; i += chunkSize) {
    const chunk = fullText.slice(i, i + chunkSize);
    yield { chunk };
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  yield { done: true, createdAt: new Date().toISOString() };
}

module.exports = {
  invokeAgent,
  streamResponse
};
