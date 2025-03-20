const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const PDFMake = require("pdfmake");
const fs = require("fs");

// font files
const fonts = {
  Roboto: {
    normal: "fonts/Roboto-Regular.ttf",
    bold: "fonts/Roboto-Medium.ttf",
    italics: "fonts/Roboto-Italic.ttf",
    bolditalics: "fonts/Roboto-MediumItalic.ttf",
  },
};

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

const printer = new PDFMake(fonts);

const { Employee, Allowance, Tax, Payroll, Loan } = require("../models");
const {
  calculateTaxableIncome,
  calculateIncomeTax,
  calculatePensionContributions,
  calculateNetPay,
} = require("../utils/payrollCalculations");
const { where } = require("sequelize");

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

    // Calculate Gross Earnings
    let grossEarning = Number(employee.Basic_Salary);

    grossEarning += Number(allowance.taxable_allowance || 0);
    grossEarning += Number(allowance.non_taxable_allowance || 0);
    grossEarning += Number(allowance.overtime_hours || 0);
    grossEarning += Number(allowance.sales_commission_allowance || 0);
    grossEarning += Number(allowance.night_working_hours || 0);
    grossEarning += Number(allowance.sunday_working_hours || 0);
    grossEarning += Number(allowance.holiday_working_hours || 0);

    // Calculate Taxable Income
    const taxableIncome = calculateTaxableIncome(
      grossEarning,
      allowance.non_taxable_allowance || 0
    );

    // Calculate Income Tax
    const incomeTax = calculateIncomeTax(taxableIncome);

    // Calculate Pension Contributions
    const { employeePensionContribution, employerPensionContribution } =
      calculatePensionContributions(Number(employee.Basic_Salary));

    // Calculate Loan Deduction
    let loanDeduction = 0;

    const loan = await Loan.findOne({
      where: { EmployeeTin: employee_tin },
    });

    if (loan) {
      const payrollDateFormatted = new Date(payrollDate);
      const deductionStartDate = new Date(loan.Deduction_Start_Date);
      const deductionEndDate = new Date(loan.Deduction_End_Date);

      // Checking if current date lies in between the start and end date
      if (
        payrollDateFormatted >= deductionStartDate &&
        payrollDateFormatted <= deductionEndDate
      ) {
        loanDeduction = Number(loan.Loan_Deduction_Per_Month || 0);
      }
    }

    // Calculate Total Deductions
    const totalDeductions =
      Number(incomeTax) +
      Number(employeePensionContribution) +
      Number(employee.Food_Deduction || 0) +
      Number(employee.Penalty || 0) +
      Number(loanDeduction || 0);

    // Calculate Net Pay
    const netPay = calculateNetPay(grossEarning, totalDeductions);

    // Create/Update Tax Record
    await Tax.upsert(
      {
        employee_tin: employee.Employee_TIN,
        taxable_income: taxableIncome,
        income_tax: incomeTax,
        employer_pension_contribution: employerPensionContribution,
        employee_pension_contribution: employeePensionContribution,
      }
      // {
      //   where: { employee_tin: employee.Employee_TIN },
      // }
    );

    // Create Payroll Record
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
      where: [{ employee_tin: employee_tin }],
      order: [["employee_tin", "ASC"]],
    });

    const reportData = payrollData.map((payroll) => {
      const employee = payroll.employee;
      console.log("employee ", employee);
      return {
        employee_name: payroll.employee.Employee_Name,
        employee_tin: payroll.employee.Employee_TIN,
        basic_salary: payroll.employee.Basic_Salary,
        bank_account: payroll.employee.Bank_Account,
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

exports.sendEmail = async (req, res, next) => {
  const { name, email, tinNumber } = req.body;

  if (!name || !email || !tinNumber) {
    return res
      .status(400)
      .json({ error: "Name, email, and employee TIN are required" });
  }

  try {
    const payroll = await Payroll.findOne({
      where: { employee_tin: tinNumber },
      include: [
        {
          model: Employee,
          as: "employee",
        },
      ],
    });

    if (!payroll) {
      return res
        .status(404)
        .json({ error: "Payroll data not found for this employee" });
    }

    // Generating the PDF document definition
    const docDefinition = {
      content: [
        { text: "Kerchanshe Payroll Slip", style: "header" },
        {
          text: `Employee Name: ${payroll.employee.Employee_Name}`,
          style: "info",
        },
        { text: `Employee TIN: ${payroll.employee_tin}`, style: "info" },
        { text: `Payroll Date: ${payroll.payroll_date}`, style: "info" },
        { text: `Gross Earning: ${payroll.gross_earning}`, style: "info" },
        { text: `Taxable Income: ${payroll.taxable_income}`, style: "info" },
        { text: `Income Tax: ${payroll.income_tax}`, style: "info" },
        {
          text: `Employee Pension Contribution: ${payroll.employee_pension_contribution}`,
          style: "info",
        },
        {
          text: `Employer Pension Contribution: ${payroll.employer_pension_contribution}`,
          style: "info",
        },
        { text: `Loan Deductions: ${payroll.loan_deductions}`, style: "info" },
        { text: `Food Deduction: ${payroll.food_deduction}`, style: "info" },
        {
          text: `Penalty Deductions: ${payroll.penalty_deductions}`,
          style: "info",
        },
        { text: `Net Pay: ${payroll.net_pay}`, style: "netPay" },
      ],
      styles: {
        header: {
          fontSize: 22,
          bold: true,
          alignment: "center",
          marginBot: 20,
        },
        info: {
          fontSize: 14,
          marginBot: 8,
        },
        netPay: {
          fontSize: 16,
          bold: true,
          marginTop: 20,
          alignment: "right",
        },
      },
    };

    // Generate the PDF as a buffer
    const pdfDoc = printer.createPdfKitDocument(docDefinition, {});
    const pdfChunks = [];

    pdfDoc.on("data", (chunk) => {
      pdfChunks.push(chunk);
    });

    pdfDoc.on("end", async () => {
      const pdfBuffer = Buffer.concat(pdfChunks);

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
                        <p style="color: #555; font-size: 14px;">
                            If you have any questions, please reach out to the HR department.
                        </p>
                        <p style="font-size: 14px; color: #777;">Best Regards,</p>
                        <p style="font-size: 14px; color: #007bff;"><strong>HR & Payroll Team</strong></p>
                    </div>
                `,
        attachments: [
          {
            filename: "payroll_slip.pdf",
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      };

      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
          return res
            .status(500)
            .json({ error: "Email could not be sent", details: error.message });
        }
        res.status(200).json({ message: "Email sent successfully", info });
      });
    });

    pdfDoc.on("error", (err) => {
      console.error("Error generating PDF:", err);
      return res
        .status(500)
        .json({ error: "Failed to generate PDF", details: err.message });
    });
    pdfDoc.end();
  } catch (error) {
    console.error("Error generating payroll slip:", error);
    res
      .status(500)
      .json({ error: "Failed to send payroll slip", details: error.message });
  }
};
