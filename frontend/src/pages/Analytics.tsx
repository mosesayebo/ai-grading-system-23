import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function AnalyticsPage() {
  const [grades, setGrades] = useState<any[]>([]);
  const [passFail, setPassFail] = useState({ pass_count: 0, fail_count: 0 });

  useEffect(() => {
    api.get('/analytics/grade-distribution').then(r => setGrades(r.data));
    api.get('/analytics/pass-fail').then(r => setPassFail(r.data[0] || { pass_count: 0, fail_count: 0 }));
  }, []);

  return (
    <div style={{ padding:24 }}>
      <div className="card">
        <h3>Analytics</h3>
        <p>Track grading outcomes across submitted student scripts.</p>
      </div>

      <section style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:18 }}>
        <div className="card"><h4>Passed</h4><h2>{passFail.pass_count || 0}</h2></div>
        <div className="card"><h4>Needs Support</h4><h2>{passFail.fail_count || 0}</h2></div>
      </section>

      <div className="card">
        <h3>Grade Distribution</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={grades}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="grade" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#003366" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
