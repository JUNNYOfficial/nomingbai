const dotenv = require("dotenv");
const result = dotenv.config();

if (result.error && process.env.NODE_ENV !== "production") {
  console.warn("No .env file loaded: using environment variables directly.");
}

let JWT_SECRET = process.env.JWT_SECRET || "";
if (!JWT_SECRET) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be set in production environment");
  }
  // In development, generate a random secret on startup to prevent trivial forgery
  JWT_SECRET = require("crypto").randomBytes(32).toString("hex");
  console.warn("[Config] JWT_SECRET not set, using a randomly generated secret for this session.");
}

module.exports = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_SECRET,
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*"
};
