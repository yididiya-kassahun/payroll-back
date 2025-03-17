"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Employee extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
       Employee.hasMany(models.Payroll, {
         foreignKey: "employee_tin",
         as: "payrolls", // This needs to match the as in your payroll controller
       });
       
       Employee.hasOne(models.Allowance, {
         // Or hasMany if one employee can have more than one allowance
         foreignKey: "employee_tin",
         as: "allowance", // This needs to match the as in your payroll controller
       });
    }
  }
  Employee.init(
    {
      Employee_TIN: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
      },
      Employee_Email: DataTypes.STRING,
      Employee_Name: DataTypes.STRING,
      Basic_Salary: DataTypes.DECIMAL,
      Food_Deduction: DataTypes.DECIMAL,
      Penalty: DataTypes.DECIMAL,
      Number_of_Working_Days: DataTypes.INTEGER,
      Bank_Account: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Employee",
    }
  );
  return Employee;
};
