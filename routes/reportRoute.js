const express = require("express");
const reportController = require("../API/reportController");
const authenticateJWT = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/api/v1/dashboard-stat",authenticateJWT, reportController.reportStat);

module.exports = router;
