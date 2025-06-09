#!/usr/bin/env node

/**
 * Fix Electron Path Script
 * Resolves common Electron path issues and ensures proper configuration
 * for development and production environments.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ElectronPathFixer {
  constructor() {
    this.basePath = process.cwd();
    this.electronPath = path.join(this.basePath, 'node_modules', '.bin', 'electron');
    this.mainJsPath = path.join(this.basePath, 'build', 'electron', 'main.js');
    this.packageJsonPath = path.join(this.basePath, 'package.json');
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m', // cyan
      success: '\x1b[32m', // green
      warning: '\x1b[33m', // yellow
      error: '\x1b[31m', // red
      reset: '\x1b[0m'
    };

    console.log(`${colors[type]}${message}${colors.reset}`);
  }

  async fixMainPath() {
    try {
      const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));
      const currentMainPath = packageJson.main;
      const correctMainPath = 'build/electron/main.js';

      if (currentMainPath !== correctMainPath) {
        packageJson.main = correctMainPath;
        fs.writeFileSync(this.packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
        this.log('✅ Fixed main path in package.json', 'success');
      } else {
        this.log('✓ Main path is correctly configured', 'info');
      }
    } catch (error) {
      this.log(`❌ Error fixing main path: ${error.message}`, 'error');
    }
  }

  async fixElectronBuildConfig() {
    try {
      const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));
      
      if (!packageJson.build) {
        packageJson.build = {};
      }

      // Ensure correct build configuration
      packageJson.build = {
        ...packageJson.build,
        extraMetadata: {
          main: 'build/electron/main.js'
        },
        files: [
          'build/**/*'
        ]
      };

      fs.writeFileSync(this.packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
      this.log('✅ Fixed electron-builder configuration', 'success');
    } catch (error) {
      this.log(`❌ Error fixing electron-builder config: ${error.message}`, 'error');
    }
  }

  async verifyElectronInstallation() {
    try {
      if (!fs.existsSync(this.electronPath)) {
        this.log('⚠️ Electron binary not found, attempting to fix...', 'warning');
        execSync('npm install electron@latest --save-dev', { stdio: 'inherit' });
        this.log('✅ Electron reinstalled successfully', 'success');
      } else {
        this.log('✓ Electron is properly installed', 'info');
      }
    } catch (error) {
      this.log(`❌ Error verifying electron installation: ${error.message}`, 'error');
    }
  }

  async createBuildDirectories() {
    const buildPaths = [
      path.join(this.basePath, 'build'),
      path.join(this.basePath, 'build', 'electron')
    ];

    for (const buildPath of buildPaths) {
      if (!fs.existsSync(buildPath)) {
        fs.mkdirSync(buildPath, { recursive: true });
        this.log(`✅ Created directory: ${buildPath}`, 'success');
      }
    }
  }

  async fixAll() {
    this.log('🔧 Starting Electron path fixes...', 'info');
    
    await this.verifyElectronInstallation();
    await this.createBuildDirectories();
    await this.fixMainPath();
    await this.fixElectronBuildConfig();
    
    this.log('✨ Electron path fixes completed!', 'success');
  }
}

// Run the fixer if this script is executed directly
if (require.main === module) {
  const fixer = new ElectronPathFixer();
  fixer.fixAll().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = ElectronPathFixer;
