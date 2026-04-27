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
const { initFromDatabase } = require("./services/commonsenseService");
const swaggerSpec = require("./config/swagger");
const swaggerUi = require("swagger-ui-express");

const app = express();
const port = config.PORT || 3000;

const frontendDist = path.join(__dirname, "../frontend/dist");
const appDist = path.join(__dirname, "../app/dist");
const publicDir = path.join(__dirname, "../public");

// Simple request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
}));

app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
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

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));

// API routes
app.use("/api/auth", authRouter);
app.use("/api/agent", agentRouter);
app.use("/api/commonsense", commonsenseRouter);
app.use("/api", indexRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Landing page (product homepage) static assets
app.use("/landing", express.static(appDist));

// Frontend app entry points
const frontendPaths = ["/chat", "/login", "/register", "/browse", "/history"];
app.get(frontendPaths, (req, res) => {
  if (require("fs").existsSync(frontendDist)) {
    res.sendFile(path.join(frontendDist, "index.html"));
  } else {
    res.sendFile(path.join(publicDir, "index.html"));
  }
});
app.get("/browse/:id", (req, res) => {
  if (require("fs").existsSync(frontendDist)) {
    res.sendFile(path.join(frontendDist, "index.html"));
  } else {
    res.sendFile(path.join(publicDir, "index.html"));
  }
});

// Root path → landing page
app.get("/", (req, res) => {
  if (require("fs").existsSync(appDist)) {
    res.sendFile(path.join(appDist, "index.html"));
  } else if (require("fs").existsSync(frontendDist)) {
    res.sendFile(path.join(frontendDist, "index.html"));
  } else {
    res.sendFile(path.join(publicDir, "index.html"));
  }
});

// Frontend static assets
app.use(express.static(frontendDist));

// Landing page SPA fallback
app.get("*", (req, res) => {
  if (require("fs").existsSync(appDist)) {
    res.sendFile(path.join(appDist, "index.html"));
  } else if (require("fs").existsSync(frontendDist)) {
    res.sendFile(path.join(frontendDist, "index.html"));
  } else {
    res.sendFile(path.join(publicDir, "index.html"));
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.path}:`, err.message);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    error: config.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

app.listen(port, async () => {
  console.log(`nomingbai backend running at http://localhost:${port}`);
  console.log(`NODE_ENV=${config.NODE_ENV}, DATABASE_URL=${config.DATABASE_URL ? "configured" : "missing"}`);
  console.log(`Landing page: ${require("fs").existsSync(appDist) ? appDist : "not built"}`);
  console.log(`App frontend: ${require("fs").existsSync(frontendDist) ? frontendDist : "not built"}`);

  try {
    await initFromDatabase();
  } catch (error) {
    console.warn("Failed to init commonsense from database:", error.message);
  }
});
