import React, { useEffect, useState } from 'react';
import { api } from '../api';
import Charts from './Charts';

export default function Dashboard() {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const s = await api.get('/students');
    const sub = await api.get('/subjects');
    setStudents(s.data);
    setSubjects(sub.data);
  }

  const summary = {
    totalStudents: students.length,
    avgPerSubject: subjects.map(subject => {
      // compute average of subject across students
      let all = [];
      students.forEach(st => {
        st.Grades?.forEach(g => { if (g.Subject?.name === subject.name) all.push(g.value) });
      });
      const avg = all.length ? (all.reduce((a,b)=>a+b,0)/all.length).toFixed(2) : '—';
      return { subject: subject.name, avg };
    })
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">Resumen rápido</h2>
          <p className="text-sm text-gray-600">Total estudiantes: {summary.totalStudents}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3 border rounded">
          <h3 className="font-medium mb-2">Promedios por materia</h3>
          <ul>
            {summary.avgPerSubject.map(a => (
              <li key={a.subject} className="flex justify-between">
                <span>{a.subject}</span><strong>{a.avg}</strong>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-3 border rounded">
          <h3 className="font-medium mb-2">Gráfica — ejemplo</h3>
          <Charts students={students} subjects={subjects} />
        </div>
      </div>
    </div>
  );
}
