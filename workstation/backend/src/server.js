const express = require('express');
const cors = require('cors');
const path = require('path');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5175;

// Enable CORS
app.use(cors());

// Parse JSON requests
app.use(express.json());

// Serve static files from the frontend build directory in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));
}

// Define health endpoint for service readiness check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'daw',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.get('/api/status', (req, res) => {
  res.json({
    status: 'running',
    service: 'daw-backend',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Handle any other routes in production by serving the frontend
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  });
}

// Start the server
const server = app.listen(PORT, () => {
  console.log(`DAW backend server running on port ${PORT}`);
  
  // Signal that the service is ready
  if (process.send) {
    process.send('ready');
  }
});

// Handle server shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = server;
