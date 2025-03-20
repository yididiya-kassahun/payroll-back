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
 *   put:
 *     summary: Update an employee
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
 *       200:
 *         description: Employee updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.put("/employee", authenticateJWT, employee.updateEmployee);

/**
 * @swagger
 * /api/v1/employees/{tin}:
 *   delete:
 *     summary: Delete an employee by TIN
 *     tags: [Employees]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tin
 *         schema:
 *           type: string
 *         required: true
 *         description: The TIN of the employee to delete
 *     responses:
 *       200:
 *         description: Employee deleted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Employee not found
 */
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

/**
 * @swagger
 * /api/v1/allowance:
 *   put:
 *     summary: Update an existing employee allowance
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
 *               employee_tin:
 *                 type: string
 *                 description: The employee's TIN number.
 *               allowance_id:
 *                 type: integer
 *                 description: The ID of the allowance to update. Crucial for identifying the specific allowance.
 *               amount:
 *                 type: number
 *                 description: The new amount for the allowance.
 *               description:
 *                 type: string
 *                 description: A description of the allowance.
 *         example:
 *           employee_tin: "123456789"
 *           allowance_id: 10
 *           amount: 250.00
 *           description: "Updated monthly housing allowance"
 *     responses:
 *       200:
 *         description: Allowance updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A success message.
 *                 updatedAllowance:
 *                   type: object
 *                   description: The updated allowance object.
 *                   properties:
 *                     allowance_id:
 *                       type: integer
 *                     amount:
 *                       type: number
 *                     description:
 *                       type: string
 *
 *       400:
 *         description: Bad request (e.g., invalid employee_tin, missing data, invalid amount)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       404:
 *         description: Employee or allowance not found
 *       500:
 *         description: Internal server error
 */
router.put("/allowance", authenticateJWT, employee.updateAllowance);

/**
 * @swagger
 * /api/v1/deleteAllowance/{employee_tin}:
 *   delete:
 *     summary: Delete an allowance for an employee
 *     tags: [Employees]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employee_tin
 *         schema:
 *           type: string
 *         required: true
 *         description: The employee's TIN number
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employeeId:
 *                 type: integer
 *               amount:
 *                 type: number
 *               allowance_id:
 *                 type: integer
 *         example:
 *           employeeId: 123
 *           amount: 100.00
 *           allowance_id: 456
 *     responses:
 *       200:
 *         description: Allowance deleted successfully
 *       204:
 *         description: Allowance deleted successfully (no content)
 *       400:
 *         description: Bad request (e.g., invalid employee_tin, missing data)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       404:
 *         description: Employee or allowance not found
 *       500:
 *         description: Internal server error
 */
router.delete(
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
