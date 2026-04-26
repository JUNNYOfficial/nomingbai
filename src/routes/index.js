const express = require("express");
const { getHome } = require("../controllers/homeController");
const { getStatus } = require("../controllers/statusController");

const router = express.Router();

router.get("/", getHome);
router.get("/status", getStatus);

module.exports = router;
