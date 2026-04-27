const bcrypt = require("bcryptjs");
const db = require("../lib/database");

const memoryUsers = [];

async function ensureUserTable() {
  if (!db.isConfigured()) {
    return;
  }

  const dialect = db.getDialect();
  if (dialect === "postgres") {
    await db.query(`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    // Migrate existing tables that lack role column
    try {
      await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'`);
    } catch (e) { /* column may already exist or unsupported syntax */ }
  } else if (dialect === "mysql") {
    await db.query(`CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    // MySQL: try to add column if it doesn't exist
    try {
      await db.query(`ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user'`);
    } catch (e) { /* column may already exist */ }
  }
}

async function registerUser(username, password) {
  const passwordHash = bcrypt.hashSync(password, 10);

  if (db.isConfigured()) {
    await ensureUserTable();
    const existing = await db.query("SELECT id FROM users WHERE username = ? LIMIT 1", [username]);
    if (existing.length > 0) {
      throw new Error("用户名已存在");
    }
    await db.query("INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'user')", [username, passwordHash]);
    return { username, role: 'user' };
  }

  const exists = memoryUsers.some((user) => user.username === username);
  if (exists) {
    throw new Error("用户名已存在");
  }
  const user = { id: memoryUsers.length + 1, username, password_hash: passwordHash, role: 'user' };
  memoryUsers.push(user);
  return { username, role: 'user' };
}

async function authenticateUser(username, password) {
  let user = null;
  if (db.isConfigured()) {
    await ensureUserTable();
    const rows = await db.query("SELECT id, username, password_hash, role FROM users WHERE username = ? LIMIT 1", [username]);
    user = rows[0];
  } else {
    user = memoryUsers.find((item) => item.username === username);
  }

  if (!user) {
    throw new Error("用户名或密码错误");
  }

  const isValid = bcrypt.compareSync(password, user.password_hash);
  if (!isValid) {
    throw new Error("用户名或密码错误");
  }

  return { id: user.id, username: user.username, role: user.role || 'user' };
}

async function getUserById(id) {
  if (db.isConfigured()) {
    await ensureUserTable();
    const rows = await db.query("SELECT id, username, role, created_at FROM users WHERE id = ? LIMIT 1", [id]);
    return rows[0] || null;
  }
  return memoryUsers.find((u) => u.id === id) || null;
}

async function updatePassword(id, currentPassword, newPassword) {
  if (!db.isConfigured()) {
    throw new Error("数据库未配置，无法修改密码");
  }
  await ensureUserTable();
  const rows = await db.query("SELECT password_hash FROM users WHERE id = ? LIMIT 1", [id]);
  if (!rows[0]) {
    throw new Error("用户不存在");
  }
  const isValid = bcrypt.compareSync(currentPassword, rows[0].password_hash);
  if (!isValid) {
    throw new Error("当前密码错误");
  }
  const newHash = bcrypt.hashSync(newPassword, 10);
  await db.query("UPDATE users SET password_hash = ? WHERE id = ?", [newHash, id]);
  return true;
}

module.exports = {
  registerUser,
  authenticateUser,
  getUserById,
  updatePassword
};
