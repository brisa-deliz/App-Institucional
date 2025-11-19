import React from 'react';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';

export default function App() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">EduTracker — Panel docente</h1>
      </header>
      <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="md:col-span-2 bg-white p-4 rounded-lg shadow">
          <Dashboard />
        </section>
        <aside className="bg-white p-4 rounded-lg shadow">
          <StudentList />
        </aside>
      </main>
    </div>
  );
}
