#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { createFolderStructure } = require('./create-folder-structure');

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m"
};

const requiredDirectories = [
  'OEW-main',
  'workstation',
  'scripts',
  'python'
];

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function logHeader(message) {
    console.log('\n' + '='.repeat(60));
    log(`${colors.bold}${message}`, colors.cyan);
    console.log('='.repeat(60));
}

function runCommand(command, description, options = {}) {
    try {
        log(`🔄 ${description}...`, colors.blue);
        const result = execSync(command, {
            stdio: options.silent ? 'pipe' : 'inherit',
            encoding: 'utf8',
            ...options
        });
        log(`✅ ${description} completed`, colors.green);
        return result;
    } catch (error) {
        log(`❌ ${description} failed: ${error.message}`, colors.red);
        if (!options.optional) {
            process.exit(1);
        }
        return null;
    }
}

function checkGitRepository() {
    try {
        execSync('git rev-parse --git-dir', { stdio: 'pipe' });
        return true;
    } catch (error) {
        return false;
    }
}

function setupSubmodules() {
    logHeader('Setting up Git Submodules');
    
    if (!checkGitRepository()) {
        log('⚠️  Not a git repository, skipping submodule setup', colors.yellow);
        return;
    }

    // Check if .gitmodules exists
    if (!fs.existsSync('.gitmodules')) {
        log('ℹ️  No .gitmodules file found, skipping submodule setup', colors.blue);
        return;
    }

    // Initialize and update submodules
    runCommand('git submodule init', 'Initialize submodules');
    runCommand('git submodule update --recursive', 'Update submodules');
    
    // Optionally update to latest remote commits
    if (process.argv.includes('--update-remote')) {
        runCommand('git submodule update --remote --recursive', 'Update submodules to latest remote commits', { optional: true });
    }

    // Show submodule status
    try {
        const status = execSync('git submodule status', { encoding: 'utf8' });
        log('📋 Submodule status:', colors.cyan);
        status.split('\n').forEach(line => {
            if (line.trim()) {
                log(`  ${line}`, colors.reset);
            }
        });
    } catch (error) {
        log('⚠️  Could not get submodule status', colors.yellow);
    }
}

function setupPython() {
    logHeader('Setting up Python Dependencies');
    
    const pythonSetupScript = path.join(__dirname, 'setup-python.js');
    if (fs.existsSync(pythonSetupScript)) {
        runCommand(`node "${pythonSetupScript}"`, 'Setup Python environment');
    } else {
        log('⚠️  Python setup script not found, skipping', colors.yellow);
    }
}

function fixPermissions() {
    logHeader('Fixing Permissions');
    
    // Check if npm permissions need fixing
    try {
        const npmPath = require('os').homedir() + '/.npm';
        if (fs.existsSync(npmPath)) {
            const stats = fs.statSync(npmPath);
            const userId = require('os').userInfo().uid;
            if (stats.uid !== userId) {
                log('⚠️  npm permissions may need fixing. You can run: sudo chown -R $(id -u):$(id -g) "$HOME/.npm"', colors.yellow);
            } else {
                log('✅ npm permissions are correct', colors.green);
            }
        }
    } catch (error) {
        log('ℹ️  Could not check npm permissions', colors.blue);
    }
    
    // Make scripts executable (this doesn't require sudo)
    runCommand('find . -type f -name "*.sh" -exec chmod +x {} \\;', 'Make shell scripts executable', { optional: true });
}

function checkNodeDependencies() {
    logHeader('Checking Node.js Dependencies');
    
    if (!fs.existsSync('node_modules')) {
        log('📦 Installing Node.js dependencies...', colors.blue);
        runCommand('npm install', 'Install Node.js dependencies');
    } else {
        log('✅ Node.js dependencies already installed', colors.green);
    }
}

function checkWorkspaceStructure() {
    logHeader('Checking Workspace Structure');
    
    const requiredDirs = [
        'scripts',
        'electron',
        'workstation',
        'OEW-main'
    ];
    
    const requiredFiles = [
        'package.json',
        'tsconfig.json',
        'requirements.txt'
    ];
    
    let allGood = true;
    
    requiredDirs.forEach(dir => {
        if (fs.existsSync(dir)) {
            log(`✅ Found directory: ${dir}`, colors.green);
        } else {
            log(`❌ Missing directory: ${dir}`, colors.red);
            allGood = false;
        }
    });
    
    requiredFiles.forEach(file => {
        if (fs.existsSync(file)) {
            log(`✅ Found file: ${file}`, colors.green);
        } else {
            log(`❌ Missing file: ${file}`, colors.red);
            allGood = false;
        }
    });
    
    if (!allGood) {
        log('\n⚠️  Some required files or directories are missing.', colors.yellow);
        log('This might indicate the submodules need to be updated or the project structure is incomplete.', colors.yellow);
        log('Try running: npm run setup-submodules', colors.blue);
    }
}

function checkAndCreateDirectories() {
  console.log('Checking required directories...');
  
  requiredDirectories.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(dirPath)) {
      console.log(`Creating directory: ${dir}`);
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
}

function setupProject() {
  console.log('Setting up project structure...');
  
  // Create the required folder structure
  createFolderStructure();
  
  // Check for required files in workstation directory
  const workstationDir = path.join(process.cwd(), 'workstation');
  
  // Simple check to make sure we created the structure correctly
  if (!fs.existsSync(workstationDir)) {
    console.error('❌ Failed to create workstation directory');
    process.exit(1);
  }
  
  // Copy main.py if it doesn't exist
  const mainPyPath = path.join(workstationDir, 'backend', 'main.py');
  if (!fs.existsSync(mainPyPath)) {
    console.log('Creating main.py in backend directory');
    const mainPyContent = `#!/usr/bin/env python3
# Simple Flask server for development
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def hello_world():
    return jsonify({"status": "ok", "message": "Orpheus Engine Backend is running"})

if __name__ == '__main__':
    import os
    port = int(os.environ.get('BACKEND_PORT', 5001))
    debug = os.environ.get('DEVELOPMENT', 'false').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
`;
    fs.mkdirSync(path.dirname(mainPyPath), { recursive: true });
    fs.writeFileSync(mainPyPath, mainPyContent);
  }
  
  console.log('✅ Project setup completed successfully');
}

function main() {
    logHeader('🎵 Orpheus Engine Project Setup');
    
    // Change to project root directory
    const projectRoot = path.resolve(__dirname, '..');
    process.chdir(projectRoot);
    
    log(`📁 Working directory: ${process.cwd()}`, colors.blue);
    
    // Run setup steps
    try {
        fixPermissions();
        setupSubmodules();
        checkNodeDependencies();
        setupPython();
        checkWorkspaceStructure();
        checkAndCreateDirectories();
        setupProject();
        
        logHeader('🎉 Setup Complete!');
        log('Your Orpheus Engine project is now ready!', colors.green);
        log('\nNext steps:', colors.cyan);
        log('  • Run "npm start" to launch the integrated DAW', colors.blue);
        log('  • Run "npm run system-check" to verify everything is working', colors.blue);
        log('  • Run "npm run clear-ports" if you encounter port conflicts', colors.blue);
        
    } catch (error) {
        log(`\n❌ Setup failed: ${error.message}`, colors.red);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { setupSubmodules, setupPython, fixPermissions };
