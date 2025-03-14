'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Payroll extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
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
        primaryKey: true,
        references: {
          model: "Employees",
          key: "employee_tin",
        },
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
      timestamps:true
    }
  );
  return Payroll;
};