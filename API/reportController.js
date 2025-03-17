const { Employee, Payroll } = require("../models");
const Sequelize = require("sequelize"); 
const moment = require("moment"); 

exports.reportStat = async (req, res, next) => {
  try {
    const totalEmployees = await Employee.count();

    const startDate = moment().subtract(6, "months").startOf("month").toDate(); 
    const endDate = moment().endOf("month").toDate(); 

    // Calculating start and end of the current month
    const startOfMonth = moment().startOf("month").toDate();
    const endOfMonth = moment().endOf("month").toDate();

    const totalPayrollExpenses = await Payroll.sum("net_pay", {
      where: {
        payroll_date: {
          [Sequelize.Op.gte]: startOfMonth, 
          [Sequelize.Op.lte]: endOfMonth, 
        },
      },
    });

    const totalDeductions = await Payroll.sum("income_tax", {
      // Sum of all deduction components, this is just sample
      where: {
        payroll_date: {
          [Sequelize.Op.gte]: startOfMonth,
          [Sequelize.Op.lte]: endOfMonth,
        },
      },
    });

    const averageNetPay =
      totalEmployees > 0 && totalPayrollExpenses != null
        ? totalPayrollExpenses / totalEmployees
        : 0;

    const payrollExpensesByMonth = await Payroll.findAll({
      attributes: [
        [
          Sequelize.fn("date_trunc", "month", Sequelize.col("payroll_date")),
          "month",
        ], 
        [Sequelize.fn("sum", Sequelize.col("net_pay")), "total_expenses"],
      ],
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: [], 
        },
      ],
      where: {
        payroll_date: {
          [Sequelize.Op.gte]: startDate,
          [Sequelize.Op.lte]: endDate,
        },
      },
      group: ["month", "employee.Employee_TIN"],
      order: [["month", "ASC"]],
      raw: true, 
    });

    const payrollExpensesByEmployee = await Payroll.findAll({
      attributes: [
        [Sequelize.fn("sum", Sequelize.col("net_pay")), "net_pay"],
      ],
      include: [
        {
          model: Employee,
          as: "employee", 
          attributes: ["Employee_Name", "Employee_TIN"], 
        },
      ],
      where: {
        payroll_date: {
          [Sequelize.Op.gte]: startOfMonth,
          [Sequelize.Op.lte]: endOfMonth,
        },
      },
      group: ["Employee_TIN", "employee.Employee_Name"],
      order: [[Sequelize.literal('"Employee_Name"'), "ASC"]],
      raw: true,
    });

    res.status(200).json({
      totalEmployees,
      totalPayrollExpenses: totalPayrollExpenses || 0,
      averageNetPay: averageNetPay || 0,
      totalDeductions: totalDeductions || 0,
      payrollExpensesByMonth: payrollExpensesByMonth,
      payrollExpensesByEmployee: payrollExpensesByEmployee,
    });
  } catch (error) {
    console.error("Error fetching report stats:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch report stats", details: error.message });
  }
};
