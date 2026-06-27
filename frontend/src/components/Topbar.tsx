import React from 'react';

export default function Topbar() {
  return (
    <div className="topbar">
      <div style={{ display:'flex', gap:12, alignItems:'center' }}>
        <h2 style={{ margin:0, color:'#003366' }}>AI-Assisted Grading</h2>
      </div>
      <div style={{ display:'flex', gap:12 }}>
        <div style={{ color:'#003366', opacity:0.9 }}>Dr. Olufemi Akinyemi</div>
        <div style={{ width:40, height:40, borderRadius:999, background:'#D4AF37', color:'#072026', display:'grid', placeItems:'center', fontWeight:800 }} aria-label="user">OA</div>
      </div>
    </div>
  );
}
