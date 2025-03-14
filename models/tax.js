'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tax extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Tax.belongsTo(models.Employee, {
        foreignKey: "employee_tin",
        as: "employee", // Optional alias for the association
      });
    }
  }
  Tax.init(
    {
      employee_tin: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        unique: true,
        references: {
          model: "Employees",
          key: "employee_tin",
        },
      },
      taxable_income: DataTypes.DECIMAL,
      income_tax: DataTypes.DECIMAL,
      employer_pension_contribution: DataTypes.DECIMAL,
      employee_pension_contribution: DataTypes.DECIMAL,
    },
    {
      sequelize,
      modelName: "Tax",
      timestamps: true,
    },
    {
      indexes: [
        {
          unique: true,
          fields: ["employee_tin"],
        },
      ],
    }
  );
  return Tax;
};