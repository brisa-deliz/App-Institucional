const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Subject', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    code: { type: DataTypes.STRING, allowNull: true }
  }, { timestamps: true });
};
