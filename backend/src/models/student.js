const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Student', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    gradeLevel: { type: DataTypes.STRING, allowNull: true },
    extra: { type: DataTypes.JSON, allowNull: true }
  }, { timestamps: true });
};
