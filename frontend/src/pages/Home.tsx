import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{ padding:24 }}>
      <section className="card" style={{ display:'grid', gridTemplateColumns: '1fr 360px', gap:20, alignItems:'center' }}>
        <div>
          <h1 style={{ color: '#003366' }}>AI-Assisted Grading and Feedback System</h1>
          <h3 style={{ marginTop:6 }}>Lead City University — Automatic grading, intelligent feedback and analytics</h3>
          <p>
            Help lecturers grade student answers faster with consistent, explainable AI-based scoring and feedback.
            Supports GST courses, file uploads, analytics and easy exports.
          </p>

          <div style={{ display:'flex', gap:12, marginTop:12 }}>
            <Link to="/exams" className="btn">Get Started</Link>
            <Link to="/about" className="btn secondary">Learn more</Link>
          </div>
        </div>

        <div style={{ background:'#f4fbff', padding:16, borderRadius:12 }}>
          <h4>Project Stats</h4>
          <ul>
            <li>Total Students: 200+</li>
            <li>Courses: 7 GST Core</li>
            <li>Exams Processed: 120</li>
            <li>Average Grade: B</li>
          </ul>
        </div>
      </section>

      <section style={{ marginTop:18, display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:16 }}>
        <div className="card">
          <h4>Feature: AI Grading</h4>
          <p>Produce consistent scores and actionable feedback.</p>
        </div>
        <div className="card">
          <h4>Feature: Analytics</h4>
          <p>Interactive grade distributions and course performance charts.</p>
        </div>
        <div className="card">
          <h4>Feature: Export</h4>
          <p>Export results to PDF or Excel, or print.</p>
        </div>
      </section>
    </div>
  );
}
