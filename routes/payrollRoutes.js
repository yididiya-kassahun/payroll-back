const express = require("express");
const payrollController = require("../API/payrollController");

const router = express.Router();

router.post("/api/v1/payroll", payrollController.processPayroll);
router.get("/api/v1/payroll", payrollController.fetchPayrolls);

router.get("/api/v1/reports/payroll", payrollController.generatePayrollReport);

router.post("/api/v1/sendEmail", payrollController.sendEmail);

module.exports = router;
