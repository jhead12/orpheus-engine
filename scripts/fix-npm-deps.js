#!/usr/bin/env node

/**
 * Comprehensive NPM Dependency Fixer
 * Handles common dependency conflicts and version mismatches
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class NPMDependencyFixer {
  constructor() {
    this.workspaceRoot = process.cwd();
    this.fixedPackages = [];
    this.errors = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📋',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      fix: '🔧'
    }[type] || '📋';
    
    console.log(`${prefix} [${timestamp.slice(11, 19)}] ${message}`);
  }

  async findPackageJsonFiles() {
    const packageFiles = [];
    
    const searchDirs = [
      'workstation/frontend',
      'workstation/frontend/OEW-main',
      'workstation/electron/legacy',
      '.' // root
    ];

    for (const dir of searchDirs) {
      const packagePath = path.join(this.workspaceRoot, dir, 'package.json');
      if (fs.existsSync(packagePath)) {
        packageFiles.push({
          path: packagePath,
          dir: dir,
          content: JSON.parse(fs.readFileSync(packagePath, 'utf8'))
        });
      }
    }

    return packageFiles;
  }

  async fixReactRouterConflicts(packageFile) {
    const { content, path: filePath, dir } = packageFile;
    let fixed = false;

    // Check for React Router v6 with v5 types
    if (content.dependencies?.['react-router-dom']?.startsWith('^6') && 
        content.devDependencies?.['@types/react-router-dom']?.startsWith('^5')) {
      
      this.log(`Fixing React Router types mismatch in ${dir}`, 'fix');
      delete content.devDependencies['@types/react-router-dom'];
      fixed = true;
    }

    // Check for React Router v7 with old types
    if (content.dependencies?.['react-router-dom']?.startsWith('^7') && 
        content.devDependencies?.['@types/react-router-dom']) {
      
      this.log(`Removing incompatible React Router types for v7 in ${dir}`, 'fix');
      delete content.devDependencies['@types/react-router-dom'];
      fixed = true;
    }

    return fixed;
  }

  async fixReactTypesConflicts(packageFile) {
    const { content, dir } = packageFile;
    let fixed = false;

    // Check for React 18 with React 19 types
    if (content.dependencies?.react?.includes('18.') && 
        content.devDependencies?.['@types/react']?.includes('19.')) {
      
      this.log(`Fixing React types version mismatch in ${dir}`, 'fix');
      content.devDependencies['@types/react'] = '^18.3.12';
      content.devDependencies['@types/react-dom'] = '^18.3.1';
      fixed = true;
    }

    return fixed;
  }

  async fixTestingLibraryConflicts(packageFile) {
    const { content, dir } = packageFile;
    let fixed = false;

    // Check for @testing-library version conflicts
    const reactTestingVersion = content.devDependencies?.['@testing-library/react'];
    const domTestingVersion = content.devDependencies?.['@testing-library/dom'];

    if (reactTestingVersion?.includes('16.') && domTestingVersion?.includes('9.')) {
      this.log(`Fixing Testing Library version conflicts in ${dir}`, 'fix');
      content.devDependencies['@testing-library/dom'] = '^10.4.0';
      fixed = true;
    }

    return fixed;
  }

  async fixTypescriptConflicts(packageFile) {
    const { content, dir } = packageFile;
    let fixed = false;

    const tsVersion = content.devDependencies?.typescript;
    const eslintParserVersion = content.devDependencies?.['@typescript-eslint/parser'];
    const eslintPluginVersion = content.devDependencies?.['@typescript-eslint/eslint-plugin'];

    // Ensure TypeScript ESLint versions match
    if (tsVersion && eslintParserVersion && eslintPluginVersion) {
      const targetVersion = '^8.33.1';
      if (eslintParserVersion !== targetVersion || eslintPluginVersion !== targetVersion) {
        this.log(`Synchronizing TypeScript ESLint versions in ${dir}`, 'fix');
        content.devDependencies['@typescript-eslint/parser'] = targetVersion;
        content.devDependencies['@typescript-eslint/eslint-plugin'] = targetVersion;
        fixed = true;
      }
    }

    return fixed;
  }

  async fixViteConflicts(packageFile) {
    const { content, dir } = packageFile;
    let fixed = false;

    // Check for Vite plugin conflicts
    const viteVersion = content.devDependencies?.vite;
    const viteReactVersion = content.devDependencies?.['@vitejs/plugin-react'];

    if (viteVersion && viteReactVersion) {
      // Ensure Vite React plugin is compatible
      if (viteVersion.includes('5.') && !viteReactVersion.includes('4.')) {
        this.log(`Updating Vite React plugin for compatibility in ${dir}`, 'fix');
        content.devDependencies['@vitejs/plugin-react'] = '^4.3.4';
        fixed = true;
      }
    }

    return fixed;
  }

  async fixElectronConflicts(packageFile) {
    const { content, dir } = packageFile;
    let fixed = false;

    // Check for Electron builder conflicts
    const electronVersion = content.devDependencies?.electron;
    const electronBuilderVersion = content.devDependencies?.['electron-builder'];

    if (electronVersion && electronBuilderVersion) {
      // Ensure compatible versions
      if (electronVersion.includes('33.') && !electronBuilderVersion.includes('25.')) {
        this.log(`Updating Electron Builder for compatibility in ${dir}`, 'fix');
        content.devDependencies['electron-builder'] = '^25.1.8';
        fixed = true;
      }
    }

    return fixed;
  }

  async writePackageFile(packageFile) {
    const { path: filePath, content } = packageFile;
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n');
    this.log(`Updated ${filePath}`, 'success');
  }

  async runNpmInstall(dir) {
    try {
      this.log(`Running npm install in ${dir}...`);
      const cwd = path.join(this.workspaceRoot, dir);
      execSync('npm install --legacy-peer-deps', { 
        cwd, 
        stdio: 'inherit',
        timeout: 120000 // 2 minutes timeout
      });
      this.log(`npm install completed in ${dir}`, 'success');
    } catch (error) {
      this.log(`npm install failed in ${dir}: ${error.message}`, 'error');
      this.errors.push(`npm install failed in ${dir}`);
    }
  }

  async runNpmAuditFix(dir) {
    try {
      this.log(`Running npm audit fix in ${dir}...`);
      const cwd = path.join(this.workspaceRoot, dir);
      execSync('npm audit fix --legacy-peer-deps', { 
        cwd, 
        stdio: 'inherit',
        timeout: 60000 // 1 minute timeout
      });
      this.log(`npm audit fix completed in ${dir}`, 'success');
    } catch (error) {
      this.log(`npm audit fix failed in ${dir}: ${error.message}`, 'warning');
      // Don't add to errors as audit fix failures are often non-critical
    }
  }

  async fixAllDependencies() {
    this.log('🚀 Starting NPM Dependency Fixer...', 'info');
    
    const packageFiles = await this.findPackageJsonFiles();
    this.log(`Found ${packageFiles.length} package.json files`, 'info');

    for (const packageFile of packageFiles) {
      this.log(`\n📦 Processing ${packageFile.dir}/package.json`, 'info');
      
      let hasChanges = false;

      // Apply all fix methods
      const fixMethods = [
        this.fixReactRouterConflicts,
        this.fixReactTypesConflicts,
        this.fixTestingLibraryConflicts,
        this.fixTypescriptConflicts,
        this.fixViteConflicts,
        this.fixElectronConflicts
      ];

      for (const fixMethod of fixMethods) {
        const fixed = await fixMethod.call(this, packageFile);
        if (fixed) hasChanges = true;
      }

      if (hasChanges) {
        await this.writePackageFile(packageFile);
        this.fixedPackages.push(packageFile.dir);
        
        // Run npm install after fixing
        await this.runNpmInstall(packageFile.dir);
        await this.runNpmAuditFix(packageFile.dir);
      } else {
        this.log(`No fixes needed for ${packageFile.dir}`, 'info');
      }
    }

    // Summary
    this.log('\n📋 Summary:', 'info');
    if (this.fixedPackages.length > 0) {
      this.log(`Fixed packages: ${this.fixedPackages.join(', ')}`, 'success');
    } else {
      this.log('No packages needed fixing', 'success');
    }

    if (this.errors.length > 0) {
      this.log(`Errors encountered: ${this.errors.length}`, 'warning');
      this.errors.forEach(error => this.log(error, 'error'));
    }

    this.log('✅ NPM Dependency Fixer completed!', 'success');
  }
}

// CLI interface
if (require.main === module) {
  const fixer = new NPMDependencyFixer();
  
  // Handle command line arguments
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
NPM Dependency Fixer

Usage: node fix-npm-deps.js [options]

Options:
  --help, -h     Show this help message
  --version, -v  Show version information

Fixes:
  • React Router type mismatches (v5 types with v6+ router)
  • React type version conflicts (React 18 with React 19 types)
  • Testing Library version conflicts
  • TypeScript ESLint version mismatches
  • Vite plugin compatibility issues
  • Electron builder compatibility issues

Examples:
  npm run fix-npm-deps
  node scripts/fix-npm-deps.js
`);
    process.exit(0);
  }

  if (args.includes('--version') || args.includes('-v')) {
    console.log('NPM Dependency Fixer v1.0.0');
    process.exit(0);
  }

  fixer.fixAllDependencies().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = NPMDependencyFixer;
