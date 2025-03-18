const express = require("express");
const payrollController = require("../API/payrollController");
const authenticateJWT = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payroll
 *   description: Payroll management API
 */

/**
 * @swagger
 * /api/v1/payroll:
 *   post:
 *     summary: Process payroll
 *     tags: [Payroll]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employeeId:
 *                 type: integer
 *               salary:
 *                 type: number
 *               deductions:
 *                 type: number
 *     responses:
 *       201:
 *         description: Payroll processed successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/payroll", authenticateJWT, payrollController.processPayroll);

/**
 * @swagger
 * /api/v1/payroll:
 *   get:
 *     summary: Fetch all payrolls
 *     tags: [Payroll]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of payrolls
 *       401:
 *         description: Unauthorized
 */
router.get("/payroll", authenticateJWT, payrollController.fetchPayrolls);

/**
 * @swagger
 * /api/v1/reports/payroll:
 *   get:
 *     summary: Generate payroll report
 *     tags: [Payroll]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Payroll report generated
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/reports/payroll",
  authenticateJWT,
  payrollController.generatePayrollReport
);

/**
 * @swagger
 * /api/v1/sendEmail:
 *   post:
 *     summary: Send payroll email
 *     tags: [Payroll]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               subject:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email sent successfully
 *       400:
 *         description: Bad request
 */
router.post("/sendEmail", payrollController.sendEmail);

module.exports = router;
