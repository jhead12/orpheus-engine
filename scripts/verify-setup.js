#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m"
};

console.log(`${colors.cyan}============================================================${colors.reset}`);
console.log(`${colors.cyan}Checking Workspace Structure${colors.reset}`);
console.log(`${colors.cyan}============================================================${colors.reset}`);

// Define required directories
const requiredDirs = [
  'scripts',
  'electron',
  'workstation',
  'OEW-main'
];

// Define required files
const requiredFiles = [
  'package.json',
  'requirements.txt',
  'workstation/backend/main.py',
  'workstation/backend/requirements.txt',
  'workstation/frontend/package.json'
];

// Check directories
requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`${colors.green}✅ Found directory: ${dir}${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ Missing directory: ${dir}${colors.reset}`);
  }
});

console.log(`\n${colors.cyan}Checking Required Files${colors.reset}`);
console.log(`${colors.cyan}============================================================${colors.reset}`);

// Check files
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`${colors.green}✅ Found: ${file}${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ Missing: ${file}${colors.reset}`);
  }
});

console.log(`\n${colors.cyan}Checking Node.js Environment${colors.reset}`);
console.log(`${colors.cyan}============================================================${colors.reset}`);

// Check Node.js version
try {
  const nodeVersionOutput = execSync('node --version', { encoding: 'utf8' }).trim();
  console.log(`${colors.green}✅ Node.js version: ${nodeVersionOutput}${colors.reset}`);
} catch (error) {
  console.log(`${colors.red}❌ Failed to detect Node.js version${colors.reset}`);
}

// Check npm version
try {
  const npmVersionOutput = execSync('npm --version', { encoding: 'utf8' }).trim();
  console.log(`${colors.green}✅ npm version: ${npmVersionOutput}${colors.reset}`);
} catch (error) {
  console.log(`${colors.red}❌ Failed to detect npm version${colors.reset}`);
}

console.log(`\n${colors.cyan}Checking Python Environment${colors.reset}`);
console.log(`${colors.cyan}============================================================${colors.reset}`);

// Check Python version
try {
  const pythonVersionOutput = execSync('python --version', { encoding: 'utf8' }).trim();
  console.log(`${colors.green}✅ ${pythonVersionOutput}${colors.reset}`);
} catch (error) {
  try {
    // Fallback to python3
    const pythonVersionOutput = execSync('python3 --version', { encoding: 'utf8' }).trim();
    console.log(`${colors.green}✅ ${pythonVersionOutput}${colors.reset}`);
  } catch (error) {
    console.log(`${colors.red}❌ Python is not installed or not in PATH${colors.reset}`);
  }
}

console.log(`\n${colors.cyan}Verification Complete${colors.reset}`);
