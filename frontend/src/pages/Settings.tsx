import React from 'react';

export default function SettingsPage() {
  return (
    <div style={{ padding:24 }}>
      <div className="card">
        <h3>Settings</h3>
        <p>The deployed app uses Netlify Functions and Netlify Database for grading records, students, exams and analytics.</p>
      </div>
      <div className="card">
        <h4>Grading Mode</h4>
        <p>Local NLP scoring is active by default, so grading works without any extra secrets.</p>
      </div>
    </div>
  );
}
