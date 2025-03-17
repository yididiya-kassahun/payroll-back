const { Op } = require("sequelize");
const { Employee, Allowance, Loan, Tax } = require("../models");

exports.addEmployee = async (req, res, next) => {
  try {
    const {
      Employee_TIN,
      Employee_Name,
      Basic_Salary,
      Food_Deduction,
      Penalty,
      Number_of_Working_Days,
      Bank_Account,
    } = req.body;

    if (!Employee_TIN) {
      return res.status(400).json({ error: "Employee TIN is required" });
    }

    const newEmployee = await Employee.create({
      Employee_TIN: Employee_TIN,
      Employee_Name: Employee_Name,
      Basic_Salary: Basic_Salary,
      Food_Deduction: Food_Deduction,
      Penalty: Penalty,
      Number_of_Working_Days: Number_of_Working_Days,
      Bank_Account: Bank_Account,
    });

    res.status(201).json({
      message: "Employee created successfully",
      employee: newEmployee,
    });
  } catch (error) {
    console.error("Error creating employee:", error);

    // Handle Sequelize validation errors
    if (error.name === "SequelizeValidationError") {
      const errors = error.errors.map((err) => err.message);
      return res.status(400).json({ errors: errors });
    }

    // other errors
    res
      .status(500)
      .json({ error: "Failed to create employee", details: error.message });
  }
};

exports.getEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.findAll();

    if (!employees || employees.length === 0) {
      return res.status(404).json({ message: "No employees found." });
    }

    res.status(200).json({
      message: "Employees fetched successfully.",
      employees: employees,
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({
      message: "Failed to fetch employees.",
      error: error.message,
    });
  }
};

exports.getAllowance = async (req, res, next) => {
  try {
    const allowances = await Allowance.findAll({
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["Employee_Name"],
        },
      ],
    });

    if (!allowances || allowances.length === 0) {
      return res.status(404).json({ message: "No allowance found." });
    }

    const formattedAllowances = allowances.map((allowance) => {
      const employeeName = allowance.employee
        ? allowance.employee.dataValues.Employee_Name
        : "Unknown Employee";

      return {
        ...allowance.get({ plain: true }),
        Employee_Name: employeeName,
      };
    });

    res.status(200).json({
      message: "Allowances fetched successfully.",
      allowances: formattedAllowances,
    });
  } catch (error) {
    console.error("Error fetching allowances:", error);
    res.status(500).json({
      message: "Failed to fetch allowances.",
      error: error.message,
    });
  }
};

exports.addAllowance = async (req, res, next) => {
  try {
    const {
      tin_number,
      Non_Taxable_Allowance,
      Taxable_Allowance,
      Overtime_Hours,
      Sales_Commission_Allowance,
      Night_Working_Hours,
      Sunday_Working_Hours,
      Holiday_Working_Hours,
    } = req.body;

    if (!tin_number) {
      return res.status(400).json({ error: "Employee TIN is required" });
    }

    const employee = await Employee.findByPk(tin_number);
    if (!employee) {
      return res
        .status(400)
        .json({ error: "Employee with that TIN does not exist" });
    }

    const newAllowance = await Allowance.create({
      employee_tin: tin_number,
      non_taxable_allowance: Non_Taxable_Allowance,
      taxable_allowance: Taxable_Allowance,
      overtime_hours: Overtime_Hours,
      sales_commission_allowance: Sales_Commission_Allowance,
      night_working_hours: Night_Working_Hours,
      sunday_working_hours: Sunday_Working_Hours,
      holiday_working_hours: Holiday_Working_Hours,
    });

    res.status(201).json({
      message: "Allowance created successfully",
      allowance: newAllowance,
    });
  } catch (error) {
    console.error("Error creating allowance:", error);

    if (error.name === "SequelizeValidationError") {
      const errors = error.errors.map((err) => err.message);
      return res.status(400).json({ errors: errors });
    }
    res
      .status(500)
      .json({ error: "Failed to create allowance", details: error.message });
  }
};

exports.addLoan = async (req, res, next) => {
  try {
    const {
      tin_number,
      Loan_Amount,
      Loan_Deduction_Per_Month,
      Deduction_Start_Date,
    } = req.body;

    if (!tin_number) {
      return res.status(400).json({ error: "Employee TIN is required" });
    }

    const employee = await Employee.findOne({
      where: { Employee_TIN: tin_number },
    });

    if (!employee) {
      return res
        .status(400)
        .json({ error: "Employee with that TIN does not exist" });
    }

    const loanAmount = parseFloat(Loan_Amount);
    const monthlyDeduction = parseFloat(Loan_Deduction_Per_Month);

    if (
      isNaN(loanAmount) ||
      isNaN(monthlyDeduction) ||
      loanAmount <= 0 ||
      monthlyDeduction <= 0
    ) {
      return res
        .status(400)
        .json({ error: "Invalid loan amount or deduction per month" });
    }

    const totalMonths = Math.ceil(loanAmount / monthlyDeduction);

    let endDate = new Date(Deduction_Start_Date);
    if (isNaN(endDate.getTime())) {
      return res.status(400).json({ error: "Invalid Deduction Start Date" });
    }
    endDate.setMonth(endDate.getMonth() + totalMonths);

    const Deduction_End_Date = endDate.toISOString().split("T")[0];

    const newLoan = await Loan.create({
      EmployeeTin: tin_number,
      Loan_Amount: loanAmount,
      Loan_Deduction_Per_Month: monthlyDeduction,
      Deduction_Start_Date,
      Deduction_End_Date,
    });

    res.status(201).json({
      message: "Loan created successfully",
      loan: newLoan,
    });
  } catch (err) {
    console.error("Error creating loan:", err);
    if (err.name === "SequelizeValidationError") {
      const errors = err.errors.map((err) => err.message);
      return res.status(400).json({ errors });
    }
    res
      .status(500)
      .json({ error: "Failed to create loan", details: err.message });
  }
};

exports.getLoan = async (req, res, next) => {
  const { tin_number } = req.query;

  try {
    const loan = await Loan.findOne({
      where: { EmployeeTin: tin_number },
    });

    if (!loan || loan.length === 0) {
      return res.status(404).json({ message: "No loan found." });
    }

    res.status(200).json({
      message: "loan fetched successfully.",
      loan: loan,
    });
  } catch (error) {
    console.error("Error fetching loan:", error);
    res.status(500).json({
      message: "Failed to fetch loan.",
      error: error.message,
    });
  }
};

exports.getTaxes = async (req, res, next) => {
  const { tin_number } = req.query;

  try {
    const tax = await Tax.findOne({
      where: { employee_tin: tin_number },
    });

    if (!tax || tax.length === 0) {
      return res.status(404).json({ message: "No tax found." });
    }

    res.status(200).json({
      message: "tax fetched successfully.",
      tax: tax,
    });
  } catch (error) {
    console.error("Error fetching tax:", error);
    res.status(500).json({
      message: "Failed to fetch tax.",
      error: error.message,
    });
  }
};
