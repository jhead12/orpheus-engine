#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function logHeader(message) {
    console.log('\n' + '='.repeat(60));
    log(`${colors.bold}${message}`, colors.cyan);
    console.log('='.repeat(60));
}

function checkCommand(command, name) {
    try {
        execSync(command, { stdio: 'pipe' });
        log(`✅ ${name} is available`, colors.green);
        return true;
    } catch (error) {
        log(`❌ ${name} is not available`, colors.red);
        return false;
    }
}

function checkFile(filePath, name) {
    if (fs.existsSync(filePath)) {
        log(`✅ ${name} exists`, colors.green);
        return true;
    } else {
        log(`❌ ${name} is missing`, colors.red);
        return false;
    }
}

function checkDirectory(dirPath, name) {
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
        log(`✅ ${name} directory exists`, colors.green);
        return true;
    } else {
        log(`❌ ${name} directory is missing`, colors.red);
        return false;
    }
}

function checkSubmodules() {
    try {
        const status = execSync('git submodule status', { encoding: 'utf8' });
        if (status.trim()) {
            log(`✅ Git submodules are initialized`, colors.green);
            status.split('\n').forEach(line => {
                if (line.trim()) {
                    log(`  ${line.trim()}`, colors.blue);
                }
            });
            return true;
        } else {
            log(`⚠️  No git submodules found`, colors.yellow);
            return false;
        }
    } catch (error) {
        log(`❌ Could not check git submodules: ${error.message}`, colors.red);
        return false;
    }
}

function main() {
    logHeader('🎵 Orpheus Engine Setup Verification');
    
    let allGood = true;
    
    // Check system requirements
    logHeader('System Requirements');
    allGood &= checkCommand('node --version', 'Node.js');
    allGood &= checkCommand('npm --version', 'npm');
    allGood &= checkCommand('git --version', 'Git');
    checkCommand('python3 --version', 'Python 3') || checkCommand('python --version', 'Python');
    
    // Check project structure
    logHeader('Project Structure');
    allGood &= checkFile('package.json', 'package.json');
    allGood &= checkFile('tsconfig.json', 'tsconfig.json');
    allGood &= checkDirectory('scripts', 'scripts');
    allGood &= checkDirectory('electron', 'electron');
    allGood &= checkDirectory('OEW-main', 'OEW-main (DAW)');
    allGood &= checkDirectory('workstation', 'workstation (submodule)');
    
    // Check submodules
    logHeader('Git Submodules');
    checkSubmodules();
    
    // Check key files
    logHeader('Key Configuration Files');
    allGood &= checkFile('electron/main.ts', 'Electron main process');
    allGood &= checkFile('electron/service-manager.ts', 'Service manager');
    allGood &= checkFile('startup.html', 'Startup UI');
    allGood &= checkFile('OEW-main/package.json', 'DAW package.json');
    allGood &= checkFile('workstation/backend/config.py', 'Backend configuration');
    
    // Check dependencies
    logHeader('Dependencies');
    const hasNodeModules = checkDirectory('node_modules', 'Root node_modules');
    const hasDAWDeps = checkDirectory('OEW-main/node_modules', 'DAW node_modules');
    
    // Final summary
    logHeader('Setup Summary');
    if (allGood && hasNodeModules) {
        log('🎉 Setup verification completed successfully!', colors.green);
        log('✅ All critical components are in place', colors.green);
        log('\nYou can now start the application with:', colors.cyan);
        log('  npm start', colors.blue);
    } else {
        log('⚠️  Some components may be missing or need attention', colors.yellow);
        log('\nTo fix setup issues, try:', colors.cyan);
        log('  npm run setup-project', colors.blue);
        log('  npm install', colors.blue);
    }
    
    log('\nFor troubleshooting, see SETUP.md', colors.blue);
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { main };
