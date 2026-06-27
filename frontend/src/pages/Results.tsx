import React, { useEffect, useState } from 'react';
import api from '../api/client';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export default function ResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [q, setQ] = useState('');
  useEffect(() => { api.get('/results').then(r => setResults(r.data)); }, []);

  const filtered = results.filter(r => { if (!q) return true; return [r.student?.name, r.exam?.title, r.grade].join(' ').toLowerCase().includes(q.toLowerCase()); });

  function exportPDF() {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text('Lead City University — Results', 14, 16);
    let y = 26;
    filtered.forEach(r => { doc.text(`${r.student?.name} | ${r.exam?.title} | ${r.score}% | ${r.grade}`, 14, y); y += 8; if (y > 270) { doc.addPage(); y = 16; } });
    doc.save('results.pdf');
  }

  function exportExcel() {
    const ws = XLSX.utils.json_to_sheet(filtered.map(r => ({ student: r.student?.name, matric: r.student?.matric, exam: r.exam?.title, score: r.score, grade: r.grade, feedback: r.feedback, date: r.createdAt })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Results');
    XLSX.writeFile(wb, 'results.xlsx');
  }

  return (
    <div style={{ padding:24 }}>
      <div className="card" style={{ display:'flex', justifyContent:'space-between' }}>
        <div><h3>Results</h3></div>
        <div style={{ display:'flex', gap:8 }}>
          <input placeholder="Search results" value={q} onChange={e => setQ(e.target.value)} />
          <button className="btn" onClick={exportPDF}>Export PDF</button>
          <button className="btn" onClick={exportExcel}>Export Excel</button>
          <button className="btn">Print</button>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead><tr><th>Student</th><th>Exam</th><th>Score</th><th>Grade</th><th>Feedback</th><th>Date</th></tr></thead>
          <tbody>{filtered.map(r => (<tr key={r.id}><td>{r.student?.name}</td><td>{r.exam?.title}</td><td>{r.score}%</td><td>{r.grade}</td><td style={{ maxWidth:350 }}>{r.feedback}</td><td>{new Date(r.createdAt || '').toLocaleDateString()}</td></tr>))}</tbody>
        </table>
      </div>
    </div>
  );
}
