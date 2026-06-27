import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { Exam, Student, Result } from '../types';

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [answer, setAnswer] = useState('');
  const [lastResult, setLastResult] = useState<any | null>(null);

  useEffect(() => { api.get('/exams').then(r => setExams(r.data)); api.get('/students').then(r => setStudents(r.data)); }, []);

  const submitGrade = async () => {
    if (!selectedExam || !studentId) return alert('Select exam and student');
    const res = await api.post(`/exams/${selectedExam.id}/upload-and-grade`, { studentId, studentText: answer });
    setLastResult(res.data.result);
    alert('Result saved');
  };

  return (
    <div style={{ padding:24 }}>
      <div className="card">
        <h2>Exams</h2>
        <table className="table"><thead><tr><th>Title</th><th>Course</th><th>Action</th></tr></thead><tbody>{exams.map(e => (<tr key={e.id}><td>{e.title}</td><td>{e.course?.title || 'N/A'}</td><td><button className="btn" onClick={() => setSelectedExam(e)}>Open</button></td></tr>))}</tbody></table>
      </div>

      {selectedExam && (
        <div className="card">
          <h3>{selectedExam.title}</h3>
          <p><strong>Prompt:</strong> {selectedExam.prompt}</p>
          <div style={{ margin: '12px 0' }}>
            <select onChange={e => setStudentId(Number(e.target.value))} value={studentId ?? ''}>
              <option value="">Select student</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.matric})</option>)}
            </select>
          </div>
          <textarea className="textarea" value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Paste student's answer here" />
          <div style={{ marginTop: 12 }}><button className="btn" onClick={submitGrade}>Grade & Save</button></div>
        </div>
      )}

      {lastResult && (
        <div className="card">
          <h3>Last Saved Result</h3>
          <p><strong>Score:</strong> {lastResult.score} &nbsp; <strong>Grade:</strong> {lastResult.grade}</p>
          <p><strong>Feedback:</strong></p>
          <div style={{ whiteSpace: 'pre-wrap', background: '#f3f6f9', padding: 12, borderRadius: 6 }}>{lastResult.feedback}</div>
        </div>
      )}
    </div>
  );
}
