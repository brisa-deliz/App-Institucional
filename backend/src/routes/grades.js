const express = require('express');
const { Grade, Student, Subject } = require('../models');
const router = express.Router();

router.get('/', async (req, res) => {
  const grades = await Grade.findAll({ include: [Student, Subject] });
  res.json(grades);
});

router.post('/', async (req, res) => {
  const { studentId, subjectId, value, type, date } = req.body;
  const g = await Grade.create({ StudentId: studentId, SubjectId: subjectId, value, type, date });
  res.json(g);
});

router.put('/:id', async (req, res) => {
  const g = await Grade.findByPk(req.params.id);
  if (!g) return res.status(404).json({ error: 'Not found' });
  await g.update(req.body);
  res.json(g);
});

router.delete('/:id', async (req, res) => {
  const g = await Grade.findByPk(req.params.id);
  if (!g) return res.status(404).json({ error: 'Not found' });
  await g.destroy();
  res.json({ ok: true });
});

module.exports = router;
