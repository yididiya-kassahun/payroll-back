'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Loan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Loan.belongsTo(models.Employee, {
        foreignKey: "EmployeeTin",
        as: "employee",
      });
    }
  }
  Loan.init(
    {
      EmployeeTin: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        references: {
          model: "Employees",
          key: "EmployeeTin",
        },
      },
      Loan_Amount: DataTypes.DECIMAL,
      Loan_Deduction_Per_Month: DataTypes.DECIMAL,
      Deduction_Start_Date: DataTypes.DATE,
      Deduction_End_Date: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Loan",
    }
  );
  return Loan;
};