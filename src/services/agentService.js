const db = require("../lib/database");
const { searchCommonsense, getRandomCommonsense } = require("./commonsenseService");

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
  const relevantData = searchCommonsense(prompt);

  if (relevantData.length > 0) {
    const item = relevantData[0];
    return `基于常识库回答：\n\n${item.question}\n\n${item.answer}\n\n认知陷阱：${item.trap}\n\n难度：${item.difficulty}`;
  }

  // Fallback to random commonsense
  const randomData = getRandomCommonsense(1);
  if (randomData.length > 0) {
    const item = randomData[0];
    return `我没有找到直接相关的常识，但这里有一条有趣的常识：\n\n${item.question}\n\n${item.answer}`;
  }

  // Final fallback
  return `Agent 应答：收到请求 "${prompt}"，正在处理...（常识库正在加载中）`;
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
