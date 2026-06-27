import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom: 18 }}>
        <div style={{ width:48, height:48, borderRadius:8, background:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <img src="/logo192.png" alt="LCU" style={{ width:36, height:36 }} />
        </div>
        <div>
          <div style={{ fontWeight:700 }}>Lead City University</div>
          <div style={{ fontSize:12, opacity:0.85 }}>AI Grading System</div>
        </div>
      </div>

      <nav>
        <NavLink to="/" className="navlink" style={{ color:'#fff', display:'block', marginBottom:8 }}>Home</NavLink>
        <NavLink to="/dashboard" className="navlink" style={{ color:'#fff', display:'block', marginBottom:8 }}>Dashboard</NavLink>
        <NavLink to="/students" className="navlink" style={{ color:'#fff', display:'block', marginBottom:8 }}>Students</NavLink>
        <NavLink to="/exams" className="navlink" style={{ color:'#fff', display:'block', marginBottom:8 }}>Exams</NavLink>
        <NavLink to="/results" className="navlink" style={{ color:'#fff', display:'block', marginBottom:8 }}>Results</NavLink>
        <NavLink to="/analytics" className="navlink" style={{ color:'#fff', display:'block', marginBottom:8 }}>Analytics</NavLink>
        <NavLink to="/reports" className="navlink" style={{ color:'#fff', display:'block', marginBottom:8 }}>Reports</NavLink>
        <NavLink to="/settings" className="navlink" style={{ color:'#fff', display:'block', marginBottom:8 }}>Settings</NavLink>
      </nav>

      <div style={{ marginTop: 24 }}>
        <button className="btn secondary" style={{ width:'100%' }}>New Exam</button>
      </div>
    </aside>
  );
}
