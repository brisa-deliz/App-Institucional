const { sequelize, Student, Subject, Grade } = require('./models');

async function seed() {
  await sequelize.sync({ force: true });
  const s1 = await Student.create({ firstName: 'Ana', lastName: 'Lopez', gradeLevel: '10' });
  const s2 = await Student.create({ firstName: 'Juan', lastName: 'Perez', gradeLevel: '10' });
  const math = await Subject.create({ name: 'Matemáticas', code: 'MATH' });
  const lang = await Subject.create({ name: 'Lengua', code: 'LANG' });

  await Grade.bulkCreate([
    { value: 8.5, type: 'exam', date: '2025-10-01', StudentId: s1.id, SubjectId: math.id },
    { value: 7.0, type: 'task', date: '2025-10-05', StudentId: s1.id, SubjectId: lang.id },
    { value: 5.0, type: 'exam', date: '2025-10-01', StudentId: s2.id, SubjectId: math.id },
    { value: 6.2, type: 'task', date: '2025-10-05', StudentId: s2.id, SubjectId: lang.id }
  ]);
  console.log('Seed done');
  process.exit(0);
}

seed();
