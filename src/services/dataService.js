const db = require("../lib/database");

async function fetchData() {
  if (!db.isConfigured()) {
    return {
      configured: false,
      message: "DATABASE_URL is not configured. Add it to .env or environment variables.",
      sample: [
        { id: 1, name: "示例条目 A" },
        { id: 2, name: "示例条目 B" }
      ]
    };
  }

  const rows = await db.query("SELECT NOW() AS current_time LIMIT 1");
  return {
    configured: true,
    message: "数据库已配置，查询已成功执行。",
    rows
  };
}

module.exports = {
  fetchData
};
