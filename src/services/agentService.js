const db = require("../lib/database");
const { searchCommonsense, getRandomCommonsense } = require("./commonsenseService");

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
      console.warn("Agent log save failed:", error.message);
    }
  }

  return response;
}

async function generateResponse(prompt) {
  // Search for relevant commonsense data
  const scoredResults = searchCommonsense(prompt, 5);
  const topScore = scoredResults.length > 0 ? scoredResults[0].score : 0;

  // High relevance: detailed answer with the best match
  if (topScore >= 12) {
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

  // Medium relevance: concise answer with suggestions
  if (topScore >= 5) {
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

module.exports = {
  invokeAgent
};
