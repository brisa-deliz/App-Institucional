const express = require('express');
const { Subject } = require('../models');
const router = express.Router();

router.get('/', async (req, res) => {
  const items = await Subject.findAll();
  res.json(items);
});

router.post('/', async (req, res) => {
  const s = await Subject.create(req.body);
  res.json(s);
});

router.put('/:id', async (req, res) => {
  const s = await Subject.findByPk(req.params.id);
  if (!s) return res.status(404).json({ error: 'Not found' });
  await s.update(req.body);
  res.json(s);
});

router.delete('/:id', async (req, res) => {
  const s = await Subject.findByPk(req.params.id);
  if (!s) return res.status(404).json({ error: 'Not found' });
  await s.destroy();
  res.json({ ok: true });
});

module.exports = router;
