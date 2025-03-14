// backend/controllers/payrollController.js
const { Employee, Allowance, Tax, Payroll } = require("../models"); // Import your Sequelize models
const {
  calculateTaxableIncome,
  calculateIncomeTax,
  calculatePensionContributions,
  calculateNetPay,
} = require("../utils/payrollCalculations"); // Create this file

exports.processPayroll = async (req, res) => {
  try {
    const { employee_tin } = req.body; // Or get the TIN from the request parameters, depending on your route
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

    // 6. Calculate Total Deductions
    const totalDeductions =
      Number(incomeTax) + // Ensure incomeTax is a number
      Number(employeePensionContribution) + // Ensure employeePensionContribution is a number
      Number(employee.Food_Deduction || 0) + //Corrected field name and conversion
      Number(employee.Penalty || 0) + //Corrected field name and conversion
      Number(employee.loan_deduction_per_month || 0);

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
    const payrollRecord = await Payroll.create({
      employee_tin: employee.Employee_TIN, //Corrected field name
      gross_earning: grossEarning,
      taxable_income: taxableIncome,
      income_tax: incomeTax,
      employer_pension_contribution: employerPensionContribution,
      employee_pension_contribution: employeePensionContribution,
      loan_deductions: employee.loan_deduction_per_month || 0,
      food_deduction: employee.Food_Deduction || 0, //Corrected field name
      penalty_deductions: employee.Penalty || 0, //Corrected field name
      net_pay: netPay,
      bank_account: employee.Bank_Account, //Corrected field name
    });

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

    const payroll = await Payroll.findOne({
      where: { employee_tin: employee_tin },
    });

    if (!payroll || payroll.length === 0) {
      return res.status(404).json({ message: "No payroll found." });
    }

    res.status(200).json({
      message: "payroll fetched successfully.",
      payroll: payroll,
    });
  } catch (error) {
    console.error("Error fetching payroll:", error);
    res.status(500).json({
      message: "Failed to fetch payroll.",
      error: error.message,
    });
  }
};
