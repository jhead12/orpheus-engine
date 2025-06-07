#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, 'src');

// Find all TypeScript/TSX files
function findFiles(dir, extension = '.tsx') {
  const files = [];
  
  function walk(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        walk(fullPath);
      } else if (stat.isFile() && (item.endsWith('.tsx') || item.endsWith('.ts'))) {
        files.push(fullPath);
      }
    }
  }
  
  walk(dir);
  return files;
}

// Calculate relative path from one file to another
function getRelativePath(fromFile, toFile) {
  const fromDir = path.dirname(fromFile);
  const relativePath = path.relative(fromDir, toFile);
  
  // Ensure it starts with ./ or ../
  if (!relativePath.startsWith('.')) {
    return './' + relativePath;
  }
  return relativePath;
}

// Fix imports in a file
function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Map of problematic imports to their correct paths
  const importMap = {
    '@orpheus/utils/utils': '/workspaces/orpheus-engine/src/services/utils/utils',
    '@orpheus/utils/general': '/workspaces/orpheus-engine/src/services/utils/general'
  };
  
  for (const [wrongImport, correctPath] of Object.entries(importMap)) {
    if (content.includes(wrongImport)) {
      const relativePath = getRelativePath(filePath, correctPath);
      // Remove .ts extension for imports
      const importPath = relativePath.replace(/\.ts$/, '');
      
      content = content.replace(
        new RegExp(`from ['"]${wrongImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g'),
        `from '${importPath}'`
      );
      modified = true;
      console.log(`Fixed ${wrongImport} -> ${importPath} in ${filePath}`);
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
  }
  
  return modified;
}

// Main execution
function main() {
  console.log('Finding all TypeScript files...');
  const files = findFiles(srcDir);
  console.log(`Found ${files.length} files`);
  
  let totalFixed = 0;
  
  for (const file of files) {
    if (fixImportsInFile(file)) {
      totalFixed++;
    }
  }
  
  console.log(`Fixed imports in ${totalFixed} files`);
}

main();
