const path = require('path');

module.exports = {
  // ...existing config...
  resolve: {
    alias: {
      '@orpheus': path.resolve(__dirname, 'OEW-main'),
      '@': path.resolve(__dirname, 'OEW-main')
    },
    // ...other resolve options...
  },
  // ...existing code...
};