#!/usr/bin/env node

/**
 * Fix React Router Dependencies Script
 * Addresses React Router v6 type compatibility issues across the workspace
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing React Router Dependencies...\n');

const workspaces = [
  '/Volumes/PRO-BLADE/Github/orpheus-engine/workstation/frontend',
  '/Volumes/PRO-BLADE/Github/orpheus-engine/workstation/frontend/OEW-main',
  '/Volumes/PRO-BLADE/Github/orpheus-engine/workstation/electron/legacy'
];

function runCommand(command, cwd) {
  try {
    console.log(`📁 ${cwd}`);
    console.log(`🔨 ${command}`);
    const output = execSync(command, { 
      cwd, 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'development' }
    });
    console.log('✅ Success\n');
    return true;
  } catch (error) {
    console.log(`❌ Failed: ${error.message}\n`);
    return false;
  }
}

function fixReactRouterDeps() {
  for (const workspace of workspaces) {
    if (!fs.existsSync(workspace)) {
      console.log(`⚠️  Workspace not found: ${workspace}\n`);
      continue;
    }

    const packageJsonPath = path.join(workspace, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      console.log(`⚠️  No package.json found in: ${workspace}\n`);
      continue;
    }

    console.log(`🎯 Processing workspace: ${workspace}`);
    
    // Read current package.json to check versions
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Remove incompatible @types/react-router-dom if it exists
    if (packageJson.devDependencies && packageJson.devDependencies['@types/react-router-dom']) {
      console.log('📦 Removing incompatible @types/react-router-dom...');
      runCommand('npm uninstall @types/react-router-dom --legacy-peer-deps', workspace);
    }

    // Fix @types/react version to match React version
    if (packageJson.dependencies && packageJson.dependencies.react) {
      const reactVersion = packageJson.dependencies.react;
      console.log(`📦 React version detected: ${reactVersion}`);
      
      if (reactVersion.includes('18.')) {
        console.log('📦 Installing compatible @types/react for React 18...');
        runCommand('npm install --save-dev @types/react@^18.3.3 @types/react-dom@^18.3.0 --legacy-peer-deps', workspace);
      }
    }

    // Update testing library dependencies if they exist
    if (packageJson.devDependencies && packageJson.devDependencies['@testing-library/react']) {
      console.log('📦 Updating testing library dependencies...');
      runCommand('npm install --save-dev @testing-library/dom@^10.4.0 --legacy-peer-deps', workspace);
    }

    // Run npm audit fix
    console.log('🔍 Running npm audit fix...');
    runCommand('npm audit fix --legacy-peer-deps', workspace);

    // Clean and reinstall if needed
    console.log('🧹 Cleaning dependency tree...');
    runCommand('npm dedupe', workspace);
  }
}

function checkResults() {
  console.log('🔍 Checking final dependency status...\n');
  
  for (const workspace of workspaces) {
    if (!fs.existsSync(workspace)) continue;
    
    console.log(`📁 ${workspace}`);
    runCommand('npm ls react react-dom react-router-dom --depth=0', workspace);
  }
}

// Main execution
console.log('🚀 Starting React Router Dependency Fix\n');

try {
  fixReactRouterDeps();
  checkResults();
  console.log('✅ React Router dependency fix completed!\n');
  console.log('💡 If you still have issues, try:');
  console.log('   npm install --legacy-peer-deps');
  console.log('   npm run build');
} catch (error) {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
}
