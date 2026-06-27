import React, { useEffect, useState } from 'react';
import api from '../api/client';

export default function ReportsPage() {
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    api.get('/results').then(r => setResults(r.data));
  }, []);

  const average = results.length
    ? Math.round(results.reduce((sum, item) => sum + Number(item.score || 0), 0) / results.length)
    : 0;

  return (
    <div style={{ padding:24 }}>
      <div className="card">
        <h3>Reports</h3>
        <p>Generate summaries from saved grading records.</p>
      </div>
      <section style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:18 }}>
        <div className="card"><h4>Total Results</h4><h2>{results.length}</h2></div>
        <div className="card"><h4>Average Score</h4><h2>{average}%</h2></div>
      </section>
      <div className="card">
        <h3>Recent Feedback</h3>
        {results.length === 0 ? <p>No graded scripts yet.</p> : results.slice(0, 5).map(result => (
          <p key={result.id}><strong>{result.student?.name}</strong> scored {result.score}% in {result.exam?.title}.</p>
        ))}
      </div>
    </div>
  );
}
