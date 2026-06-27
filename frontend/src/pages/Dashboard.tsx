import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({ totalStudents:0, totalCourses:0, totalExams:0, avgPerformance:0 });
  useEffect(() => {
    Promise.all([ api.get('/students'), api.get('/courses'), api.get('/exams'), api.get('/analytics/average-performance') ]).then(([s,c,e,a]) => {
      setStats({ totalStudents: s.data.length, totalCourses: c.data.length, totalExams: e.data.length, avgPerformance: (a.data[0]?.avg_score || 0).toFixed ? Number((a.data[0]?.avg_score || 0).toFixed(1)) : 0 });
    });
  }, []);

  const pieData = [ { name:'A', value: 40 }, { name:'B', value: 30 }, { name:'C', value: 18 }, { name:'D', value: 7 }, { name:'F', value: 5 } ];
  const COLORS = ['#003366','#1060a8','#26a69a','#f59e0b','#ef4444'];

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }}>
        <div className="card"><h4>Total Students</h4><h2>{stats.totalStudents}</h2></div>
        <div className="card"><h4>Total Courses</h4><h2>{stats.totalCourses}</h2></div>
        <div className="card"><h4>Total Exams</h4><h2>{stats.totalExams}</h2></div>
        <div className="card"><h4>Average Performance</h4><h2>{stats.avgPerformance}%</h2></div>
      </div>

      <section style={{ display:'grid', gridTemplateColumns: '1fr 420px', gap:18, marginTop:18 }}>
        <div className="card">
          <h3>Quick Actions</h3>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <button className="btn">Upload Scripts</button>
            <button className="btn">AI Grading</button>
            <button className="btn">Results</button>
            <button className="btn">Reports</button>
          </div>
        </div>

        <div className="card">
          <h3>Grade Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} dataKey="value" outerRadius={80}>{pieData.map((entry, index) => <Cell key={`c-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
