#!/usr/bin/env node

/**
 * Script to fix Google Maps dependency issues
 * Replaces google-maps-react with @googlemaps/google-maps-services-js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for better terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

console.log(`${colors.cyan}Fixing Google Maps dependencies...${colors.reset}`);

// Check each directory for package.json files
const directories = [
  '.',
  'workstation/frontend',
  'workstation/backend',
  'OEW-main'
].filter(dir => fs.existsSync(path.join(process.cwd(), dir)));

let foundAndFixed = false;

directories.forEach(dir => {
  const packageJsonPath = path.join(process.cwd(), dir, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    return;
  }
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Check if google-maps-react is a dependency
    if (
      (packageJson.dependencies && packageJson.dependencies['google-maps-react']) ||
      (packageJson.devDependencies && packageJson.devDependencies['google-maps-react'])
    ) {
      foundAndFixed = true;
      console.log(`${colors.yellow}Found google-maps-react dependency in ${dir}/package.json${colors.reset}`);
      
      // Create a backup
      const backupPath = `${packageJsonPath}.backup-${Date.now()}`;
      fs.writeFileSync(backupPath, JSON.stringify(packageJson, null, 2));
      console.log(`${colors.green}Created backup at ${backupPath}${colors.reset}`);
      
      // Remove google-maps-react
      console.log(`${colors.yellow}Removing google-maps-react...${colors.reset}`);
      try {
        execSync('npm uninstall google-maps-react', { stdio: 'inherit', cwd: path.join(process.cwd(), dir) });
      } catch (e) {
        console.log(`${colors.red}Failed to uninstall via npm, updating package.json manually${colors.reset}`);
        if (packageJson.dependencies && packageJson.dependencies['google-maps-react']) {
          delete packageJson.dependencies['google-maps-react'];
        }
        if (packageJson.devDependencies && packageJson.devDependencies['google-maps-react']) {
          delete packageJson.devDependencies['google-maps-react'];
        }
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      }
      
      // Install @googlemaps/google-maps-services-js
      console.log(`${colors.yellow}Installing @googlemaps/google-maps-services-js...${colors.reset}`);
      try {
        execSync('npm install --save @googlemaps/google-maps-services-js', { stdio: 'inherit', cwd: path.join(process.cwd(), dir) });
      } catch (e) {
        console.log(`${colors.red}Failed to install via npm, updating package.json manually${colors.reset}`);
        if (!packageJson.dependencies) {
          packageJson.dependencies = {};
        }
        packageJson.dependencies['@googlemaps/google-maps-services-js'] = '^3.3.42';
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      }
      
      console.log(`${colors.green}✓ Successfully updated Google Maps dependencies in ${dir}${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}Error processing ${packageJsonPath}: ${error.message}${colors.reset}`);
  }
});

if (!foundAndFixed) {
  console.log(`${colors.yellow}No google-maps-react dependencies found in package.json files.${colors.reset}`);
  
  // Check for potential dependency conflicts using npm ls
  console.log(`${colors.yellow}Checking for potential conflicts in node_modules...${colors.reset}`);
  
  try {
    execSync('npm ls google-maps-react --json', { stdio: 'pipe' });
    // If we get here, the package exists somewhere in node_modules
    console.log(`${colors.yellow}google-maps-react found in node_modules. Installing @googlemaps/google-maps-services-js as an alternative...${colors.reset}`);
    
    // Install in the root directory
    execSync('npm install --save @googlemaps/google-maps-services-js', { stdio: 'inherit' });
    console.log(`${colors.green}✓ Successfully installed @googlemaps/google-maps-services-js${colors.reset}`);
    
    // Install react-google-maps/api as an alternative for React components
    console.log(`${colors.yellow}Installing @react-google-maps/api for React components...${colors.reset}`);
    execSync('npm install --save @react-google-maps/api', { stdio: 'inherit' });
    console.log(`${colors.green}✓ Successfully installed @react-google-maps/api${colors.reset}`);
  } catch (error) {
    // If npm ls returns an error, the package might not exist
    if (error.status === 1 && error.stdout && error.stdout.includes('google-maps-react')) {
      console.log(`${colors.yellow}google-maps-react dependency detected in node_modules. Installing alternatives...${colors.reset}`);
      
      try {
        // Install both alternatives
        execSync('npm install --save @googlemaps/google-maps-services-js @react-google-maps/api', { stdio: 'inherit' });
        console.log(`${colors.green}✓ Successfully installed Google Maps alternatives${colors.reset}`);
      } catch (installError) {
        console.error(`${colors.red}Failed to install alternatives: ${installError.message}${colors.reset}`);
      }
    } else {
      console.log(`${colors.green}No google-maps-react dependency found in node_modules.${colors.reset}`);
    }
  }
}

console.log(`${colors.blue}To resolve ERESOLVE errors with npm, you can also try:${colors.reset}`);
console.log(`${colors.cyan}npm install --legacy-peer-deps${colors.reset} - Ignores peer dependency conflicts`);
console.log(`${colors.cyan}npm dedupe${colors.reset} - Reduces duplication in the package tree`);
