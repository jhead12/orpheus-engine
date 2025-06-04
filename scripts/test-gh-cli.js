#!/usr/bin/env node

const { execSync } = require('child_process');

function testGitHubCLI() {
  try {
    // Check if gh CLI is installed
    execSync('gh --version', { stdio: 'pipe' });
    console.log('✓ GitHub CLI is installed');
    
    // Check if gh CLI is authenticated
    const authStatus = execSync('gh auth status', { stdio: 'pipe' }).toString();
    console.log('✓ GitHub CLI is authenticated');
    console.log(authStatus);
    
    return true;
  } catch (error) {
    console.error('✗ GitHub CLI issue:', error.message);
    return false;
  }
}

if (require.main === module) {
  const success = testGitHubCLI();
  process.exit(success ? 0 : 1);
}

module.exports = { testGitHubCLI };
