"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Payroll extends Model {
    static associate(models) {
      // define association here
      Payroll.belongsTo(models.Employee, {
        foreignKey: "employee_tin",
        as: "employee",
      });
    }
  }
  Payroll.init(
    {
      employee_tin: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        references: {
          model: "Employees",
          key: "employee_tin",
        },
      },
      payroll_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        primaryKey: true,
      },
      gross_earning: DataTypes.DECIMAL,
      taxable_income: DataTypes.DECIMAL,
      income_tax: DataTypes.DECIMAL,
      employer_pension_contribution: DataTypes.DECIMAL,
      employee_pension_contribution: DataTypes.DECIMAL,
      loan_deductions: DataTypes.DECIMAL,
      food_deduction: DataTypes.DECIMAL,
      penalty_deductions: DataTypes.DECIMAL,
      net_pay: DataTypes.DECIMAL,
      bank_account: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Payroll",
      tableName: "Payrolls",
      timestamps: true,
      uniqueKeys: {
        // Define a unique key constraint
        actions_unique: {
          fields: ["employee_tin", "payroll_date"],
        },
      },
    }
  );
  return Payroll;
};
