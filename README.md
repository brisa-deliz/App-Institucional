# 📁 education-performance-app/

```
education-performance-app/
├── .gitignore
├── README.md
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   ├── studentController.js
│   │   │   └── subjectController.js
│   │   ├── models/
│   │   │   ├── Student.js
│   │   │   └── Subject.js
│   │   ├── routes/
│   │   │   ├── studentRoutes.js
│   │   │   └── subjectRoutes.js
│   │   └── utils/
│   │       └── analysis.js
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── StudentForm.jsx
│   │   │   ├── SubjectForm.jsx
│   │   │   └── PerformanceChart.jsx
│   │   └── services/
│   │       ├── studentService.js
│   │       └── subjectService.js
└── database/
    └── schema.sql
```

---
# 🧩 .gitignore
```
node_modules/
.env
dist/
```

---
# 🧩 README.md
```
# Education Performance App
Sistema para instituciones educativas que permite gestionar estudiantes, materias y generar análisis inteligente del rendimiento académico.

## Tecnologías
- Frontend: React + TailwindCSS
- Backend: Node.js + Express
- Base de datos: PostgreSQL
```

---
# 🧩 backend/package.json
```
{
  "name": "education-backend",
  "version": "1.0.0",
  "main": "server.js",
  "type": "module",
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "pg": "^8.11.1"
  }
}
```

---
# 🧩 backend/server.js
```
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import studentRoutes from './src/routes/studentRoutes.js'
import subjectRoutes from './src/routes/subjectRoutes.js'

dotenv.config()
const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/students', studentRoutes)
app.use('/api/subjects', subjectRoutes)

app.listen(4000, () => console.log('Backend running on port 4000'))
```

---
# 🧩 backend/src/config/db.js
```
import pkg from 'pg'
const { Pool } = pkg

export const db = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: 5432
})
```

---
# 🧩 backend/src/models/Student.js
```
export const Student = {
  create: async (data, db) => {
    const query = `INSERT INTO students (name, age, course) VALUES ($1,$2,$3) RETURNING *`
    const values = [data.name, data.age, data.course]
    return db.query(query, values)
  },
  getAll: (db) => db.query('SELECT * FROM students'),
  getById: (id, db) => db.query('SELECT * FROM students WHERE id=$1', [id])
}
```

---
# 🧩 backend/src/models/Subject.js
```
export const Subject = {
  create: async (data, db) => {
    const query = `INSERT INTO subjects (student_id, name, grade) VALUES ($1,$2,$3) RETURNING *`
    return db.query(query, [data.student_id, data.name, data.grade])
  },
  getByStudent: (id, db) => db.query('SELECT * FROM subjects WHERE student_id=$1', [id])
}
```

---
# 🧩 backend/src/utils/analysis.js
```
export function analyzePerformance(subjects) {
  const avg = subjects.reduce((a, b) => a + b.grade, 0) / subjects.length

  const weaknesses = subjects.filter(s => s.grade < 7).map(s => s.name)

  return {
    average: avg,
    weaknesses,
    recommendation: weaknesses.length
      ? `Debe reforzar: ${weaknesses.join(', ')}`
      : 'Buen rendimiento general'
  }
}
```

---
# 🧩 backend/src/controllers/studentController.js
```
import { db } from '../config/db.js'
import { Student } from '../models/Student.js'
import { Subject } from '../models/Subject.js'
import { analyzePerformance } from '../utils/analysis.js'

export const createStudent = async (req, res) => {
  const result = await Student.create(req.body, db)
  res.json(result.rows[0])
}

export const getStudentReport = async (req, res) => {
  const studentId = req.params.id
  const student = await Student.getById(studentId, db)
  const subjects = await Subject.getByStudent(studentId, db)

  const analysis = analyzePerformance(subjects.rows)

  res.json({ student: student.rows[0], subjects: subjects.rows, analysis })
}
```

---
# 🧩 backend/src/controllers/subjectController.js
```
import { Subject } from '../models/Subject.js'
import { db } from '../config/db.js'

export const addSubject = async (req, res) => {
  const result = await Subject.create(req.body, db)
  res.json(result.rows[0])
}
```

---
# 🧩 backend/src/routes/studentRoutes.js
```
import express from 'express'
import { createStudent, getStudentReport } from '../controllers/studentController.js'

const router = express.Router()
router.post('/', createStudent)
router.get('/:id/report', getStudentReport)

export default router
```

---
# 🧩 backend/src/routes/subjectRoutes.js
```
import express from 'express'
import { addSubject } from '../controllers/subjectController.js'

const router = express.Router()
router.post('/', addSubject)

export default router
```

---
# 🧩 database/schema.sql
```
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  age INT,
  course VARCHAR(50)
);

CREATE TABLE subjects (
  id SERIAL PRIMARY KEY,
  student_id INT REFERENCES students(id),
  name VARCHAR(100),
  grade FLOAT
);
```

---
# 🧩 frontend/package.json
```
{
  "name": "education-frontend",
  "version": "1.0.0",
  "dependencies": {
    "axios": "^1.4.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

---
# 🧩 frontend/src/App.jsx
```
import Dashboard from './components/Dashboard'
export default function App() {
  return <Dashboard />
}
```

---
# 🧩 frontend/src/components/Dashboard.jsx
```
import { useState } from 'react'
import StudentForm from './StudentForm'
import SubjectForm from './SubjectForm'
import PerformanceChart from './PerformanceChart'
import axios from 'axios'

export default function Dashboard() {
  const [report, setReport] = useState(null)

  const fetchReport = async (id) => {
    const res = await axios.get(`http://localhost:4000/api/students/${id}/report`)
    setReport(res.data)
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">Panel Académico</h1>
      <StudentForm onSelect={fetchReport} />
      <SubjectForm />
      {report && (
        <PerformanceChart data={report} />
      )}
    </div>
  )
}
```

---
# 🧩 frontend/src/components/PerformanceChart.jsx
```
import { Bar } from 'react-chartjs-2'

export default function PerformanceChart({ data }) {
  const subjects = data.subjects.map(s => s.name)
  const grades = data.subjects.map(s => s.grade)

  return (
    <Bar
      data={{ labels: subjects, datasets: [{ label: 'Notas', data: grades }] }}
    />
  )
}
```
