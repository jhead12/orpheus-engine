#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get the latest release tag
function getLatestVersion() {
  try {
    const tag = execSync('git describe --tags --abbrev=0').toString().trim();
    return tag.startsWith('v') ? tag.substring(1) : tag;
  } catch (error) {
    console.error('Error getting latest tag:', error.message);
    return null;
  }
}

// Update version in package.json files
function updateVersion(version) {
  // Update main package.json
  const mainPackagePath = path.resolve(process.cwd(), 'package.json');
  const mainPackage = require(mainPackagePath);
  mainPackage.version = version;
  fs.writeFileSync(mainPackagePath, JSON.stringify(mainPackage, null, 2) + '\n');
  
  // Find and update all workspace package.json files
  const workspaces = mainPackage.workspaces || [];
  for (const workspace of workspaces) {
    const workspaceGlob = workspace.endsWith('/*') 
      ? workspace.slice(0, -2) 
      : workspace;
    
    const workspacePath = path.resolve(process.cwd(), workspaceGlob);
    if (fs.existsSync(workspacePath)) {
      const packagePath = path.join(workspacePath, 'package.json');
      if (fs.existsSync(packagePath)) {
        const pkg = require(packagePath);
        pkg.version = version;
        fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n');
        console.log(`Updated version in ${packagePath} to ${version}`);
      }
    }
  }
}

// Main function
function main() {
  const version = getLatestVersion();
  if (!version) {
    console.error('Failed to get latest version, aborting sync');
    process.exit(1);
  }
  
  console.log(`Syncing all packages to version ${version}`);
  updateVersion(version);
  console.log('Version sync complete');
}

main();
