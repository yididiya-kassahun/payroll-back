const express = require("express");
const payroll = require("../API/payrollController");

const router = express.Router();

router.post("/api/v1/payroll", payroll.processPayroll);
router.get("/api/v1/payroll", payroll.fetchPayrolls);

module.exports = router;
