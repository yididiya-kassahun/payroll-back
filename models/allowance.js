"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Allowance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Allowance.belongsTo(models.Employee, {
        foreignKey: "employee_tin",
        as: "employee", // Optional alias for the association
      });
    }
  }
  Allowance.init(
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
      non_taxable_allowance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      taxable_allowance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      overtime_hours: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      sales_commission_allowance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      night_working_hours: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      sunday_working_hours: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      holiday_working_hours: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "Allowance",
      tableName: "Allowances",
      timestamps: true,
    }
  );
  return Allowance;
};
