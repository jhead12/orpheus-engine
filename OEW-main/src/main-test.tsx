import React from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';

function SimpleTest() {
  return (
    <div style={{ padding: '20px', fontSize: '18px' }}>
      <h1>DAW Interface Test</h1>
      <p>If you can see this, React is working!</p>
      <div style={{ background: '#f0f0f0', padding: '10px', margin: '10px 0' }}>
        <strong>Orpheus Engine Workstation</strong><br/>
        Digital Audio Workstation Interface
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<SimpleTest />);
