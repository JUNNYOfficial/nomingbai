const config = require("../config");
let client = null;
let clientType = null;

function isConfigured() {
  return Boolean(config.DATABASE_URL);
}

async function init() {
  if (!config.DATABASE_URL) {
    return null;
  }

  if (client) {
    return client;
  }

  const dbUrl = new URL(config.DATABASE_URL);
  const protocol = dbUrl.protocol.replace(":", "");

  if (protocol.startsWith("postgres")) {
    const { Client } = require("pg");
    client = new Client({ connectionString: config.DATABASE_URL });
    await client.connect();
    clientType = "postgres";
    return client;
  }

  if (protocol.startsWith("mysql")) {
    const mysql = require("mysql2/promise");
    client = await mysql.createPool(config.DATABASE_URL);
    clientType = "mysql";
    return client;
  }

  throw new Error(`Unsupported database protocol: ${protocol}`);
}

async function query(sql, params = []) {
  if (!isConfigured()) {
    throw new Error("Database not configured. Set DATABASE_URL in .env or environment.");
  }

  await init();

  if (clientType === "postgres") {
    const result = await client.query(sql, params);
    return result.rows;
  }

  if (clientType === "mysql") {
    const [rows] = await client.execute(sql, params);
    return rows;
  }

  throw new Error("Database client is not initialized.");
}

module.exports = {
  isConfigured,
  init,
  query
};
