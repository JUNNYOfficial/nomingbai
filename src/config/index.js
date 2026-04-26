const dotenv = require("dotenv");
const result = dotenv.config();

if (result.error && process.env.NODE_ENV !== "production") {
  console.warn("No .env file loaded: using environment variables directly.");
}

const JWT_SECRET = process.env.JWT_SECRET || "";
if (!JWT_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET must be set in production environment");
}

module.exports = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_SECRET: JWT_SECRET || "nomingbai_default_secret",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*"
};
