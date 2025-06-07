#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, 'src');

// Function to recursively find TypeScript/JSX files
function findTsFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      findTsFiles(fullPath, files);
    } else if (item.match(/\.(ts|tsx|js|jsx)$/)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Function to fix imports in a file
function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Replace @orpheus/utils/utils imports with relative paths
  const utilsPattern = /from\s+['"]@orpheus\/utils\/utils['"]/g;
  const generalPattern = /from\s+['"]@orpheus\/utils\/general['"]/g;
  
  // Calculate relative path to services/utils from current file
  const relativePath = path.relative(path.dirname(filePath), path.join(__dirname, 'src', 'services', 'utils'));
  const utilsImport = `from '${relativePath}/utils'`;
  const generalImport = `from '${relativePath}/general'`;
  
  if (content.match(utilsPattern)) {
    content = content.replace(utilsPattern, utilsImport);
    modified = true;
    console.log(`Fixed utils import in: ${filePath}`);
  }
  
  if (content.match(generalPattern)) {
    content = content.replace(generalPattern, generalImport);
    modified = true;
    console.log(`Fixed general import in: ${filePath}`);
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
  
  return modified;
}

// Main execution
console.log('Fixing utils imports...');
const files = findTsFiles(srcDir);
let totalFixed = 0;

for (const file of files) {
  if (fixImportsInFile(file)) {
    totalFixed++;
  }
}

console.log(`Fixed imports in ${totalFixed} files.`);
