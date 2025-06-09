#!/usr/bin/env node

/**
 * Test script to validate the permissions and installation scripts
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.dirname(__dirname);

console.log('🧪 Testing Orpheus Engine Scripts...\n');

// Test 1: Check if scripts exist
const scriptsToTest = [
  'fix-permissions.js',
  'install-all.js',
  'fix-permissions-win.js'
];

console.log('1. Checking script files exist...');
for (const script of scriptsToTest) {
  const scriptPath = path.join(__dirname, script);
  if (fs.existsSync(scriptPath)) {
    console.log(`  ✅ ${script} exists`);
  } else {
    console.log(`  ❌ ${script} missing`);
  }
}

// Test 2: Check package managers
console.log('\n2. Checking package managers...');
const packageManagers = ['npm', 'pnpm', 'yarn'];

for (const pm of packageManagers) {
  try {
    execSync(`${pm} --version`, { stdio: 'pipe' });
    console.log(`  ✅ ${pm} is available`);
  } catch (error) {
    console.log(`  ❌ ${pm} not available`);
  }
}

// Test 3: Check Node.js version
console.log('\n3. Checking Node.js version...');
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  console.log(`  ✅ Node.js version: ${nodeVersion}`);
  
  const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0]);
  if (majorVersion >= 20) {
    console.log(`  ✅ Node.js version is compatible (>=20)`);
  } else {
    console.log(`  ⚠️ Node.js version may be too old (requires >=20)`);
  }
} catch (error) {
  console.log(`  ❌ Failed to check Node.js version: ${error.message}`);
}

// Test 4: Check project structure
console.log('\n4. Checking project structure...');
const expectedDirs = ['workstation', 'scripts', 'electron'];
const expectedFiles = ['package.json', 'tsconfig.json'];

for (const dir of expectedDirs) {
  const dirPath = path.join(projectRoot, dir);
  if (fs.existsSync(dirPath)) {
    console.log(`  ✅ Directory ${dir} exists`);
  } else {
    console.log(`  ❌ Directory ${dir} missing`);
  }
}

for (const file of expectedFiles) {
  const filePath = path.join(projectRoot, file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ File ${file} exists`);
  } else {
    console.log(`  ❌ File ${file} missing`);
  }
}

// Test 5: Validate package.json syntax
console.log('\n5. Validating package.json...');
try {
  const packageJsonPath = path.join(projectRoot, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  console.log(`  ✅ package.json is valid JSON`);
  console.log(`  ✅ Project name: ${packageJson.name}`);
  console.log(`  ✅ Project version: ${packageJson.version}`);
  
  // Check for our scripts
  const ourScripts = ['fix:permissions', 'install:all', 'setup'];
  for (const script of ourScripts) {
    if (packageJson.scripts && packageJson.scripts[script]) {
      console.log(`  ✅ Script '${script}' is defined`);
    } else {
      console.log(`  ❌ Script '${script}' is missing`);
    }
  }
} catch (error) {
  console.log(`  ❌ package.json validation failed: ${error.message}`);
}

console.log('\n✨ Script validation completed!');
console.log('\nTo use the improved scripts:');
console.log('  pnpm run fix:permissions  # Fix permissions issues');
console.log('  pnpm run install:all      # Install all dependencies');
console.log('  pnpm run setup            # Complete setup process');
