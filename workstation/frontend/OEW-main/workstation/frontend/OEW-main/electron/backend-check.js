const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

/**
 * Checks if the backend service can start properly
 * @returns {Promise<boolean>} true if backend starts successfully
 */
function testBackendStartup() {
  return new Promise((resolve, reject) => {
    const backendProcess = spawn(
      path.join(__dirname, '..', 'backend', 'backend-executable'), 
      ['--test-mode']
    );
    
    let output = '';
    let errorOutput = '';
    
    backendProcess.stdout.on('data', (data) => {
      output += data.toString();
      console.log(`[Backend Test] ${data.toString()}`);
    });
    
    backendProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error(`[Backend Test Error] ${data.toString()}`);
    });
    
    backendProcess.on('close', (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        reject(new Error(`Backend test failed with exit code ${code}:\n${errorOutput}`));
      }
    });
    
    // Set timeout for the test
    setTimeout(() => {
      backendProcess.kill();
      reject(new Error('Backend startup test timed out after 10 seconds'));
    }, 10000);
  });
}

module.exports = {
  testBackendStartup
};
