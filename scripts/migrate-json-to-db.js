#!/usr/bin/env node
/**
 * 将 Kimi-Agent/commonsense_database.json 中的数据同步到数据库
 * 用法: node scripts/migrate-json-to-db.js
 */
const fs = require("fs");
const path = require("path");
const db = require("../src/lib/database");

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("错误: DATABASE_URL 环境变量未设置");
    process.exit(1);
  }

  const dataPath = path.join(__dirname, "../Kimi-Agent/commonsense_database.json");
  if (!fs.existsSync(dataPath)) {
    console.error("错误: 数据文件不存在:", dataPath);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  if (!Array.isArray(data)) {
    console.error("错误: 数据文件不是数组");
    process.exit(1);
  }

  console.log(`读取到 ${data.length} 条常识数据`);

  await db.init();
  const dialect = db.getDialect();

  const createTableSQL = dialect === "postgres"
    ? `CREATE TABLE IF NOT EXISTS commonsense (
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
      )`
    : `CREATE TABLE IF NOT EXISTS commonsense (
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

  await db.query(createTableSQL);
  console.log("commonsense 表已就绪");

  let inserted = 0;
  let updated = 0;

  for (const item of data) {
    const existing = await db.query("SELECT id FROM commonsense WHERE id = ? LIMIT 1", [item.id]);

    const values = [
      item.id,
      item.category,
      item.question,
      item.answer,
      item.trap || "",
      item.context || "",
      JSON.stringify(item.related || []),
      item.source || "",
      item.difficulty || "medium",
      JSON.stringify(item.tags || [])
    ];

    if (existing.length > 0) {
      await db.query(
        `UPDATE commonsense SET category=?, question=?, answer=?, trap=?, context=?,
         related=?, source=?, difficulty=?, tags=? WHERE id=?`,
        [...values.slice(1), item.id]
      );
      updated++;
    } else {
      await db.query(
        `INSERT INTO commonsense (id, category, question, answer, trap, context, related, source, difficulty, tags)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        values
      );
      inserted++;
    }
  }

  console.log(`\n同步完成: 新增 ${inserted} 条, 更新 ${updated} 条, 总计 ${data.length} 条`);
  process.exit(0);
}

main().catch((err) => {
  console.error("迁移失败:", err.message);
  process.exit(1);
});
