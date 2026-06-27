import React, { useState } from 'react';
import api from '../api/client';

export default function AiGrading() {
  const [modelAnswer, setModelAnswer] = useState('');
  const [studentAnswer, setStudentAnswer] = useState('');
  const [result, setResult] = useState<any>(null);

  async function gradeOnline() {
    const resp = await api.post('/local/grade', { modelAnswer, studentAnswer });
    setResult(resp.data);
  }

  return (
    <div style={{ padding:24 }}>
      <div className="card">
        <h3>AI Grading (Ad-hoc)</h3>
        <div>
          <label>Model Answer</label>
          <textarea value={modelAnswer} onChange={e => setModelAnswer(e.target.value)} />
          <label>Student Answer</label>
          <textarea value={studentAnswer} onChange={e => setStudentAnswer(e.target.value)} />
          <div style={{ marginTop:12 }}><button className="btn" onClick={gradeOnline}>Grade</button></div>
        </div>
      </div>

      {result && (
        <div className="card">
          <h3>Grade Result</h3>
          <p><strong>Score:</strong> {result.score}%</p>
          <p><strong>Similarity:</strong> {result.similarity}%</p>
          <p><strong>Performance Level:</strong> {result.performanceLevel}</p>
          <div style={{ background:'#f3f6f9', padding:12, borderRadius:8 }}>{result.feedback}</div>

          <div style={{ marginTop:12 }}>
            <h4>Strengths</h4>
            <ul>{result.strengths?.map((s:string, i:number) => <li key={i}>{s}</li>)}</ul>
            <h4>Weaknesses</h4>
            <ul>{result.weaknesses?.map((s:string, i:number) => <li key={i}>{s}</li>)}</ul>
          </div>
        </div>
      )}
    </div>
  );
}
