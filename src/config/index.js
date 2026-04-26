const dotenv = require("dotenv");
const result = dotenv.config();

if (result.error && process.env.NODE_ENV !== "production") {
  console.warn("No .env file loaded: using environment variables directly.");
}

module.exports = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL || ""
};
