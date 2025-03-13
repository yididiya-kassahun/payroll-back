'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Employee extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Employee.init({
    Employee_TIN: DataTypes.STRING,
    Employee_Name: DataTypes.STRING,
    Basic_Salary: DataTypes.DECIMAL,
    Food_Deduction: DataTypes.DECIMAL,
    Penalty: DataTypes.DECIMAL,
    Number_of_Working_Days: DataTypes.INTEGER,
    Bank_Account: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Employee',
  });
  return Employee;
};