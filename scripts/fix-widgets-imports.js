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
  
  // Replace @orpheus/widgets imports with relative paths
  const widgetsPattern = /from\s+['"]@orpheus\/widgets['"]/g;
  const widgetsSpecificPattern = /from\s+['"]@orpheus\/widgets\/(.+?)['"]/g;
  
  // Calculate relative path to components/widgets from current file
  const relativePath = path.relative(path.dirname(filePath), path.join(__dirname, 'src', 'components', 'widgets'));
  const widgetsImport = `from '${relativePath}'`;
  const widgetsSpecificImport = (match, subpath) => `from '${relativePath}/${subpath}'`;
  
  if (content.match(widgetsPattern)) {
    content = content.replace(widgetsPattern, widgetsImport);
    modified = true;
    console.log(`Fixed widgets import in: ${filePath}`);
  }
  
  if (content.match(widgetsSpecificPattern)) {
    content = content.replace(widgetsSpecificPattern, widgetsSpecificImport);
    modified = true;
    console.log(`Fixed specific widgets import in: ${filePath}`);
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
  
  return modified;
}

// Main execution
console.log('Fixing widgets imports...');
const files = findTsFiles(srcDir);
let totalFixed = 0;

for (const file of files) {
  if (fixImportsInFile(file)) {
    totalFixed++;
  }
}

console.log(`Fixed widgets imports in ${totalFixed} files.`);
