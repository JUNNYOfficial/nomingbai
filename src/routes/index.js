const express = require("express");
const { getHome } = require("../controllers/homeController");
const { getStatus } = require("../controllers/statusController");
const { getData } = require("../controllers/dataController");

const router = express.Router();

router.get("/", getHome);
router.get("/status", getStatus);
router.get("/data", getData);

router.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

module.exports = router;
