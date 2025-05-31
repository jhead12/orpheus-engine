import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Notify parent process (Electron) that the frontend is loaded
const notifyReady = () => {
  if (window.electron && window.electron.ipcRenderer) {
    window.electron.ipcRenderer.send('service-ready', 'frontend');
  }
  
  // Also notify via HTTP for services
  try {
    fetch('/api/ready', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service: 'frontend', status: 'ready' })
    }).catch(err => console.log('Ready notification error:', err));
  } catch (e) {
    console.log('Could not send ready status via HTTP');
  }
};

// Render the React application
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App onReady={notifyReady} />
  </React.StrictMode>
)

// Signal that the app is ready
window.addEventListener('load', () => {
  // Small delay to ensure all resources are loaded
  setTimeout(notifyReady, 1000);
});
