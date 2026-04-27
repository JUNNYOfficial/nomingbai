#!/usr/bin/env node
/**
 * 将数据库中的 commonsense 数据导出到 JSON 文件
 * 用法: node scripts/backup-db-to-json.js [输出路径]
 */
const fs = require("fs");
const path = require("path");
const db = require("../src/lib/database");

async function main() {
  if (!db.isConfigured()) {
    console.error("错误: DATABASE_URL 未配置");
    process.exit(1);
  }

  const outputPath = process.argv[2] || path.join(__dirname, "../Kimi-Agent/commonsense_database.json");

  await db.init();
  const rows = await db.query("SELECT * FROM commonsense ORDER BY id");

  const data = rows.map((row) => ({
    id: row.id,
    category: row.category,
    question: row.question,
    answer: row.answer,
    trap: row.trap,
    context: row.context,
    related: JSON.parse(row.related || "[]"),
    source: row.source,
    difficulty: row.difficulty,
    tags: JSON.parse(row.tags || "[]")
  }));

  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), "utf8");
  console.log(`已导出 ${data.length} 条数据到 ${outputPath}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("备份失败:", err.message);
  process.exit(1);
});
