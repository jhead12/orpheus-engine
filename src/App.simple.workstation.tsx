import React from "react";
import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import "./styles/App.css";

function App(): React.ReactElement {
  console.log('App component is rendering...');

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>🎵 Orpheus Engine Workstation</h1>
          <p>Professional Digital Audio Workstation</p>
        </header>
        <main className="app-main">
          <Routes>
            <Route 
              path="/" 
              element={
                <div className="workstation-placeholder">
                  <h2>Welcome to Orpheus Engine</h2>
                  <p>This is the main workstation interface.</p>
                  <div style={{ 
                    padding: '20px', 
                    background: '#2a2a2a', 
                    color: '#fff', 
                    borderRadius: '8px',
                    margin: '20px 0'
                  }}>
                    <h3>DAW Features:</h3>
                    <ul>
                      <li>Multi-track audio recording</li>
                      <li>AI-powered audio analysis</li>
                      <li>Professional mixing capabilities</li>
                      <li>Plugin support</li>
                    </ul>
                  </div>
                </div>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
