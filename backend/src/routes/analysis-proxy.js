const express = require('express');
const axios = require('axios');
const { Student, Grade, Subject } = require('../models');
const router = express.Router();
const ANALYSIS_URL = process.env.ANALYSIS_SERVICE_URL || 'http://localhost:5000/analyze';

router.get('/:studentId', async (req, res) => {
  const student = await Student.findByPk(req.params.studentId, { include: { model: Grade, include: Subject } });
  if (!student) return res.status(404).json({ error: 'Student not found' });
  // Transform data to send to analysis service
  const payload = {
    studentId: student.id,
    name: `${student.firstName} ${student.lastName}`,
    grades: student.Grades.map(g => ({ subject: g.Subject.name, value: g.value, type: g.type, date: g.date }))
  };
  try {
    const resp = await axios.post(ANALYSIS_URL, payload);
    res.json(resp.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Analysis service error', details: err.message });
  }
});

module.exports = router;
