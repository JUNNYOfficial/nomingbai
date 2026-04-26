const express = require("express");
const path = require("path");
const config = require("./config");
const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth");
const agentRouter = require("./routes/agent");

const app = express();
const port = config.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

app.use("/api", indexRouter);
app.use("/api/auth", authRouter);
app.use("/api/agent", agentRouter);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(port, () => {
  console.log(`nomingbai backend running at http://localhost:${port}`);
  console.log(`NODE_ENV=${config.NODE_ENV}, DATABASE_URL=${config.DATABASE_URL ? "configured" : "missing"}`);
});
