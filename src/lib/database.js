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

function prepareQuery(sql, params = []) {
  if (clientType === "postgres") {
    const values = [];
    let index = 1;
    const finalSql = sql.replace(/\?/g, () => "$" + index++);
    values.push(...params);
    return { sql: finalSql, params: values };
  }

  return { sql, params };
}

async function query(sql, params = []) {
  if (!isConfigured()) {
    throw new Error("Database not configured. Set DATABASE_URL in .env or environment.");
  }

  await init();
  const prepared = prepareQuery(sql, params);

  if (clientType === "postgres") {
    const result = await client.query(prepared.sql, prepared.params);
    return result.rows;
  }

  if (clientType === "mysql") {
    const [rows] = await client.execute(prepared.sql, prepared.params);
    return rows;
  }

  throw new Error("Database client is not initialized.");
}

function getDialect() {
  return clientType;
}

module.exports = {
  isConfigured,
  init,
  query,
  getDialect
};
