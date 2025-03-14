'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OvertimeRate extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  OvertimeRate.init({
    Rate_Name: DataTypes.STRING,
    Overtime_Rate: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'OvertimeRate',
  });
  return OvertimeRate;
};