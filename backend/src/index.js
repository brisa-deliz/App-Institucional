require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const studentsRouter = require('./routes/students');
const subjectsRouter = require('./routes/subjects');
const gradesRouter = require('./routes/grades');
const analysisProxy = require('./routes/analysis-proxy');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/students', studentsRouter);
app.use('/api/subjects', subjectsRouter);
app.use('/api/grades', gradesRouter);
app.use('/api/analysis', analysisProxy);

// sync db and start
const PORT = process.env.PORT || 4000;
sequelize.sync().then(() => {
  console.log('DB synced');
  app.listen(PORT, () => console.log(`Backend running on ${PORT}`));
}).catch(err => console.error(err));
