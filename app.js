// app.js
// Aplicación monolítica: Express + SQLite (better-sqlite3) + Frontend embebido con Chart.js
// Ejecutar: npm install && node app.js
const express = require('express');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const DB_FILE = path.join(__dirname, 'data.db');
const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Inicializar BD si no existe
const db = new Database(DB_FILE);
function initDb() {
  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      identifier TEXT,
      grade_level TEXT,
      extra JSON,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS grades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      subject_id INTEGER NOT NULL,
      score REAL NOT NULL,
      max_score REAL DEFAULT 100,
      date_taken DATE DEFAULT CURRENT_DATE,
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_grades_student ON grades(student_id);
    CREATE INDEX IF NOT EXISTS idx_grades_subject ON grades(subject_id);
  `);
}
initDb();

/* -------------------------
   API: STUDENTS
   ------------------------- */
app.get('/api/students', (req, res) => {
  const rows = db.prepare('SELECT * FROM students ORDER BY id DESC').all();
  res.json(rows);
});

app.get('/api/students/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Estudiante no encontrado' });
  res.json(row);
});

app.post('/api/students', (req, res) => {
  const { first_name, last_name, identifier, grade_level, extra } = req.body;
  if (!first_name || !last_name) return res.status(400).json({ error: 'Faltan nombres' });
  const stmt = db.prepare('INSERT INTO students (first_name, last_name, identifier, grade_level, extra) VALUES (?, ?, ?, ?, ?)');
  const info = stmt.run(first_name, last_name, identifier || null, grade_level || null, extra ? JSON.stringify(extra) : null);
  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(info.lastInsertRowid);
  res.json(student);
});

app.put('/api/students/:id', (req, res) => {
  const id = req.params.id;
  const { first_name, last_name, identifier, grade_level, extra } = req.body;
  const stmt = db.prepare('UPDATE students SET first_name = ?, last_name = ?, identifier = ?, grade_level = ?, extra = ? WHERE id = ?');
  stmt.run(first_name, last_name, identifier || null, grade_level || null, extra ? JSON.stringify(extra) : null, id);
  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
  res.json(student);
});

app.delete('/api/students/:id', (req, res) => {
  const stmt = db.prepare('DELETE FROM students WHERE id = ?');
  const info = stmt.run(req.params.id);
  res.json({ deleted: info.changes });
});

/* -------------------------
   API: SUBJECTS
   ------------------------- */
app.get('/api/subjects', (req, res) => {
  const rows = db.prepare('SELECT * FROM subjects ORDER BY name').all();
  res.json(rows);
});

app.post('/api/subjects', (req, res) => {
  const { name, code } = req.body;
  if (!name) return res.status(400).json({ error: 'Nombre requerido' });
  try {
    const info = db.prepare('INSERT INTO subjects (name, code) VALUES (?, ?)').run(name, code || null);
    const subject = db.prepare('SELECT * FROM subjects WHERE id = ?').get(info.lastInsertRowid);
    res.json(subject);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.delete('/api/subjects/:id', (req, res) => {
  const info = db.prepare('DELETE FROM subjects WHERE id = ?').run(req.params.id);
  res.json({ deleted: info.changes });
});

/* -------------------------
   API: GRADES
   ------------------------- */
app.get('/api/grades', (req, res) => {
  // optional filters: student_id, subject_id
  const student_id = req.query.student_id;
  const subject_id = req.query.subject_id;
  let q = `SELECT g.*, s.first_name, s.last_name, sub.name as subject_name
           FROM grades g
           JOIN students s ON s.id = g.student_id
           JOIN subjects sub ON sub.id = g.subject_id`;
  const where = [];
  const params = [];
  if (student_id) { where.push('g.student_id = ?'); params.push(student_id); }
  if (subject_id) { where.push('g.subject_id = ?'); params.push(subject_id); }
  if (where.length) q += ' WHERE ' + where.join(' AND ');
  q += ' ORDER BY g.date_taken DESC';
  const rows = db.prepare(q).all(...params);
  res.json(rows);
});

app.post('/api/grades', (req, res) => {
  const { student_id, subject_id, score, max_score, date_taken, note } = req.body;
  if (!student_id || !subject_id || (score === undefined)) return res.status(400).json({ error: 'Faltan campos' });
  const stmt = db.prepare('INSERT INTO grades (student_id, subject_id, score, max_score, date_taken, note) VALUES (?, ?, ?, ?, ?, ?)');
  const info = stmt.run(student_id, subject_id, score, max_score || 100, date_taken || null, note || null);
  const grade = db.prepare('SELECT g.*, s.first_name, s.last_name, sub.name as subject_name FROM grades g JOIN students s ON s.id=g.student_id JOIN subjects sub ON sub.id=g.subject_id WHERE g.id = ?').get(info.lastInsertRowid);
  res.json(grade);
});

app.put('/api/grades/:id', (req, res) => {
  const id = req.params.id;
  const { score, max_score, date_taken, note } = req.body;
  db.prepare('UPDATE grades SET score = ?, max_score = ?, date_taken = ?, note = ? WHERE id = ?').run(score, max_score || 100, date_taken || null, note || null, id);
  const grade = db.prepare('SELECT * FROM grades WHERE id = ?').get(id);
  res.json(grade);
});

app.delete('/api/grades/:id', (req, res) => {
  const info = db.prepare('DELETE FROM grades WHERE id = ?').run(req.params.id);
  res.json({ deleted: info.changes });
});

/* -------------------------
   API: ANALYSIS / RECOMMENDATIONS
   - calcula promedios por estudiante por materia
   - detecta estudiantes en riesgo (promedio < threshold)
   - sugiere materias a reforzar
   ------------------------- */
app.get('/api/analysis/summary', (req, res) => {
  // parámetros opcionales: threshold (porcentaje), last_n_days
  const threshold = parseFloat(req.query.threshold || '60'); // percent
  const students = db.prepare('SELECT * FROM students').all();
  const subjects = db.prepare('SELECT * FROM subjects').all();

  // preparar promedios
  const getAvgStmt = db.prepare(`
    SELECT subject_id, AVG( (score*1.0)/max_score * 100 ) as percent_avg
    FROM grades
    WHERE student_id = ?
    GROUP BY subject_id
  `);

  const studentSummaries = students.map(s => {
    const avgs = getAvgStmt.all(s.id);
    const avgBySubject = avgs.map(a => {
      const sub = subjects.find(x => x.id === a.subject_id);
      return {
        subject_id: a.subject_id,
        subject_name: sub ? sub.name : 'Desconocida',
        percent_avg: Math.round(a.percent_avg * 100) / 100
      };
    });
    // promedio general (ponderado simple)
    const generalAvg = avgBySubject.length ? Math.round((avgBySubject.reduce((acc, cur) => acc + cur.percent_avg, 0) / avgBySubject.length) * 100) / 100 : null;
    // materias por debajo del threshold
    const needsImprovement = avgBySubject.filter(x => x.percent_avg < threshold);
    const isAtRisk = (generalAvg !== null && generalAvg < threshold);

    return {
      student: s,
      generalAvg,
      avgBySubject,
      needsImprovement,
      isAtRisk
    };
  });

  // materias con mayor reprobación general (porcentaje promedio bajo)
  const subjectsAvg = subjects.map(sub => {
    const r = db.prepare('SELECT AVG( (score*1.0)/max_score * 100 ) as percent_avg FROM grades WHERE subject_id = ?').get(sub.id);
    return {
      subject: sub,
      percent_avg: r && r.percent_avg ? Math.round(r.percent_avg * 100) / 100 : null
    };
  });

  res.json({
    threshold,
    studentSummaries,
    subjectsAvg
  });
});

/* -------------------------
   FRONTEND: Página única (SPA simple)
   ------------------------- */
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Seguimiento Académico - Demo</title>
<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100 text-gray-800">
  <div class="max-w-6xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-4">Sistema de Seguimiento Académico (Demo)</h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="col-span-1 bg-white p-4 rounded shadow">
        <h2 class="font-semibold">Agregar Estudiante</h2>
        <form id="form-student" class="space-y-2 mt-2">
          <input placeholder="Nombre" id="s_first" class="w-full p-2 border rounded" required/>
          <input placeholder="Apellido" id="s_last" class="w-full p-2 border rounded" required/>
          <input placeholder="Identificador (opcional)" id="s_identifier" class="w-full p-2 border rounded" />
          <input placeholder="Nivel / Curso" id="s_grade" class="w-full p-2 border rounded" />
          <div class="flex gap-2">
            <button type="submit" class="bg-blue-600 text-white px-3 py-1 rounded">Agregar</button>
            <button type="button" id="btn-refresh" class="bg-gray-200 px-3 py-1 rounded">Refrescar</button>
          </div>
        </form>
        <hr class="my-3"/>
        <h2 class="font-semibold">Agregar Materia</h2>
        <form id="form-subject" class="space-y-2 mt-2">
          <input placeholder="Nombre de la materia" id="sub_name" class="w-full p-2 border rounded" required/>
          <input placeholder="Código (opcional)" id="sub_code" class="w-full p-2 border rounded" />
          <button type="submit" class="bg-green-600 text-white px-3 py-1 rounded">Agregar Materia</button>
        </form>
      </div>

      <div class="col-span-1 md:col-span-2 bg-white p-4 rounded shadow">
        <h2 class="font-semibold">Registrar Nota</h2>
        <form id="form-grade" class="grid grid-cols-1 md:grid-cols-4 gap-2 mt-2">
          <select id="g_student" class="p-2 border rounded"></select>
          <select id="g_subject" class="p-2 border rounded"></select>
          <input id="g_score" placeholder="Puntaje (ej: 85)" class="p-2 border rounded" />
          <input id="g_max" placeholder="Max score (default 100)" class="p-2 border rounded" />
          <input id="g_date" placeholder="Fecha (YYYY-MM-DD opcional)" class="p-2 border rounded col-span-2" />
          <input id="g_note" placeholder="Nota (opcional)" class="p-2 border rounded col-span-2" />
          <div class="col-span-4">
            <button type="submit" class="bg-indigo-600 text-white px-3 py-1 rounded">Guardar Nota</button>
          </div>
        </form>

        <hr class="my-3"/>
        <div class="flex gap-2">
          <button id="btn-list-students" class="bg-gray-200 px-3 py-1 rounded">Listar Estudiantes</button>
          <button id="btn-list-subjects" class="bg-gray-200 px-3 py-1 rounded">Listar Materias</button>
          <button id="btn-list-grades" class="bg-gray-200 px-3 py-1 rounded">Listar Notas</button>
          <button id="btn-analysis" class="bg-yellow-500 px-3 py-1 rounded text-white">Análisis</button>
        </div>

        <div id="main-output" class="mt-4"></div>
      </div>
    </div>

    <div class="mt-6 bg-white p-4 rounded shadow">
      <h2 class="font-semibold">Gráficas de Rendimiento</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
        <canvas id="chart-average" class="bg-white p-2 rounded"></canvas>
        <canvas id="chart-subjects" class="bg-white p-2 rounded"></canvas>
      </div>
    </div>

    <footer class="mt-6 text-sm text-gray-600">
      Demo para prototipo. Puedes extender esto para agregar autenticación, export de PDF, y ML.
    </footer>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script>
    // Utilidades fetch
    async function api(path, method='GET', body=null) {
      const opts = { method, headers: {} };
      if (body) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
      const res = await fetch('/api' + path, opts);
      if (!res.ok) {
        const txt = await res.text();
        throw new Error('API error: ' + res.status + ' - ' + txt);
      }
      return res.json();
    }

    // DOM referencias
    const sFirst = document.getElementById('s_first');
    const sLast = document.getElementById('s_last');
    const sIdentifier = document.getElementById('s_identifier');
    const sGrade = document.getElementById('s_grade');
    const formStudent = document.getElementById('form-student');
    const formSubject = document.getElementById('form-subject');
    const subName = document.getElementById('sub_name');
    const subCode = document.getElementById('sub_code');
    const btnRefresh = document.getElementById('btn-refresh');
    const gStudent = document.getElementById('g_student');
    const gSubject = document.getElementById('g_subject');
    const gScore = document.getElementById('g_score');
    const gMax = document.getElementById('g_max');
    const gDate = document.getElementById('g_date');
    const gNote = document.getElementById('g_note');
    const formGrade = document.getElementById('form-grade');
    const mainOutput = document.getElementById('main-output');

    let studentsCache = [];
    let subjectsCache = [];

    async function refreshLists() {
      studentsCache = await api('/students');
      subjectsCache = await api('/subjects');
      // llenar selects
      gStudent.innerHTML = '<option value="">Selecciona estudiante</option>';
      studentsCache.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = s.first_name + ' ' + s.last_name + (s.identifier ? ' ('+s.identifier+')' : '');
        gStudent.appendChild(opt);
      });
      gSubject.innerHTML = '<option value="">Selecciona materia</option>';
      subjectsCache.forEach(sub => {
        const opt = document.createElement('option');
        opt.value = sub.id;
        opt.textContent = sub.name + (sub.code ? ' - ' + sub.code : '');
        gSubject.appendChild(opt);
      });
    }

    formStudent.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      try {
        await api('/students', 'POST', {
          first_name: sFirst.value.trim(),
          last_name: sLast.value.trim(),
          identifier: sIdentifier.value.trim(),
          grade_level: sGrade.value.trim()
        });
        sFirst.value=''; sLast.value=''; sIdentifier.value=''; sGrade.value='';
        await refreshLists();
        alert('Estudiante agregado');
      } catch (e) { alert(e.message) }
    });

    formSubject.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      try {
        await api('/subjects', 'POST', { name: subName.value.trim(), code: subCode.value.trim() });
        subName.value=''; subCode.value='';
        await refreshLists();
        alert('Materia agregada');
      } catch (e) { alert(e.message) }
    });

    formGrade.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      try {
        const body = {
          student_id: parseInt(gStudent.value),
          subject_id: parseInt(gSubject.value),
          score: parseFloat(gScore.value),
          max_score: gMax.value ? parseFloat(gMax.value) : 100,
          date_taken: gDate.value || null,
          note: gNote.value || null
        };
        await api('/grades', 'POST', body);
        gScore.value=''; gMax.value=''; gDate.value=''; gNote.value='';
        alert('Nota registrada');
        await drawCharts();
      } catch (e) { alert(e.message) }
    });

    document.getElementById('btn-list-students').addEventListener('click', async () => {
      const students = await api('/students');
      mainOutput.innerHTML = renderStudentList(students);
    });

    document.getElementById('btn-list-subjects').addEventListener('click', async () => {
      const subjects = await api('/subjects');
      mainOutput.innerHTML = renderSubjectList(subjects);
    });

    document.getElementById('btn-list-grades').addEventListener('click', async () => {
      const grades = await api('/grades');
      mainOutput.innerHTML = renderGradesTable(grades);
    });

    document.getElementById('btn-analysis').addEventListener('click', async () => {
      const analysis = await api('/analysis/summary?threshold=60');
      mainOutput.innerHTML = renderAnalysis(analysis);
      await drawCharts();
    });

    btnRefresh.addEventListener('click', refreshLists);

    function renderStudentList(list) {
      if (!list.length) return '<p>No hay estudiantes.</p>';
      let html = '<table class="min-w-full"><thead><tr><th>Id</th><th>Nombre</th><th>Nivel</th><th>Identificador</th></tr></thead><tbody>';
      list.forEach(s => {
        html += \`<tr class="border-t"><td class="px-2 py-1">\${s.id}</td><td class="px-2 py-1">\${s.first_name} \${s.last_name}</td><td class="px-2 py-1">\${s.grade_level||''}</td><td class="px-2 py-1">\${s.identifier||''}</td></tr>\`;
      });
      html += '</tbody></table>';
      return html;
    }

    function renderSubjectList(list) {
      if (!list.length) return '<p>No hay materias.</p>';
      let html = '<ul>';
      list.forEach(s => html += '<li class="py-1 border-b">'+s.name+' '+(s.code?('('+s.code+')'):'')+'</li>');
      html += '</ul>';
      return html;
    }

    function renderGradesTable(list) {
      if (!list.length) return '<p>No hay notas registradas.</p>';
      let html = '<table class="min-w-full"><thead><tr><th>Alumno</th><th>Materia</th><th>Puntaje</th><th>Fecha</th><th>Nota</th></tr></thead><tbody>';
      list.forEach(g => {
        html += '<tr class="border-t"><td class="px-2 py-1">'+g.first_name+' '+g.last_name+'</td><td class="px-2 py-1">'+g.subject_name+'</td><td class="px-2 py-1">'+g.score+'/'+g.max_score+'</td><td class="px-2 py-1">'+(g.date_taken||'')+'</td><td class="px-2 py-1">'+(g.note||'')+'</td></tr>';
      });
      html += '</tbody></table>';
      return html;
    }

    function renderAnalysis(a) {
      let html = '<h3 class="font-semibold">Resumen de análisis</h3>';
      html += '<p>Umbral (threshold): ' + a.threshold + '%</p>';
      html += '<h4 class="mt-2 font-semibold">Materias (promedio general)</h4><ul>';
      a.subjectsAvg.forEach(s => {
        html += '<li>' + (s.subject ? s.subject.name : '---') + ': ' + (s.percent_avg===null ? 'sin datos' : s.percent_avg+'%') + '</li>';
      });
      html += '</ul>';
      html += '<h4 class="mt-2 font-semibold">Estudiantes</h4>';
      a.studentSummaries.forEach(st => {
        html += '<div class="border p-2 my-2 rounded">';
        html += '<b>' + st.student.first_name + ' ' + st.student.last_name + '</b> - Promedio general: ' + (st.generalAvg === null ? 'sin datos' : st.generalAvg + '%');
        if (st.isAtRisk) html += ' <span class="text-red-600 font-semibold">EN RIESGO</span>';
        if (st.needsImprovement && st.needsImprovement.length) {
          html += '<div>Materias a reforzar:<ul>';
          st.needsImprovement.forEach(m => html += '<li>' + m.subject_name + ' (' + m.percent_avg + '%)</li>');
          html += '</ul></div>';
        }
        html += '</div>';
      });
      return html;
    }

    // Charts
    let chartAvg = null;
    let chartSubjects = null;
    async function drawCharts() {
      // chart promedio por estudiante (last averages)
      const analysis = await api('/analysis/summary?threshold=60');
      const studs = analysis.studentSummaries.filter(s => s.generalAvg !== null);
      const labels = studs.map(s => s.student.first_name + ' ' + s.student.last_name);
      const data = studs.map(s => s.generalAvg);
      const ctx1 = document.getElementById('chart-average').getContext('2d');
      if (chartAvg) chartAvg.destroy();
      chartAvg = new Chart(ctx1, {
        type: 'bar',
        data: { labels, datasets: [{ label: 'Promedio general (%)', data }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100 } } }
      });

      // chart subjects: promedio por materia
      const subLabels = analysis.subjectsAvg.map(s => s.subject.name);
      const subData = analysis.subjectsAvg.map(s => s.percent_avg || 0);
      const ctx2 = document.getElementById('chart-subjects').getContext('2d');
      if (chartSubjects) chartSubjects.destroy();
      chartSubjects = new Chart(ctx2, {
        type: 'radar',
        data: { labels: subLabels, datasets: [{ label: 'Promedio materia (%)', data: subData }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { r: { suggestedMin: 0, suggestedMax: 100 } } }
      });
    }

    // Inicializar
    (async function init() {
      await refreshLists();
      await drawCharts();
    })();

  </script>
</body>
</html>`);
});

/* -------------------------
   Server start
   ------------------------- */
app.listen(PORT, () => {
  console.log('Servidor iniciado en http://localhost:' + PORT);
  console.log('Base de datos en: ' + DB_FILE);
});
