import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.simple.workstation';
import './index.css';

console.log('Main.tsx is loading...');
console.log('React version:', React.version);

const rootElement = document.getElementById('root');
console.log('Root element found:', rootElement);

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  console.log('React root created, attempting to render...');

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  console.log('React render called');
} else {
  console.error('Root element not found!');
}
