import React from 'react';

export default function Topbar() {
  return (
    <div className="topbar">
      <div style={{ display:'flex', gap:12, alignItems:'center' }}>
        <h2 style={{ margin:0, color:'#003366' }}>AI-Assisted Grading</h2>
      </div>
      <div style={{ display:'flex', gap:12 }}>
        <div style={{ color:'#003366', opacity:0.9 }}>Dr. John Doe</div>
        <img src="/avatar.png" style={{ width:40, height:40, borderRadius:999 }} alt="user" />
      </div>
    </div>
  );
}
