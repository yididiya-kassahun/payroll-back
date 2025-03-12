const express = require("express");
const payroll = require("../API/Payroll");

const router = express.Router();

router.get("/payroll", payroll.getEmployeePayroll);

module.exports = router;
