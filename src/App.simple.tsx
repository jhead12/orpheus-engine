import React from 'react';

function SimpleApp(): React.ReactElement {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', height: '100vh' }}>
      <h1>Orpheus Engine - Simple Test</h1>
      <p>If you can see this, React is working!</p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  );
}

export default SimpleApp;
