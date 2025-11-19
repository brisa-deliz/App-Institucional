import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default function Charts({ students = [], subjects = [] }) {
  const canvasRef = useRef();

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    const labels = subjects.map(s => s.name);
    const data = labels.map(lbl => {
      const vals = [];
      students.forEach(st => st.Grades?.forEach(g => { if (g.Subject?.name === lbl) vals.push(g.value) }));
      return vals.length ? (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2) : 0;
    });

    const chart = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Promedio por asignatura', data }] },
      options: { responsive: true }
    });

    return () => chart.destroy();
  }, [students, subjects]);

  return <canvas ref={canvasRef} />;
}
