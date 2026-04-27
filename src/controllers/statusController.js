const { loadCommonsenseData } = require("../services/commonsenseService");

function getStatus(req, res) {
  const data = loadCommonsenseData();
  const categories = [...new Set(data.map((item) => item.category))].sort();

  res.json({
    status: "ok",
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    commonsense: {
      total: data.length,
      categories: categories,
      categoryCounts: categories.reduce((acc, cat) => {
        acc[cat] = data.filter((item) => item.category === cat).length;
        return acc;
      }, {})
    }
  });
}

module.exports = {
  getStatus
};
