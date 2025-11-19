import React, { useState } from 'react';
import { api } from '../api';

export default function StudentForm({ onSaved }) {
  const [form, setForm] = useState({ firstName:'', lastName:'', gradeLevel:'' });

  async function submit(e){
    e.preventDefault();
    await api.post('/students', form);
    setForm({ firstName:'', lastName:'', gradeLevel:'' });
    onSaved?.();
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <input className="w-full border px-2 py-1 rounded" placeholder="Nombre" value={form.firstName} onChange={e=>setForm({...form, firstName:e.target.value})}/>
      <input className="w-full border px-2 py-1 rounded" placeholder="Apellido" value={form.lastName} onChange={e=>setForm({...form, lastName:e.target.value})}/>
      <input className="w-full border px-2 py-1 rounded" placeholder="Curso" value={form.gradeLevel} onChange={e=>setForm({...form, gradeLevel:e.target.value})}/>
      <div className="flex justify-end">
        <button className="bg-blue-600 text-white px-3 py-1 rounded" type="submit">Agregar</button>
      </div>
    </form>
  );
}
