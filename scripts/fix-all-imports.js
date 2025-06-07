#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import patterns to fix
const importPatterns = [
  {
    pattern: /@orpheus\/types\/types/,
    replacements: {
      'BaseClipComponentProps': '@orpheus/types/components',
      'TimelinePosition': '@orpheus/types/core',
      'SnapGridSizeOption': '@orpheus/types/core',
      'Track': '@orpheus/types/core',
      'Clip': '@orpheus/types/core',
      'Effect': '@orpheus/types/core',
      'AutomationLane': '@orpheus/types/core',
      'AutomationNode': '@orpheus/types/core',
      'AutomationMode': '@orpheus/types/core',
      'AutomationLaneEnvelope': '@orpheus/types/core',
      'ContextMenuType': '@orpheus/types/core',
      'Region': '@orpheus/types/core',
      'TrackType': '@orpheus/types/core',
      'BaseEffect': '@orpheus/types/core',
      'FXChainPreset': '@orpheus/types/core'
    }
  },
  {
    pattern: /@orpheus\/utils\/utils/,
    replacements: {
      'sliceClip': '@orpheus/utils/audio',
      'formatDuration': '@orpheus/utils/time',
      'measureSeconds': '@orpheus/utils/time',
      'formatPanning': '@orpheus/utils/audio',
      'getVolumeGradient': '@orpheus/utils/audio'
    }
  }
];

function findTsFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && item !== 'dist' && item !== 'build') {
      findTsFiles(fullPath, files);
    } else if (stat.isFile() && /\.(ts|tsx)$/.test(item)) {
      files.push(fullPath);
    }
  }
  return files;
}

function fixImports() {
  const srcDir = path.join(__dirname, '..', 'src');
  console.log('Looking for TypeScript files in:', srcDir);
  const tsFiles = findTsFiles(srcDir);
  console.log('Found', tsFiles.length, 'TypeScript files');
  let fixedFiles = 0;
  let skippedFiles = 0;

  for (const file of tsFiles) {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    for (const { pattern, replacements } of importPatterns) {
      const importMatches = content.match(/import\s*{([^}]+)}\s*from\s*['"]([^'"]+)['"]/g);
      
      if (importMatches && pattern.test(content)) {
        const newImports = new Map();
        
        importMatches.forEach(match => {
          if (pattern.test(match)) {
            const imports = match.match(/{\s*([^}]+)\s*}/)[1].split(',').map(s => s.trim());
            
            imports.forEach(imp => {
              const type = imp.split(' as ')[0].trim();
              if (replacements[type]) {
                const newPath = replacements[type];
                if (!newImports.has(newPath)) {
                  newImports.set(newPath, new Set());
                }
                newImports.get(newPath).add(imp);
              }
            });
            
            content = content.replace(match, '');
            modified = true;
          }
        });

        if (modified) {
          const newImportStatements = Array.from(newImports.entries())
            .map(([path, types]) => `import { ${Array.from(types).join(', ')} } from '${path}';`)
            .join('\n');
          
          content = newImportStatements + '\n' + content.trimStart();
          fs.writeFileSync(file, content);
          console.log(`✅ Fixed imports in: ${path.relative(srcDir, file)}`);
          fixedFiles++;
        }
      }
    }

    if (!modified) {
      skippedFiles++;
    }
  }

  console.log(`\n🎉 Fixed imports in ${fixedFiles} files!`);
  console.log(`ℹ️ Skipped ${skippedFiles} files that didn't need changes.`);
}

fixImports();
