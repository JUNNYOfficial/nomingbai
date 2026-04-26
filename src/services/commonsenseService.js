const fs = require("fs");
const path = require("path");

let commonsenseData = null;

function loadCommonsenseData() {
  if (commonsenseData) {
    return commonsenseData;
  }

  const dataDir = path.join(__dirname, "../../Kimi-Agent");
  const files = [
    "时间常识_data.json",
    "流程常识.json",
    "社交语义_5条常识数据.json",
    "量化常识_5条.json"
  ];

  commonsenseData = [];
  for (const file of files) {
    const filePath = path.join(dataDir, file);
    if (fs.existsSync(filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
        commonsenseData.push(...data);
      } catch (error) {
        console.warn(`Failed to load ${file}:`, error.message);
      }
    }
  }

  return commonsenseData;
}

function searchCommonsense(query, limit = 3) {
  const data = loadCommonsenseData();
  const lowerQuery = query.toLowerCase();

  // Simple keyword matching
  const matches = data.filter(item =>
    item.question.toLowerCase().includes(lowerQuery) ||
    item.answer.toLowerCase().includes(lowerQuery) ||
    item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );

  return matches.slice(0, limit);
}

function getRandomCommonsense(limit = 1) {
  const data = loadCommonsenseData();
  const shuffled = data.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, limit);
}

module.exports = {
  loadCommonsenseData,
  searchCommonsense,
  getRandomCommonsense
};
