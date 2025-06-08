#!/usr/bin/env node

/**
 * Setup script for Orpheus Engine Web Demo
 * Ensures Python dependencies are installed and Jupyter is ready
 */

const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DEMO_DIR = path.join(PROJECT_ROOT, 'demo');
const REQUIREMENTS_FILE = path.join(PROJECT_ROOT, 'requirements.txt');

console.log('🎛️ Setting up Orpheus Engine Web Demo...\n');

function checkCommand(command) {
    return new Promise((resolve) => {
        exec(`which ${command}`, (error) => {
            resolve(!error);
        });
    });
}

async function installPythonDeps() {
    console.log('📦 Installing Python dependencies...');
    
    const hasPip = await checkCommand('pip');
    const hasPip3 = await checkCommand('pip3');
    
    if (!hasPip && !hasPip3) {
        console.error('❌ pip or pip3 not found. Please install Python and pip first.');
        process.exit(1);
    }
    
    const pipCommand = hasPip3 ? 'pip3' : 'pip';
    
    return new Promise((resolve, reject) => {
        const install = spawn(pipCommand, ['install', '-r', REQUIREMENTS_FILE], {
            stdio: 'inherit',
            cwd: PROJECT_ROOT
        });
        
        install.on('close', (code) => {
            if (code === 0) {
                console.log('✅ Python dependencies installed successfully\n');
                resolve();
            } else {
                console.error('❌ Failed to install Python dependencies');
                reject(new Error(`pip install failed with code ${code}`));
            }
        });
    });
}

async function checkJupyter() {
    console.log('🔍 Checking Jupyter installation...');
    
    const hasJupyter = await checkCommand('jupyter');
    const hasJupyterLab = await checkCommand('jupyter-lab');
    
    if (!hasJupyter) {
        console.error('❌ Jupyter not found. Installing...');
        await installPythonDeps();
    } else {
        console.log('✅ Jupyter found');
    }
    
    if (hasJupyterLab) {
        console.log('✅ JupyterLab found');
        return 'lab';
    } else {
        console.log('📓 Using Jupyter Notebook (JupyterLab not available)');
        return 'notebook';
    }
}

async function launchDemo(jupyterType) {
    console.log('\n🚀 Launching Orpheus Engine Web Demo...');
    
    const command = jupyterType === 'lab' ? 'jupyter-lab' : 'jupyter';
    const args = jupyterType === 'lab' ? ['OrpheusWebDemo.ipynb'] : ['notebook', 'OrpheusWebDemo.ipynb'];
    
    console.log(`📂 Demo directory: ${DEMO_DIR}`);
    console.log(`🌐 Opening: ${command} ${args.join(' ')}\n`);
    
    const jupyter = spawn(command, args, {
        stdio: 'inherit',
        cwd: DEMO_DIR
    });
    
    jupyter.on('error', (error) => {
        console.error('❌ Failed to launch Jupyter:', error.message);
        process.exit(1);
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down demo...');
        jupyter.kill('SIGINT');
        process.exit(0);
    });
}

async function main() {
    try {
        // Check if demo directory exists
        if (!fs.existsSync(DEMO_DIR)) {
            console.error(`❌ Demo directory not found: ${DEMO_DIR}`);
            process.exit(1);
        }
        
        // Check if requirements file exists
        if (!fs.existsSync(REQUIREMENTS_FILE)) {
            console.error(`❌ Requirements file not found: ${REQUIREMENTS_FILE}`);
            process.exit(1);
        }
        
        // Install dependencies and check Jupyter
        await installPythonDeps();
        const jupyterType = await checkJupyter();
        
        // Launch the demo
        await launchDemo(jupyterType);
        
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    }
}

// Run setup if called directly
if (require.main === module) {
    main();
}

module.exports = { main };
