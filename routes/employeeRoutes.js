const express = require("express");
const employee = require("../API/employeeController");

const router = express.Router();

router.post("/api/v1/employee", employee.addEmployee);
router.get("/api/v1/employees", employee.getEmployees);

router.post("/api/v1/allowance", employee.addAllowance);
router.get("/api/v1/allowance", employee.getAllowance);

router.post("/api/v1/loan", employee.addLoan);
router.get("/api/v1/loan", employee.getLoan);

router.get("/api/v1/tax", employee.getTaxes);

module.exports = router;
