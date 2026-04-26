const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const config = require("./config");
const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth");
const agentRouter = require("./routes/agent");
const commonsenseRouter = require("./routes/commonsense");

const app = express();
const port = config.PORT || 3000;

const distDir = path.join(__dirname, "../frontend/dist");
const publicDir = path.join(__dirname, "../public");
const staticDir = require("fs").existsSync(distDir) ? distDir : publicDir;

// Security middleware
app.use(helmet());

app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." }
});
app.use(limiter);

// Stricter limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many authentication attempts, please try again later." }
});
app.use("/api/auth/", authLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(staticDir));

app.use("/api", indexRouter);
app.use("/api/auth", authRouter);
app.use("/api/agent", agentRouter);
app.use("/api/commonsense", commonsenseRouter);

// SPA fallback: serve index.html for non-API routes (only GET)
app.get("*", (req, res) => {
  res.sendFile(path.join(staticDir, "index.html"));
});

app.listen(port, () => {
  console.log(`nomingbai backend running at http://localhost:${port}`);
  console.log(`NODE_ENV=${config.NODE_ENV}, DATABASE_URL=${config.DATABASE_URL ? "configured" : "missing"}`);
  console.log(`Serving static files from: ${staticDir}`);
});
