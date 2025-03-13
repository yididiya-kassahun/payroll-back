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
      // define association here
    }
  }
  Loan.init({
    EmployeeTin: DataTypes.STRING,
    Loan_Amount: DataTypes.DECIMAL,
    Loan_Deduction_Per_Month: DataTypes.DECIMAL,
    Deduction_Start_Date: DataTypes.DATE,
    Deduction_End_Date: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Loan',
  });
  return Loan;
};