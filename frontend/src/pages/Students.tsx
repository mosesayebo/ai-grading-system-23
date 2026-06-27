import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { Student } from '../types';

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState({ name:'', matric:'', department:'', level:'100', email:'' });

  const load = () => api.get('/students').then(r => setStudents(r.data));
  useEffect(() => {
    load();
  }, []);

  function openNew() { setEditing(null); setForm({ name:'', matric:'', department:'', level:'100', email:'' }); (document.getElementById('student-modal') as HTMLDialogElement)?.showModal(); }
  function openEdit(s: Student) { setEditing(s); setForm({ name:s.name, matric:s.matric, department:s.department, level:(s.level||'100'), email:(s.email||'') }); (document.getElementById('student-modal') as HTMLDialogElement)?.showModal(); }

  async function save(e?: Event) { e?.preventDefault(); if (editing) { await api.put(`/students/${editing.id}`, form); } else { await api.post('/students', form); } (document.getElementById('student-modal') as HTMLDialogElement)?.close(); load(); }
  async function del(id: number) { if (!confirm('Delete student?')) return; await api.delete(`/students/${id}`); load(); }

  const filtered = students.filter(s => { if (!q) return true; return [s.name, s.matric, s.department].join(' ').toLowerCase().includes(q.toLowerCase()); });

  return (
    <div style={{ padding:24 }}>
      <div className="card" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h3>Students</h3>
        <div style={{ display:'flex', gap:8 }}>
          <input placeholder="Search by name or matric" value={q} onChange={e => setQ(e.target.value)} />
          <button className="btn" onClick={openNew}>Add Student</button>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead><tr><th>Matric</th><th>Name</th><th>Department</th><th>Actions</th></tr></thead>
          <tbody>{filtered.map(s => (<tr key={s.id}><td>{s.matric}</td><td>{s.name}</td><td>{s.department}</td><td><button className="btn" onClick={() => openEdit(s)}>Edit</button><button style={{ marginLeft:8 }} className="btn" onClick={() => del(s.id)}>Delete</button></td></tr>))}</tbody>
        </table>
      </div>

      <dialog id="student-modal">
        <form onSubmit={(e) => { e.preventDefault(); save(); }}>
          <h3>{editing ? 'Edit Student' : 'Add Student'}</h3>
          <label>Full Name<input value={form.name} onChange={e => setForm({...form, name:e.target.value})} /></label>
          <label>Matric Number<input value={form.matric} onChange={e => setForm({...form, matric:e.target.value})} /></label>
          <label>Department<input value={form.department} onChange={e => setForm({...form, department:e.target.value})} /></label>
          <label>Level<input value={form.level} onChange={e => setForm({...form, level:e.target.value})} /></label>
          <label>Email<input value={form.email} onChange={e => setForm({...form, email:e.target.value})} /></label>
          <div style={{ display:'flex', gap:8, marginTop:12 }}>
            <button className="btn" type="submit">Save</button>
            <button type="button" onClick={() => (document.getElementById('student-modal') as HTMLDialogElement).close()}>Cancel</button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
