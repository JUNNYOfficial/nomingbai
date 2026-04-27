/**
 * Simple structured logger
 * In production: JSON format for log aggregation
 * In development: human-readable format with colors
 */

const config = require("../config");

const isProd = config.NODE_ENV === "production";

function formatLog(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  if (isProd) {
    return JSON.stringify({ timestamp, level, message, ...meta });
  }
  const color = {
    debug: "\x1b[36m", // cyan
    info: "\x1b[32m",  // green
    warn: "\x1b[33m",  // yellow
    error: "\x1b[31m", // red
    reset: "\x1b[0m"
  };
  const metaStr = Object.keys(meta).length > 0 ? " " + JSON.stringify(meta) : "";
  return `${color[level]}[${level.toUpperCase()}]${color.reset} ${timestamp} ${message}${metaStr}`;
}

const logger = {
  debug: (message, meta) => { if (!isProd) console.debug(formatLog("debug", message, meta)); },
  info: (message, meta) => console.log(formatLog("info", message, meta)),
  warn: (message, meta) => console.warn(formatLog("warn", message, meta)),
  error: (message, meta) => console.error(formatLog("error", message, meta)),
};

module.exports = logger;
