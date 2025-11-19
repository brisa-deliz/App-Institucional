const express = require('express');
const { Student, Grade, Subject } = require('../models');
const router = express.Router();

router.get('/', async (req, res) => {
  const students = await Student.findAll({ include: { model: Grade, include: Subject } });
  res.json(students);
});

router.post('/', async (req, res) => {
  const s = await Student.create(req.body);
  res.json(s);
});

router.get('/:id', async (req, res) => {
  const s = await Student.findByPk(req.params.id, { include: { model: Grade, include: Subject } });
  if (!s) return res.status(404).json({ error: 'Not found' });
  res.json(s);
});

router.put('/:id', async (req, res) => {
  const s = await Student.findByPk(req.params.id);
  if (!s) return res.status(404).json({ error: 'Not found' });
  await s.update(req.body);
  res.json(s);
});

router.delete('/:id', async (req, res) => {
  const s = await Student.findByPk(req.params.id);
  if (!s) return res.status(404).json({ error: 'Not found' });
  await s.destroy();
  res.json({ ok: true });
});

module.exports = router;
