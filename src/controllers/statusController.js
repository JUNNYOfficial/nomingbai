function getStatus(req, res) {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString()
  });
}

module.exports = {
  getStatus
};
