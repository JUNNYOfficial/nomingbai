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
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
  } else if (dialect === "mysql") {
    await db.query(`CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
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
    await db.query("INSERT INTO users (username, password_hash) VALUES (?, ?)", [username, passwordHash]);
    return { username };
  }

  const exists = memoryUsers.some((user) => user.username === username);
  if (exists) {
    throw new Error("用户名已存在");
  }
  const user = { id: memoryUsers.length + 1, username, password_hash: passwordHash };
  memoryUsers.push(user);
  return { username };
}

async function authenticateUser(username, password) {
  let user = null;
  if (db.isConfigured()) {
    await ensureUserTable();
    const rows = await db.query("SELECT id, username, password_hash FROM users WHERE username = ? LIMIT 1", [username]);
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

  return { id: user.id, username: user.username };
}

module.exports = {
  registerUser,
  authenticateUser
};
