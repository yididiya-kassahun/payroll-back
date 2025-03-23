const express = require("express");
const reportController = require("../API/reportController");
const authenticateJWT = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: API for generating reports and dashboard statistics
 */

/**
 * @swagger
 * /api/v1/dashboard-stat:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Reports]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalEmployees:
 *                   type: integer
 *                 totalPayroll:
 *                   type: number
 *                 pendingLoans:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/dashboard-stat", authenticateJWT, reportController.reportStat);

router.get("/rates", authenticateJWT, reportController.fetchRates);
router.put("/rates", authenticateJWT, reportController.updateRates);

module.exports = router;
