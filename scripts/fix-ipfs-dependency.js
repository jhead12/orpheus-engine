#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Root directory of the project
const rootDir = '/workspaces/orpheus-engine';

// Find all requirements files that might contain ipfshttpclient
function findRequirementFiles() {
  try {
    // This will find all requirements*.txt files recursively
    const output = execSync(`find ${rootDir} -name "requirements*.txt" -o -name "setup.py"`, { encoding: 'utf8' });
    return output.trim().split('\n').filter(Boolean);
  } catch (error) {
    console.error('Error finding requirement files:', error.message);
    return [];
  }
}

// Modify the file to fix the dependency
function modifyFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('ipfshttpclient>=0.8.0')) {
      const modifiedContent = content.replace(/ipfshttpclient>=0\.8\.0/g, 'ipfshttpclient==0.7.0');
      
      fs.writeFileSync(filePath, modifiedContent);
      console.log(`Fixed dependency in ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error.message);
    return false;
  }
}

// Main function
function main() {
  console.log("Searching for requirements files with ipfshttpclient>=0.8.0 dependency...");
  
  const files = findRequirementFiles();
  let found = false;
  
  files.forEach(filePath => {
    if (modifyFile(filePath)) {
      found = true;
    }
  });
  
  if (found) {
    console.log("\nDependency has been updated to ipfshttpclient==0.7.0");
    console.log("Please try installing your requirements again.");
  } else {
    console.log("\nCouldn't find the problematic dependency in requirements files.");
    console.log("If you know which package requires ipfshttpclient>=0.8.0, you may need to:");
    console.log("1. Install ipfshttpclient manually: pip install ipfshttpclient==0.7.0");
    console.log("2. Modify the package that requires it");
    console.log("3. Try installing with the --pre flag: pip install --pre <package>");
  }
}

main();
