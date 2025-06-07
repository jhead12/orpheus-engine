#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const chalk = require('chalk') || { green: (t) => `✅ ${t}`, yellow: (t) => `⚠️ ${t}`, blue: (t) => `ℹ️ ${t}` };

// Console styling
const log = {
  info: (msg) => console.log(chalk.blue(msg)),
  success: (msg) => console.log(chalk.green(msg)),
  warn: (msg) => console.log(chalk.yellow(msg)),
  title: (msg) => console.log(`\n${'-'.repeat(80)}\n${msg}\n${'-'.repeat(80)}`)
};

// Paths to config files
const rootDir = path.resolve(__dirname, '..');
const tsConfigPath = path.join(rootDir, 'tsconfig.json');
const viteConfigPath = path.join(rootDir, 'vite.config.ts');
const vitestConfigPath = path.join(rootDir, 'vitest.config.ts');

// Path aliases to add
const aliases = {
  '@orpheus/*': 'src/*',
  '@orpheus/components/*': 'src/components/*',
  '@orpheus/services/*': 'src/services/*',
  '@orpheus/screens/*': 'src/screens/*',
  '@orpheus/contexts': 'src/contexts/index',
  '@orpheus/types/*': 'src/services/types/*',
  '@orpheus/test/*': 'src/test/*',
  '@orpheus/utils/*': 'src/services/utils/*',
  '@orpheus/widgets/*': 'src/components/widgets/*',
  '@orpheus/workstation/*': 'src/screens/workstation/*'
};

// Check and update TypeScript config
function checkTsConfig() {
  log.title('Checking TypeScript configuration');

  if (!fs.existsSync(tsConfigPath)) {
    log.warn(`tsconfig.json not found at ${tsConfigPath}`);
    return;
  }

  try {
    const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
    const hasPathsConfig = tsConfig.compilerOptions && tsConfig.compilerOptions.paths;

    if (!hasPathsConfig) {
      log.warn('Paths configuration not found in tsconfig.json');
      return;
    }

    let allAliasesExist = true;
    for (const alias in aliases) {
      if (!tsConfig.compilerOptions.paths[alias]) {
        allAliasesExist = false;
        break;
      }
    }

    if (allAliasesExist) {
      log.success('TypeScript path aliases are already configured correctly.');
    } else {
      log.warn('Some TypeScript path aliases are missing or incorrect.');
    }
  } catch (error) {
    log.warn(`Error reading tsconfig.json: ${error.message}`);
  }
}

// Check Vite config
function checkViteConfig() {
  log.title('Checking Vite configuration');

  if (!fs.existsSync(viteConfigPath)) {
    log.warn(`vite.config.ts not found at ${viteConfigPath}`);
    return;
  }

  try {
    const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');

    // Check if all aliases are present
    let allAliasesExist = true;
    for (const alias in aliases) {
      const aliasKey = alias.replace(/\/\*$/, '');
      if (!viteConfig.includes(`"${aliasKey}":`)) {
        allAliasesExist = false;
        break;
      }
    }

    if (allAliasesExist) {
      log.success('Vite path aliases are already configured correctly.');
    } else {
      log.warn('Some Vite path aliases are missing or incorrect.');
    }
  } catch (error) {
    log.warn(`Error reading vite.config.ts: ${error.message}`);
  }
}

// Check Vitest config
function checkVitestConfig() {
  log.title('Checking Vitest configuration');

  if (!fs.existsSync(vitestConfigPath)) {
    log.warn(`vitest.config.ts not found at ${vitestConfigPath}`);
    return;
  }

  try {
    const vitestConfig = fs.readFileSync(vitestConfigPath, 'utf8');

    // Check if resolve.alias section exists
    if (!vitestConfig.includes('resolve: {') || !vitestConfig.includes('alias: {')) {
      log.warn('Vitest config does not have resolve.alias section');
      return;
    }

    // Check if all aliases are present
    let allAliasesExist = true;
    for (const alias in aliases) {
      const aliasKey = alias.replace(/\/\*$/, '');
      if (!vitestConfig.includes(`"${aliasKey}":`)) {
        allAliasesExist = false;
        break;
      }
    }

    if (allAliasesExist) {
      log.success('Vitest path aliases are already configured correctly.');
    } else {
      log.warn('Some Vitest path aliases are missing or incorrect.');
    }
  } catch (error) {
    log.warn(`Error reading vitest.config.ts: ${error.message}`);
  }
}

// Find components to refactor and update imports
function findAndSuggestRefactoring() {
  log.title('Finding files to refactor');

  const componentsDir = path.join(rootDir, 'src/components');
  const screensDir = path.join(rootDir, 'src/screens');
  const servicesDir = path.join(rootDir, 'src/services');

  if (!fs.existsSync(componentsDir) && !fs.existsSync(screensDir) && !fs.existsSync(servicesDir)) {
    log.warn('Cannot find component directories to scan');
    return;
  }

  let exampleFiles = [];

  // Find files with deep relative imports
  const checkDir = (dir, depth = 0) => {
    if (depth > 5) return; // Avoid going too deep

    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        checkDir(filePath, depth + 1);
      } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');

          // Look for deep relative imports
          if (content.includes('../../../') || content.includes('../../../../')) {
            exampleFiles.push({
              path: filePath,
              relativePath: path.relative(rootDir, filePath),
              hasDeepImports: true
            });
          }
        } catch (error) {
          // Skip files we can't read
        }
      }
    }
  };

  // Check components, screens, and services directories
  checkDir(componentsDir);
  checkDir(screensDir);
  checkDir(servicesDir);

  // Display results
  if (exampleFiles.length > 0) {
    log.info(`Found ${exampleFiles.length} files with deep relative imports that could be refactored.`);

    // Show the top 5 files as examples
    const examples = exampleFiles.slice(0, 5);

    examples.forEach(file => {
      log.info(`- ${file.relativePath}`);
    });

    if (exampleFiles.length > 5) {
      log.info(`... and ${exampleFiles.length - 5} more files`);
    }

    log.info('\nTo refactor these imports, you can run the interactive tool:');
    log.info('  pnpm run refactor:imports');
  } else {
    log.success('No files with deep relative imports found.');
  }
}

// Show how to use the aliases
function showUsageExamples() {
  log.title('Usage Examples');
  console.log(`
Instead of using deep relative imports like:
  import { WorkstationContext } from "../../../contexts";
  import { Track } from "../../../services/types/types";

You can now use path aliases:
  import { WorkstationContext } from "@orpheus/contexts";
  import { Track } from "@orpheus/types/types";

Other available aliases include:
  @orpheus/components/*      → src/components/*
  @orpheus/screens/*         → src/screens/*
  @orpheus/services/*        → src/services/*
  @orpheus/widgets/*         → src/components/widgets/*
  @orpheus/workstation/*     → src/screens/workstation/*
  @orpheus/utils/*           → src/services/utils/*
  @orpheus/test/*            → src/test/*

Example usages:
  import { IconButton } from "@orpheus/components/widgets/IconButton";
  import { TrackComponent } from "@orpheus/workstation/components/TrackComponent";
  import { formatVolume } from "@orpheus/utils/format";
  import { expectScreenshot } from "@orpheus/test/helpers";
`);
}

// Update package.json to add refactor:imports script
function updatePackageJson() {
  const packageJsonPath = path.join(rootDir, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    log.warn('package.json not found');
    return;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Add the script only if it doesn't already exist
    if (!packageJson.scripts || !packageJson.scripts['setup:aliases']) {
      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts['setup:aliases'] = 'node scripts/setup-aliases.js';
      packageJson.scripts['refactor:imports'] = 'node scripts/refactor-imports.js';

      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      log.success('Added setup:aliases and refactor:imports scripts to package.json');
    } else {
      log.info('Scripts already exist in package.json');
    }
  } catch (error) {
    log.warn(`Error updating package.json: ${error.message}`);
  }
}

// Create the refactor-imports.js script
function createRefactorScript() {
  const refactorScriptPath = path.join(rootDir, 'scripts', 'refactor-imports.js');

  if (fs.existsSync(refactorScriptPath)) {
    log.info('refactor-imports.js already exists, skipping creation');
    return;
  }

  const scriptContent = `#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Path aliases mapping
const aliases = {
  '@orpheus/components': 'src/components',
  '@orpheus/services': 'src/services',
  '@orpheus/screens': 'src/screens',
  '@orpheus/contexts': 'src/contexts',
  '@orpheus/types': 'src/services/types',
  '@orpheus/test': 'src/test',
  '@orpheus/utils': 'src/services/utils',
  '@orpheus/widgets': 'src/components/widgets',
  '@orpheus/workstation': 'src/screens/workstation'
};

// Root directory
const rootDir = path.resolve(__dirname, '..');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ask a yes/no question
function askYesNo(question) {
  return new Promise((resolve) => {
    rl.question(question + ' (y/n): ', (answer) => {
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

// Find files with deep relative imports
async function findFilesToRefactor() {
  console.log('\\nScanning for files with deep relative imports...');

  const filesToRefactor = [];

  const checkDir = (dir, depth = 0) => {
    if (depth > 5) return; // Avoid going too deep

    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        if (file !== 'node_modules' && file !== '.git' && file !== 'build') {
          checkDir(filePath, depth + 1);
        }
      } else if (/\\.(ts|tsx|js|jsx)$/.test(file)) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');

          // Look for deep relative imports
          if (content.includes('../../../') || content.includes('../../../../')) {
            filesToRefactor.push({
              path: filePath,
              relativePath: path.relative(rootDir, filePath)
            });
          }
        } catch (error) {
          // Skip files we can't read
        }
      }
    }
  };

  checkDir(rootDir);

  console.log(\`Found \${filesToRefactor.length} files with deep relative imports\\n\`);
  return filesToRefactor;
}

// Refactor imports in a file
async function refactorFile(file) {
  console.log(\`Processing: \${file.relativePath}\`);

  try {
    const content = fs.readFileSync(file.path, 'utf8');
    const lines = content.split('\\n');
    let refactoredLines = [];
    let modified = false;

    // Get file directory to resolve relative paths
    const fileDir = path.dirname(file.path);

    for (let line of lines) {
      // Check for import with relative paths going up multiple levels
      const importMatch = line.match(/^\\s*import\\s+(.*)\\s+from\\s+["'](\\.\\.\\/){2,}([^"']+)["'];?/);

      if (importMatch) {
        const importedItems = importMatch[1];
        const relativePath = importMatch[2].repeat(importMatch[2].split('/').length - 1) + importMatch[3];

        // Resolve the absolute path of the imported file
        const absoluteImportPath = path.resolve(fileDir, relativePath);
        const relativeToRoot = path.relative(rootDir, absoluteImportPath);

        // Check if this can be replaced with a path alias
        let replaced = false;
        for (const [alias, aliasPath] of Object.entries(aliases)) {
          if (relativeToRoot.startsWith(aliasPath)) {
            // Replace with alias
            const restOfPath = relativeToRoot.substring(aliasPath.length);
            const newImport = \`import \${importedItems} from "\${alias}\${restOfPath.startsWith('/') ? '' : '/'}\${restOfPath}";\`;
            refactoredLines.push(newImport);
            replaced = true;
            modified = true;
            break;
          }
        }

        // If not replaced, keep original
        if (!replaced) {
          refactoredLines.push(line);
        }
      } else {
        refactoredLines.push(line);
      }
    }

    if (modified) {
      // Ask if user wants to apply changes
      const apply = await askYesNo(\`Apply changes to \${file.relativePath}?\`);

      if (apply) {
        fs.writeFileSync(file.path, refactoredLines.join('\\n'));
        console.log(\`✅ Updated \${file.relativePath}\\n\`);
      } else {
        console.log(\`⏭️ Skipped \${file.relativePath}\\n\`);
      }

      return apply;
    } else {
      console.log(\`⚠️ No refactorable imports found in \${file.relativePath}\\n\`);
      return false;
    }
  } catch (error) {
    console.error(\`❌ Error processing \${file.relativePath}: \${error.message}\\n\`);
    return false;
  }
}

// Main function
async function main() {
  console.log('\\n==== Import Path Refactoring Tool ====\\n');
  console.log('This tool will help you refactor deep relative imports to use path aliases.');

  const files = await findFilesToRefactor();

  if (files.length === 0) {
    console.log('No files to refactor!');
    rl.close();
    return;
  }

  const refactorAll = await askYesNo(\`Refactor all \${files.length} files?\`);

  if (refactorAll) {
    let count = 0;
    for (const file of files) {
      const refactored = await refactorFile(file);
      if (refactored) count++;
    }
    console.log(\`\\nRefactored \${count} out of \${files.length} files.\`);
  } else {
    // Ask individually
    for (const file of files) {
      const processThis = await askYesNo(\`Process \${file.relativePath}?\`);
      if (processThis) {
        await refactorFile(file);
      }
    }
  }

  console.log('\\nRefactoring complete!');
  rl.close();
}

// Run the main function
main().catch(err => {
  console.error('Error:', err);
  rl.close();
});
`;

  fs.writeFileSync(refactorScriptPath, scriptContent);
  fs.chmodSync(refactorScriptPath, 0o755); // Make executable
  log.success('Created refactor-imports.js script');
}

// Main function
function main() {
  log.title('Orpheus Path Aliases Setup');
  log.info('Setting up path aliases for imports to improve code organization');

  checkTsConfig();
  checkViteConfig();
  checkVitestConfig();
  findAndSuggestRefactoring();
  showUsageExamples();
  updatePackageJson();
  createRefactorScript();

  log.title('Setup Complete!');
  log.info('\nYou can now use path aliases in your imports!');
  log.info('\nTo interactively refactor existing imports, run:');
  log.info('  pnpm run refactor:imports');
  log.info('\nThanks for using the Orpheus path aliases setup tool!');
}

main();
