const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

// NodeMailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: true,
  auth: {
    user: "yididiya.tech@gmail.com",
    pass: "cxjx hwvz axuh uvqq",
  },
});

const { Employee, Allowance, Tax, Payroll, Loan } = require("../models"); 
const {
  calculateTaxableIncome,
  calculateIncomeTax,
  calculatePensionContributions,
  calculateNetPay,
} = require("../utils/payrollCalculations");

exports.processPayroll = async (req, res) => {
  try {
    const { employee_tin } = req.body; 
    const payrollDate = new Date(); 

    // 1. Fetch Employee Data
    const employee = await Employee.findByPk(employee_tin, {
      include: [{ model: Allowance, as: "allowance" }], 
    });

    console.log("employee allowance == ", employee);

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    if (!employee.allowance) {
      return res.status(404).json({ error: "Allowance not found" });
    }

    const allowance = employee.allowance;

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
      calculatePensionContributions(Number(employee.Basic_Salary)); 

    // 6. Calculate Loan Deduction
    let loanDeduction = 0; 

    // Fetch loan information using the EmployeeTin foreign key from the Loan Model
    const loan = await Loan.findOne({
      where: { EmployeeTin: employee_tin }, 
    });

    if (loan) {
      // Only proceed if a loan exists
      const payrollDateFormatted = new Date(payrollDate);
      const deductionStartDate = new Date(loan.Deduction_Start_Date);
      const deductionEndDate = new Date(loan.Deduction_End_Date);

      //Checking if current date lies in between the start and end date
      if (
        payrollDateFormatted >= deductionStartDate &&
        payrollDateFormatted <= deductionEndDate
      ) {
        loanDeduction = Number(loan.Loan_Deduction_Per_Month || 0); 
      }
    }

    // 6. Calculate Total Deductions
    const totalDeductions =
      Number(incomeTax) + 
      Number(employeePensionContribution) +
      Number(employee.Food_Deduction || 0) + 
      Number(employee.Penalty || 0) + 
      Number(loanDeduction || 0);

    // 7. Calculate Net Pay
    const netPay = calculateNetPay(grossEarning, totalDeductions);

    // 8. Create/Update Tax Record
    await Tax.upsert(
      {
        employee_tin: employee.Employee_TIN, 
        taxable_income: taxableIncome,
        income_tax: incomeTax,
        employer_pension_contribution: employerPensionContribution,
        employee_pension_contribution: employeePensionContribution,
      },
      // {
      //   where: { employee_tin: employee.Employee_TIN }, 
      // }
    );

    // 9. Create Payroll Record
    const existingPayroll = await Payroll.findOne({
      where: { employee_tin: employee.Employee_TIN },
    });

    if (existingPayroll) {
      await existingPayroll.update({
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
      });
    } else {
      await Payroll.create({
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
      });
    }


    res.status(200).json({
      message: "Payroll processed successfully",
      // payroll: payrollRecord,
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
    const { employee_tin } = req.query;
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
          ],
        },
      ],
      order: [["employee_tin", "ASC"]],
    });

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

    res.status(200).json(reportData);
  } catch (error) {
    console.error("Error generating payroll report:", error);
    res.status(500).json({
      error: "Failed to generate payroll report",
      details: error.message,
    });
  }
};

exports.sendEmail = (req, res, next) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Customer email is required" });
  }

  const mailOptions = {
    from: "tinycoder2@gmail.com",
    to: email,
    subject: "Kerchanshe Employee Payroll Slip",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9;">
        <div style="text-align: center; padding-bottom: 10px;">
          <h2 style="color: #007bff; margin: 0;">Kerchanshe Payroll Notification</h2>
          <hr style="border: 0; height: 1px; background: #ddd; margin: 10px 0;">
        </div>

        <p style="color: #333; font-size: 16px;">Dear <strong>${name}</strong>,</p>

        <p style="color: #555; font-size: 14px;">
          We are pleased to inform you that your payroll slip is now available. Please find the details of your payroll slip in the attachment.
        </p>

        <div style="margin: 20px 0; padding: 15px; background: #e8f4fd; border-radius: 6px;">
          <p style="margin: 0; font-size: 14px; color: #007bff;"><strong>🗓 Payroll Date:</strong> [Insert Date Here]</p>
          <p style="margin: 0; font-size: 14px; color: #007bff;"><strong>💰 Net Pay:</strong> [Insert Amount Here]</p>
        </div>

        <p style="color: #555; font-size: 14px;">
          If you have any questions, please reach out to the HR department.
        </p>

        <p style="font-size: 14px; color: #777;">Best Regards,</p>
        <p style="font-size: 14px; color: #007bff;"><strong>HR & Payroll Team</strong></p>
      </div>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      return res.status(500).json({ error: "Email could not be sent" });
    }
    res.status(200).json({ message: "Email sent successfully", info });
  });
};
