const { fetchData } = require("../services/dataService");

async function getData(req, res) {
  try {
    const result = await fetchData();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getData
};
