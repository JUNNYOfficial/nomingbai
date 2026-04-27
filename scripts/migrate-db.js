#!/usr/bin/env node
/**
 * Database migration script for nomingbai
 * Creates all required tables with proper schema.
 * Run: node scripts/migrate-db.js
 */

const db = require("../src/lib/database");

const MIGRATIONS = [
  {
    name: "create_users_table",
    postgres: `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    mysql: `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  },
  {
    name: "create_commonsense_table",
    postgres: `CREATE TABLE IF NOT EXISTS commonsense (
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
    )`,
    mysql: `CREATE TABLE IF NOT EXISTS commonsense (
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
    )`
  },
  {
    name: "create_agent_logs_table",
    postgres: `CREATE TABLE IF NOT EXISTS agent_logs (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL,
      prompt TEXT NOT NULL,
      response TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    mysql: `CREATE TABLE IF NOT EXISTS agent_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL,
      prompt TEXT NOT NULL,
      response TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  }
];

async function runMigrations() {
  if (!db.isConfigured()) {
    console.error("❌ DATABASE_URL not set. Please configure the database connection.");
    process.exit(1);
  }

  await db.init();
  const dialect = db.getDialect();
  console.log(`🗄️  Database dialect: ${dialect}`);

  for (const migration of MIGRATIONS) {
    const sql = dialect === "postgres" ? migration.postgres : migration.mysql;
    try {
      await db.query(sql);
      console.log(`✅ ${migration.name}`);
    } catch (err) {
      console.error(`❌ ${migration.name} failed: ${err.message}`);
      process.exit(1);
    }
  }

  console.log("🎉 All migrations completed successfully.");
  process.exit(0);
}

runMigrations().catch((err) => {
  console.error("Migration error:", err.message);
  process.exit(1);
});
