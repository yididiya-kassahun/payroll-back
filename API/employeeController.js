const { Employee, Allowance } = require("../models");

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
    const allowances = await Allowance.findAll();

    if (!allowances || allowances.length === 0) {
      return res.status(404).json({ message: "No allowance found." });
    }

    res.status(200).json({
      message: "Allowances fetched successfully.",
      allowances: allowances,
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

    // Handle Sequelize validation errors
    if (error.name === "SequelizeValidationError") {
      const errors = error.errors.map((err) => err.message);
      return res.status(400).json({ errors: errors });
    }
    res
      .status(500)
      .json({ error: "Failed to create allowance", details: error.message });
  }
};