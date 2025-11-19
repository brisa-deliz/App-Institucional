import React, { useEffect, useState } from 'react';
import { api } from '../api';
import StudentForm from './StudentForm';

export default function StudentList(){
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);

  async function load(){
    const res = await api.get('/students');
    setStudents(res.data);
  }

  useEffect(()=>{ load(); }, []);

  return (
    <div>
      <h3 className="font-semibold mb-2">Estudiantes</h3>
      <StudentForm onSaved={load} />
      <ul className="mt-3 divide-y">
        {students.map(s=>(
          <li key={s.id} className="py-2 flex justify-between items-center">
            <div>
              <div className="font-medium">{s.firstName} {s.lastName}</div>
              <div className="text-xs text-gray-500">Curso: {s.gradeLevel || '—'}</div>
            </div>
            <div>
              <button className="text-sm text-blue-600 mr-2" onClick={()=>setSelected(s)}>Ver</button>
              <button className="text-sm text-red-600" onClick={async ()=>{
                await api.delete(`/students/${s.id}`); load();
              }}>Borrar</button>
            </div>
          </li>
        ))}
      </ul>

      {selected && (
        <div className="mt-4 p-3 border rounded bg-gray-50">
          <h4 className="font-semibold mb-2">Ficha: {selected.firstName} {selected.lastName}</h4>
          <pre className="text-xs">{JSON.stringify(selected, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
