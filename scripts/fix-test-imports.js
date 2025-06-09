/**
 * fix-test-imports.js
 * 
 * This script automatically fixes import resolution issues in test files.
 * It scans test files for problematic imports and replaces them with correctly
 * resolved paths based on the project's module structure.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const TEST_PATHS = [
  'workstation/frontend/src/**/*.{test,spec}.{js,ts,jsx,tsx}',
  'workstation/frontend/OEW-main/src/**/*.{test,spec}.{js,ts,jsx,tsx}'
];

// Import paths that need to be fixed
const IMPORT_FIXES = [
  {
    // Fix @orpheus/types/core imports in OEW-main
    match: /@orpheus\/types\/core/g,
    test: (filePath) => filePath.includes('OEW-main'),
    replacement: '@orpheus/oew-main/types/core'
  },
  {
    // Fix @orpheus/contexts imports in OEW-main 
    match: /@orpheus\/contexts/g,
    test: (filePath) => filePath.includes('OEW-main'),
    replacement: '@orpheus/oew-main/contexts'
  },
  {
    // Fix relative imports pointing up to the main project from OEW-main
    match: /\.\.\/\.\.\/\.\.\/src\/([\w\/\-]+)/g,
    test: (filePath) => filePath.includes('OEW-main'),
    replacement: (_, path) => `@orpheus/${path}`
  }
];

async function fixImports() {
  try {
    console.log('🔍 Scanning test files for import issues...');
    
    let totalFixed = 0;
    let filesFixed = 0;
    
    // Find all test files
    const testFiles = [];
    for (const pattern of TEST_PATHS) {
      const files = globSync(pattern, { cwd: ROOT_DIR });
      testFiles.push(...files.map(file => path.join(ROOT_DIR, file)));
    }
    
    console.log(`Found ${testFiles.length} test files to scan.`);
    
    // Process each file
    for (const filePath of testFiles) {
      let content;
      try {
        content = fs.readFileSync(filePath, 'utf8');
      } catch (err) {
        console.error(`Error reading file ${filePath}:`, err);
        continue;
      }
      
      let modified = false;
      let fixCount = 0;
      
      // Apply each import fix if it applies to this file
      for (const fix of IMPORT_FIXES) {
        if (fix.test(filePath)) {
          const originalContent = content;
          if (typeof fix.match === 'string') {
            content = content.replace(new RegExp(fix.match, 'g'), fix.replacement);
          } else {
            content = content.replace(fix.match, (match, ...args) => {
              if (typeof fix.replacement === 'function') {
                return fix.replacement(match, ...args);
              }
              return fix.replacement;
            });
          }
          
          if (content !== originalContent) {
            modified = true;
            fixCount++;
          }
        }
      }
      
      if (modified) {
        try {
          fs.writeFileSync(filePath, content);
          console.log(`✅ Fixed ${fixCount} import(s) in ${filePath}`);
          totalFixed += fixCount;
          filesFixed++;
        } catch (err) {
          console.error(`Error writing file ${filePath}:`, err);
        }
      }
    }
    
    console.log(`\n🎉 Import fix complete! Fixed ${totalFixed} imports across ${filesFixed} files.`);
  } catch (err) {
    console.error('Error fixing imports:', err);
    process.exit(1);
  }
}

// Run the script
fixImports();

// Run the script
fixImports();
