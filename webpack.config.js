const path = require('path');

module.exports = {
  // ...existing config...
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'workstation/frontend'),
    },
    // ...other resolve options...
  }
};