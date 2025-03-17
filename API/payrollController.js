// backend/controllers/payrollController.js
const { Employee, Allowance, Tax, Payroll, Loan } = require("../models"); // Import your Sequelize models
const {
  calculateTaxableIncome,
  calculateIncomeTax,
  calculatePensionContributions,
  calculateNetPay,
} = require("../utils/payrollCalculations");

exports.processPayroll = async (req, res) => {
  try {
    const { employee_tin } = req.query; // Or get the TIN from the request parameters, depending on your route
    const payrollDate = new Date(); // Or get the payroll date from the request body

    // 1. Fetch Employee Data
    const employee = await Employee.findByPk(employee_tin, {
      include: [{ model: Allowance, as: "allowance" }], // Load the associated allowance data, *use the alias*
    });

    console.log("employee allowance == ", employee);

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // check if there is Allowance object or not, if not create it.
    if (!employee.allowance) {
      // await Allowance.create({ employee_tin: employee_tin });
      return res.status(404).json({ error: "Allowance not found" });
    }

    const allowance = employee.allowance; // Access the allowance object, Use the alias

    // 2. Calculate Gross Earnings
    let grossEarning = Number(employee.Basic_Salary);

    grossEarning += Number(allowance.taxable_allowance || 0);
    grossEarning += Number(allowance.non_taxable_allowance || 0);
    grossEarning += Number(allowance.overtime_hours || 0);
    grossEarning += Number(allowance.sales_commission_allowance || 0);
    grossEarning += Number(allowance.night_working_hours || 0);
    grossEarning += Number(allowance.sunday_working_hours || 0);
    grossEarning += Number(allowance.holiday_working_hours || 0);

    // 3. Calculate Taxable Income
    const taxableIncome = calculateTaxableIncome(
      grossEarning,
      allowance.non_taxable_allowance || 0
    );

    // 4. Calculate Income Tax (Using Ethiopian Tax Brackets)
    const incomeTax = calculateIncomeTax(taxableIncome);

    // 5. Calculate Pension Contributions
    const { employeePensionContribution, employerPensionContribution } =
      calculatePensionContributions(Number(employee.Basic_Salary)); //Corrected field name

    // 6. Calculate Loan Deduction
    let loanDeduction = 0; // Default to no loan deduction

    // Fetch loan information using the EmployeeTin foreign key from the Loan Model
    const loan = await Loan.findOne({
      where: { EmployeeTin: employee_tin }, // Access loan data by foreign key
    });

    if (loan) {
      // Only proceed if a loan exists
      const payrollDateFormatted = new Date(payrollDate);
      const deductionStartDate = new Date(loan.Deduction_Start_Date);
      const deductionEndDate = new Date(loan.Deduction_End_Date);

      //Check if current date lies in between the start and end date
      if (
        payrollDateFormatted >= deductionStartDate &&
        payrollDateFormatted <= deductionEndDate
      ) {
        loanDeduction = Number(loan.Loan_Deduction_Per_Month || 0); // Use the loan amount from loan model
        // Ensure the deduction does not exceed the remaining balance (Implementation of getRemainingLoanBalance function is required)
        // const remainingBalance = await getRemainingLoanBalance(employee_tin);
        // if (loanDeduction > remainingBalance) {
        //   loanDeduction = remainingBalance; // Deduct only the remaining balance
        // }
      }
    }

    // 6. Calculate Total Deductions
    const totalDeductions =
      Number(incomeTax) + // Ensure incomeTax is a number
      Number(employeePensionContribution) + // Ensure employeePensionContribution is a number
      Number(employee.Food_Deduction || 0) + //Corrected field name and conversion
      Number(employee.Penalty || 0) + //Corrected field name and conversion
      Number(loanDeduction);

    // 7. Calculate Net Pay
    const netPay = calculateNetPay(grossEarning, totalDeductions);

    // 8. Create/Update Tax Record
    await Tax.upsert(
      {
        // Use upsert to create or update
        employee_tin: employee.Employee_TIN, //Corrected field name
        taxable_income: taxableIncome,
        income_tax: incomeTax,
        employer_pension_contribution: employerPensionContribution,
        employee_pension_contribution: employeePensionContribution,
      },
      {
        where: { employee_tin: employee.Employee_TIN }, //Corrected field name
      }
    );

    // 9. Create Payroll Record
    const payrollRecord = await Payroll.upsert(
      {
        employee_tin: employee.Employee_TIN,
        payroll_date: payrollDate,
        gross_earning: parseFloat(grossEarning.toFixed(3)),
        taxable_income: parseFloat(taxableIncome.toFixed(3)),
        income_tax: parseFloat(incomeTax.toFixed(3)),
        employer_pension_contribution: parseFloat(
          employerPensionContribution.toFixed(3)
        ),
        employee_pension_contribution: parseFloat(
          employeePensionContribution.toFixed(3)
        ),
        loan_deductions: parseFloat(loanDeduction.toFixed(3)),
        food_deduction: parseFloat(employee.Food_Deduction),
        penalty_deductions: parseFloat(employee.Penalty),
        net_pay: parseFloat(netPay.toFixed(3)),
        bank_account: employee.Bank_Account,
      },
      {
        where: { employee_tin: employee.Employee_TIN },
      }
    );

    res.status(200).json({
      message: "Payroll processed successfully",
      payroll: payrollRecord,
    });
  } catch (error) {
    console.error("Error processing payroll:", error);
    res
      .status(500)
      .json({ error: "Failed to process payroll", details: error.message });
  }
};

exports.fetchPayrolls = async (req, res, next) => {
  try {
    const { employee_tin } = req.query;

    const payroll = await Payroll.findAll({
      where: { employee_tin: employee_tin },
    });

    if (!payroll || payroll.length === 0) {
      return res.status(404).json({ message: "No payroll found." });
    }

    res.status(200).json({
      message: "payroll fetched successfully.",
      payrolls: payroll,
    });
  } catch (error) {
    console.error("Error fetching payroll:", error);
    res.status(500).json({
      message: "Failed to fetch payroll.",
      error: error.message,
    });
  }
};

exports.generatePayrollReport = async (req, res) => {
  try {
    const { employee_tin } = req.query; // Get the employee_tin from the query parameters (if needed)
    console.log("employee_tin == ", employee_tin);
    const payrollData = await Payroll.findAll({
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: [
            "Employee_Name",
            "Employee_TIN",
            "Basic_Salary",
            "Bank_Account",
          ], // Select employee details
        },
      ],
      order: [["employee_tin", "ASC"]], // Optional: Sort by employee TIN
    });

    // Transform the data into a format suitable for the report
    const reportData = payrollData.map((payroll) => {
      const employee = payroll.employee;
      return {
        employee_name: employee.employee_name,
        employee_tin: employee.employee_tin,
        basic_salary: employee.basic_salary,
        bank_account: employee.bank_account,
        payroll_date: payroll.payroll_date,
        gross_earning: payroll.gross_earning,
        taxable_income: payroll.taxable_income,
        income_tax: payroll.income_tax,
        employee_pension_contribution: payroll.employee_pension_contribution,
        employer_pension_contribution: payroll.employer_pension_contribution,
        loan_deductions: payroll.loan_deductions,
        food_deduction: payroll.food_deduction,
        penalty_deductions: payroll.penalty_deductions,
        net_pay: payroll.net_pay,
      };
    });

    res.status(200).json(reportData); // Send the data as JSON
  } catch (error) {
    console.error("Error generating payroll report:", error);
    res.status(500).json({
      error: "Failed to generate payroll report",
      details: error.message,
    });
  }
};