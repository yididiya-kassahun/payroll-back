const express = require("express");
const payrollController = require("../API/payrollController");
const authenticateJWT = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/api/v1/payroll",authenticateJWT, payrollController.processPayroll);
router.get("/api/v1/payroll",authenticateJWT, payrollController.fetchPayrolls);

router.get("/api/v1/reports/payroll",authenticateJWT, payrollController.generatePayrollReport);

router.post("/api/v1/sendEmail", payrollController.sendEmail);

module.exports = router;
