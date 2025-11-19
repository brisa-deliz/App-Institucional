const { Sequelize } = require('sequelize');
const path = require('path');
const sequelize = new Sequelize(process.env.DATABASE_URL || `sqlite:${path.join(__dirname, '..', '..', 'database.sqlite')}`, {
  logging: false
});

const Student = require('./student')(sequelize);
const Subject = require('./subject')(sequelize);
const Grade = require('./grade')(sequelize);

// relations
Student.hasMany(Grade, { onDelete: 'CASCADE' });
Grade.belongsTo(Student);
Subject.hasMany(Grade, { onDelete: 'CASCADE' });
Grade.belongsTo(Subject);

module.exports = { sequelize, Student, Subject, Grade };
