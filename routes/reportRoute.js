const express = require("express");
const reportController = require("../API/reportController");

const router = express.Router();

router.get("/api/v1/dashboard-stat", reportController.reportStat);

module.exports = router;
