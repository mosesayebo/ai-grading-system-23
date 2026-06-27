import React, { useEffect, useState } from 'react';
import api from '../api/client';

export default function UploadPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [courseId, setCourseId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [modelAnswer, setModelAnswer] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => { api.get('/courses').then(r => setCourses(r.data)); api.get('/students').then(r => setStudents(r.data)); }, []);

  async function submitNewExam() { await api.post('/exams', { courseId, title, prompt, modelAnswer }); alert('Exam created'); }

  async function uploadAndGrade() {
    if (!file || !studentId || !courseId) return alert('provide file, student and course');
    const examResp = await api.post('/exams', { courseId, title: `${title || 'Uploaded Exam'} - ${new Date().toISOString()}`, prompt, modelAnswer });
    const exam = examResp.data;
    const fd = new FormData();
    fd.append('script', file);
    fd.append('studentId', String(studentId));
    await api.post(`/exams/${exam.id}/upload-and-grade`, fd, { headers: { 'Content-Type': 'multipart/form-data' }});
    alert('Uploaded & graded');
  }

  return (
    <div style={{ padding:24 }}>
      <div className="card">
        <h3>Upload Answer Script</h3>
        <div style={{ display:'grid', gap:10 }}>
          <select onChange={e => setCourseId(Number(e.target.value))}><option value="">Select Course</option>{courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.title}</option>)}</select>
          <input placeholder="Exam Title" value={title} onChange={e => setTitle(e.target.value)} />
          <textarea placeholder="Question prompt" value={prompt} onChange={e => setPrompt(e.target.value)} />
          <textarea placeholder="Model answer (ideal answer)" value={modelAnswer} onChange={e => setModelAnswer(e.target.value)} />
          <div><label>Student: </label><select onChange={e => setStudentId(Number(e.target.value))}><option value="">Select Student</option>{students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.matric})</option>)}</select></div>
          <div><label>Upload student answer (.txt)</label><input type="file" accept=".txt" onChange={e => setFile(e.target.files?.[0] || null)} /></div>

          <div style={{ display:'flex', gap:8 }}>
            <button className="btn" onClick={submitNewExam}>Create Exam</button>
            <button className="btn" onClick={uploadAndGrade}>Upload & Grade</button>
          </div>
        </div>
      </div>
    </div>
  );
}
