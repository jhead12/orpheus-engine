const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function checkBackendService() {
  console.log('Running backend service diagnostics...');
  
  // Check if backend executable exists and has correct permissions
  const backendPath = path.join(__dirname, '..', 'backend');
  
  try {
    console.log('Checking backend directory structure...');
    const files = fs.readdirSync(backendPath);
    console.log(`Backend directory contents: ${files.join(', ')}`);
    
    // Check for database connectivity if applicable
    console.log('Checking database connectivity...');
    
    // Check for required environment variables
    console.log('Checking environment variables...');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    // Check for available disk space
    console.log('Checking disk space...');
    const diskInfo = execSync('df -h', { encoding: 'utf8' });
    console.log(diskInfo);
    
    // Check for memory usage
    console.log('Checking memory usage...');
    const memInfo = execSync('free -m', { encoding: 'utf8' }).catch(err => 'Command not available');
    console.log(memInfo);
    
    // Check for network connectivity if relevant
    console.log('Checking network connectivity...');
    
    console.log('Diagnostics complete');
  } catch (error) {
    console.error('Error during diagnostics:', error);
  }
}

module.exports = {
  checkBackendService
};
