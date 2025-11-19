const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Grade', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    value: { type: DataTypes.FLOAT, allowNull: false },
    type: { type: DataTypes.STRING, allowNull: true }, // exam, task, project...
    date: { type: DataTypes.DATEONLY, allowNull: true }
  }, { timestamps: true });
};
