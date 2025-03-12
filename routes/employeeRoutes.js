const express = require("express");
const employee = require("../API/employeeController");

const router = express.Router();

router.post("/employee", employee.addEmployee);
router.get("/employees", employee.getEmployees);

module.exports = router;
