// Test discovery script
// This script helps verify that tests from both the main repo and OEW-main submodule are being discovered

const { globSync } = require('glob');
const path = require('path');
const fs = require('fs');

console.log('===== TEST DISCOVERY VERIFICATION =====');

// Check submodule status
try {
  const gitmodulesPath = path.join(__dirname, '..', '.gitmodules');
  if (fs.existsSync(gitmodulesPath)) {
    console.log('\n✅ .gitmodules file exists');
    const gitmodulesContent = fs.readFileSync(gitmodulesPath, 'utf8');
    console.log('\nGitmodules content:');
    console.log(gitmodulesContent);
  } else {
    console.log('\n⚠️ .gitmodules file does not exist');
  }
} catch (error) {
  console.error('Error checking gitmodules:', error);
}

// Paths to check for test files
const pathsToCheck = [
  'workstation/frontend/src/**/*.test.{js,jsx,ts,tsx}',
  'workstation/frontend/OEW-main/src/**/*.test.{js,jsx,ts,tsx}',
  'src/**/*.test.{js,jsx,ts,tsx}'
];

// Find test files in each path
pathsToCheck.forEach(pattern => {
  console.log(`\n===== Finding tests in: ${pattern} =====`);
  const files = globSync(pattern, { cwd: path.join(__dirname, '..') });
  
  console.log(`Found ${files.length} test files:`);
  
  // Group files by directory for better organization
  const filesByDirectory = {};
  files.forEach(file => {
    const dirPath = path.dirname(file);
    if (!filesByDirectory[dirPath]) {
      filesByDirectory[dirPath] = [];
    }
    filesByDirectory[dirPath].push(path.basename(file));
  });
  
  // Print the organized files
  Object.keys(filesByDirectory).sort().forEach(dir => {
    console.log(`\n${dir}/`);
    filesByDirectory[dir].sort().forEach(file => {
      console.log(`  - ${file}`);
    });
  });
});

// Check vitest configuration
try {
  const vitestConfigPath = path.join(__dirname, '..', 'vitest.config.ts');
  if (fs.existsSync(vitestConfigPath)) {
    console.log('\n✅ vitest.config.ts file exists');
    const configContent = fs.readFileSync(vitestConfigPath, 'utf8');
    
    // Simple check for include patterns
    const includeMatch = configContent.match(/include:\s*\[([\s\S]*?)\]/);
    if (includeMatch) {
      console.log('\nTest include patterns:');
      console.log(includeMatch[0]);
    }
    
    // Check for setupFiles
    const setupMatch = configContent.match(/setupFiles:\s*\[([\s\S]*?)\]/);
    if (setupMatch) {
      console.log('\nSetup files:');
      console.log(setupMatch[0]);
    }
  } else {
    console.log('\n⚠️ vitest.config.ts file does not exist');
  }
} catch (error) {
  console.error('Error checking vitest config:', error);
}

console.log('\n===== END TEST DISCOVERY VERIFICATION =====');
