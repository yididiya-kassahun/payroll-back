const express = require("express");
const employee = require("../API/employeeController");
const authenticateJWT = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Employees
 *   description: Employee management API
 */

/**
 * @swagger
 * /api/v1/employees/employee:
 *   post:
 *     summary: Add a new employee
 *     tags: [Employees]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               position:
 *                 type: string
 *     responses:
 *       201:
 *         description: Employee added successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/employee", authenticateJWT, employee.addEmployee);

/**
 * @swagger
 * /api/v1/employees/employees:
 *   get:
 *     summary: Get all employees
 *     tags: [Employees]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of employees
 *       401:
 *         description: Unauthorized
 */
router.get("/employees", authenticateJWT, employee.getEmployees);

/**
 * @swagger
 * /api/v1/employees:
 *   post:
 *     summary: Update an allowance
 *     tags: [Employees]
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
 *               amount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Allowance updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.put("/employee", authenticateJWT, employee.updateEmployee);

router.post("/deleteEmployee/:tin", authenticateJWT, employee.deleteEmployee);

/**
 * @swagger
 * /api/v1/employees/allowance:
 *   post:
 *     summary: Add an allowance
 *     tags: [Employees]
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
 *               amount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Allowance added successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

router.post("/allowance", authenticateJWT, employee.addAllowance);

/**
 * @swagger
 * /api/v1/employees/allowance:
 *   get:
 *     summary: Get allowances
 *     tags: [Employees]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of allowances
 *       401:
 *         description: Unauthorized
 */
router.get("/allowance", authenticateJWT, employee.getAllowance);

router.put("/allowance", authenticateJWT, employee.updateAllowance);

router.post(
  "/deleteAllowance/:employee_tin",
  authenticateJWT,
  employee.deleteAllowance
);
/**
 * @swagger
 * /api/v1/employees/loan:
 *   post:
 *     summary: Add a loan
 *     tags: [Employees]
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
 *               amount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Loan added successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/loan", authenticateJWT, employee.addLoan);

/**
 * @swagger
 * /api/v1/employees/loan:
 *   get:
 *     summary: Get loans
 *     tags: [Employees]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of loans
 *       401:
 *         description: Unauthorized
 */
router.get("/loan", authenticateJWT, employee.getLoan);

/**
 * @swagger
 * /api/v1/employees/tax:
 *   get:
 *     summary: Get tax information
 *     tags: [Employees]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of tax information
 *       401:
 *         description: Unauthorized
 */
router.get("/tax", authenticateJWT, employee.getTaxes);

module.exports = router;
