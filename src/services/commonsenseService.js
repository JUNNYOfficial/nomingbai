const fs = require("fs");
const path = require("path");

let commonsenseData = null;

function loadCommonsenseData() {
  if (commonsenseData) {
    return commonsenseData;
  }

  const dataDir = path.join(__dirname, "../../Kimi-Agent");
  const mainDb = path.join(dataDir, "commonsense_database.json");

  commonsenseData = [];
  if (fs.existsSync(mainDb)) {
    try {
      const data = JSON.parse(fs.readFileSync(mainDb, "utf8"));
      if (Array.isArray(data)) {
        commonsenseData = data;
        console.log(`Loaded ${data.length} commonsense items from commonsense_database.json`);
      } else {
        console.warn("commonsense_database.json is not an array");
      }
    } catch (error) {
      console.warn("Failed to load commonsense_database.json:", error.message);
    }
  } else {
    // Fallback to legacy individual files
    const files = [
      "时间常识_data.json",
      "流程常识.json",
      "社交语义_5条常识数据.json",
      "量化常识_5条.json"
    ];
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
