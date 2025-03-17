const express = require("express");
const employee = require("../API/employeeController");
const authenticateJWT = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/api/v1/employee",authenticateJWT, employee.addEmployee);
router.get("/api/v1/employees",authenticateJWT, employee.getEmployees);

router.post("/api/v1/allowance",authenticateJWT, employee.addAllowance);
router.get("/api/v1/allowance",authenticateJWT, employee.getAllowance);

router.post("/api/v1/loan",authenticateJWT, employee.addLoan);
router.get("/api/v1/loan",authenticateJWT, employee.getLoan);

router.get("/api/v1/tax",authenticateJWT, employee.getTaxes);

module.exports = router;
