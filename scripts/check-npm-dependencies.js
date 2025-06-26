#!/usr/bin/env node

/**
 * Script to check for npm dependency conflicts
 * Usage: node check-npm-dependencies.js [packageName]
 * 
 * This script will:
 * 1. Run npm ls to check for dependency conflicts
 * 2. If a packageName is provided, it will focus on that package's dependencies
 * 3. It also can suggest potential fixes for common dependency issues
 */

const { exec } = require('child_process');
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

// Parse command line arguments
const packageToCheck = process.argv[2];

/**
 * Check for dependency conflicts
 */
function checkDependencies() {
  console.log(`${colors.cyan}Checking for npm dependency conflicts...${colors.reset}`);
  
  // Use npm ls to check for dependency issues
  const command = packageToCheck 
    ? `npm ls ${packageToCheck} --json`
    : 'npm ls --json';

  exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
    // Having an error doesn't necessarily mean the command failed
    // npm ls returns exit code 1 when it finds peer dependency issues
    
    try {
      const output = JSON.parse(stdout);
      
      // Check if we have problems
      const problems = output.problems || [];
      
      if (problems.length === 0 && !error) {
        console.log(`${colors.green}No dependency conflicts found!${colors.reset}`);
        return;
      }
      
      console.log(`${colors.yellow}Found ${problems.length} potential dependency issues:${colors.reset}\n`);
      
      // Display each problem
      problems.forEach((problem, index) => {
        console.log(`${colors.magenta}Issue #${index + 1}:${colors.reset}`);
        console.log(`${colors.red}${problem}${colors.reset}\n`);
        
        // Try to extract package names and versions from the problem text
        const peerRequireMatch = problem.match(/peer\s([^@]+)@["']([^"']+)["']/);
        const foundMatch = problem.match(/Found\s([^@]+)@([\d\.\^~]+)/);
        
        if (peerRequireMatch && foundMatch) {
          const [_, peerPackage, peerVersion] = peerRequireMatch;
          const [__, foundPackage, foundVersion] = foundMatch;
          
          console.log(`${colors.yellow}Potential solution:${colors.reset}`);
          
          // Suggest using --force or --legacy-peer-deps
          console.log(`1. Try installing with the --force flag:`);
          console.log(`   ${colors.cyan}npm install --force${colors.reset}\n`);
          
          console.log(`2. Or use the --legacy-peer-deps flag:`);
          console.log(`   ${colors.cyan}npm install --legacy-peer-deps${colors.reset}\n`);
          
          // Suggest downgrading the dependency that's causing issues
          if (peerPackage === foundPackage) {
            console.log(`3. Downgrade ${peerPackage} to a compatible version:`);
            console.log(`   ${colors.cyan}npm install ${peerPackage}@"${peerVersion}"${colors.reset}\n`);
          }
          
          // Suggest checking for newer versions of the dependency with peer requirements
          console.log(`4. Check if there's a newer version of the package with updated peer dependencies:`);
          console.log(`   ${colors.cyan}npm view ${peerPackage} versions${colors.reset}\n`);
        }
      });

      // Check if package.json has resolutions field (for Yarn)
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        console.log(`${colors.blue}Additional tips:${colors.reset}`);
        console.log(`• For Yarn users: You can use the "resolutions" field in package.json to force specific versions`);
        console.log(`• For npm users: Consider using npm-force-resolutions package for similar functionality`);
        console.log(`• You can also try updating your problematic dependencies: ${colors.cyan}npm update${colors.reset}`);
      }
      
    } catch (e) {
      console.error(`${colors.red}Error parsing npm output:${colors.reset}`, e);
      console.log('Raw stdout:', stdout);
      console.log('Raw stderr:', stderr);
    }
  });
}

/**
 * Check for specific ERESOLVE conflicts that match the pattern in the error message
 */
function checkSpecificEresolve() {
  console.log(`${colors.cyan}Checking for specific ERESOLVE conflicts...${colors.reset}`);
  
  exec('npm ls --json', { maxBuffer: 1024 * 1024 * 10 }, (error, stdout) => {
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      if (!fs.existsSync(packageJsonPath)) {
        console.log(`${colors.red}package.json not found!${colors.reset}`);
        return;
      }
      
      const packageJson = require(packageJsonPath);
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };
      
      // Parse the dependency tree
      const dependencyTree = JSON.parse(stdout);
      
      // Check if we have the specific package with peer dependency issues
      const googleMapsReact = findPackageInTree(dependencyTree, 'google-maps-react');
      const react = findPackageInTree(dependencyTree, 'react');
      
      if (googleMapsReact && react) {
        console.log(`${colors.yellow}Potential conflict detected:${colors.reset}`);
        console.log(`• ${colors.magenta}google-maps-react${colors.reset} version: ${googleMapsReact.version}`);
        console.log(`  requires React: ${googleMapsReact.peerDependencies?.react || 'unknown'}`);
        console.log(`• ${colors.magenta}react${colors.reset} version in your project: ${react.version}`);
        
        if (googleMapsReact.version === '2.0.6' && 
            react.version === '18.2.0') {
          console.log(`\n${colors.red}Confirmed conflict:${colors.reset} google-maps-react@2.0.6 isn't compatible with react@18.2.0`);
          console.log(`\n${colors.green}Recommended solutions:${colors.reset}`);
          console.log(`1. Use a newer alternative to google-maps-react, like @react-google-maps/api`);
          console.log(`   ${colors.cyan}npm uninstall google-maps-react && npm install @react-google-maps/api${colors.reset}`);
          console.log(`\n2. Force install with legacy peer deps flag:`);
          console.log(`   ${colors.cyan}npm install --legacy-peer-deps${colors.reset}`);
          console.log(`\n3. Use a React version compatible with google-maps-react:`);
          console.log(`   ${colors.cyan}npm install react@16 react-dom@16${colors.reset}`);
        }
      } else {
        // Check for other common conflicts
        checkCommonConflicts(dependencyTree, dependencies);
      }
      
    } catch (e) {
      console.error(`${colors.red}Error analyzing dependencies:${colors.reset}`, e);
    }
  });
}

/**
 * Find a package in the dependency tree
 */
function findPackageInTree(tree, packageName) {
  if (!tree) return null;
  
  // Check if this node is the package we're looking for
  if (tree.name === packageName) {
    return tree;
  }
  
  // Check dependencies
  if (tree.dependencies) {
    if (tree.dependencies[packageName]) {
      return tree.dependencies[packageName];
    }
    
    // Recursively check all dependencies
    for (const dep in tree.dependencies) {
      const found = findPackageInTree(tree.dependencies[dep], packageName);
      if (found) return found;
    }
  }
  
  return null;
}

/**
 * Check for other common conflicts
 */
function checkCommonConflicts(tree, dependencies) {
  const commonConflicts = [
    { 
      packages: ['react', 'react-dom'], 
      message: 'React and React DOM versions should match' 
    },
    { 
      packages: ['@types/react', 'react'], 
      message: 'TypeScript definitions should be compatible with React version' 
    },
    {
      packages: ['typescript', '@typescript-eslint/parser', '@typescript-eslint/eslint-plugin'],
      message: 'TypeScript and related ESLint plugins should have compatible versions'
    }
  ];
  
  commonConflicts.forEach(conflict => {
    const packageVersions = conflict.packages.map(pkg => {
      const found = findPackageInTree(tree, pkg);
      return found ? { name: pkg, version: found.version } : null;
    }).filter(Boolean);
    
    if (packageVersions.length > 1) {
      // Do some version comparison logic here if needed
      console.log(`${colors.yellow}Potential issue:${colors.reset} ${conflict.message}`);
      packageVersions.forEach(pkg => {
        console.log(`• ${colors.magenta}${pkg.name}${colors.reset}: ${pkg.version}`);
      });
      console.log();
    }
  });
}

// Run both checks
checkDependencies();
checkSpecificEresolve();

console.log(`${colors.blue}Helpful commands for resolving npm dependency issues:${colors.reset}`);
console.log(`• ${colors.cyan}npm install --legacy-peer-deps${colors.reset} - Ignores peer dependency conflicts`);
console.log(`• ${colors.cyan}npm install --force${colors.reset} - Forces resolution of conflicts`);
console.log(`• ${colors.cyan}npm dedupe${colors.reset} - Reduces duplication in the package tree`);
console.log(`• ${colors.cyan}npm ls${colors.reset} - Lists the dependency tree`);
console.log(`• ${colors.cyan}npm why <package>${colors.reset} - Explains why a package is installed`);
