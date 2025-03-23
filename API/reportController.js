const { Employee, Payroll, OvertimeRate } = require("../models");
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

exports.fetchRates = (req,res,next) => {
  OvertimeRate.findAll()
    .then((rates) => {
      res.status(200).json({
        status: "success",
        data: rates,
      });
    })
    .catch((err) => {
      console.error("Error fetching overtime rates:", err);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch overtime rates",
      });
    });
}

exports.updateRates = (req,res,next) => {
  const { Rate_Name, Overtime_Rate } = req.body;

  if (!Rate_Name || !Overtime_Rate) {
    return res.status(400).json({
      status: "error",
      message: "Rate and rate type are required",
    });
  }
  OvertimeRate.update(
    { Overtime_Rate: Overtime_Rate },
    { where: { Rate_Name: Rate_Name } }
  )
    .then(() => {
      res.status(200).json({
        status: "success",
        message: "Overtime rate updated successfully",
      });
    })
    .catch((err) => {
      console.error("Error updating overtime rates:", err);
      res.status(500).json({
        status: "error",
        message: "Failed to update overtime rates",
      });
    });
}
