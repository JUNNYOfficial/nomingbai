const db = require("../lib/database");

async function invokeAgent(user, prompt) {
  const response = {
    user: user.username,
    prompt,
    output: `Agent 应答：收到请求 "${prompt}"，正在处理...`,
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
