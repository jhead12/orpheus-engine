#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function runCommand(command, description) {
    try {
        log(`🔄 ${description}...`, colors.blue);
        execSync(command, { stdio: 'inherit' });
        log(`✅ ${description} completed`, colors.green);
        return true;
    } catch (error) {
        log(`❌ ${description} failed: ${error.message}`, colors.red);
        return false;
    }
}

function checkPythonInstallation() {
    const pythonCommands = ['python3', 'python'];
    
    for (const cmd of pythonCommands) {
        try {
            const version = execSync(`${cmd} --version`, { encoding: 'utf8' });
            log(`✅ Found Python: ${version.trim()}`, colors.green);
            return cmd;
        } catch (error) {
            // Continue to next command
        }
    }
    
    log('❌ Python not found. Please install Python 3.8 or higher.', colors.red);
    return null;
}

function checkPipInstallation(pythonCmd) {
    try {
        execSync(`${pythonCmd} -m pip --version`, { stdio: 'pipe' });
        return `${pythonCmd} -m pip`;
    } catch (error) {
        try {
            execSync('pip --version', { stdio: 'pipe' });
            return 'pip';
        } catch (error2) {
            try {
                execSync('pip3 --version', { stdio: 'pipe' });
                return 'pip3';
            } catch (error3) {
                log('❌ pip not found. Please install pip.', colors.red);
                return null;
            }
        }
    }
}

function checkRustInstalled() {
    try {
        const rustcVersion = execSync('rustc --version', { stdio: 'pipe' }).toString();
        log('✅ Rust is already installed:', colors.green, rustcVersion.trim());
        return true;
    } catch (error) {
        log('❌ Rust is not installed or not in PATH', colors.red);
        return false;
    }
}

function updateCargoPath() {
    const homeDir = os.homedir();
    const cargoPath = path.join(homeDir, '.cargo', 'bin');
    
    log(`Adding ${cargoPath} to PATH...`, colors.blue);
    
    // Update the current process environment
    if (!process.env.PATH.includes(cargoPath)) {
        process.env.PATH = `${cargoPath}:${process.env.PATH}`;
    }
    
    // Verify that the cargo executable is now in the PATH
    try {
        const cargoVersion = execSync('cargo --version', { stdio: 'pipe' }).toString();
        log('✅ Cargo is now available:', colors.green, cargoVersion.trim());
        return true;
    } catch (error) {
        log('❌ Failed to verify cargo installation:', colors.red, error.message);
        return false;
    }
}

function installRust() {
    log('Installing Rust via rustup...', colors.blue);
    try {
        // Use rustup to install Rust (non-interactive mode)
        execSync('curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y', { 
            stdio: 'inherit',
            shell: '/bin/bash' 
        });
        
        // Directly modify PATH instead of using source
        updateCargoPath();
        
        // Use bash to run cargo directly from its path
        const homeDir = os.homedir();
        const cargoPath = path.join(homeDir, '.cargo', 'bin');
        const rustcPath = path.join(cargoPath, 'rustc');
        
        try {
            if (fs.existsSync(rustcPath)) {
                const rustcVersion = execSync(`${rustcPath} --version`, { 
                    stdio: 'pipe',
                    shell: '/bin/bash'
                }).toString();
                log('✅ Rust is now installed:', colors.green, rustcVersion.trim());
                return true;
            } else {
                log(`❌ Rust compiler not found at ${rustcPath}`, colors.red);
            }
        } catch (error) {
            log('⚠️ Error checking rustc after installation:', colors.yellow, error.message);
        }
        
        return false;
    } catch (error) {
        log('❌ Failed to install Rust:', colors.red, error.message);
        return false;
    }
}

function setupRust() {
    log('Checking for Rust installation...', colors.blue);
    let isInstalled = checkRustInstalled();
    
    if (!isInstalled) {
        log('Rust is required for building certain Python packages like tokenizers.', colors.yellow);
        log('Installing Rust now...', colors.blue);
        const success = installRust();
        
        if (!success) {
            log('❌ Failed to install Rust automatically.', colors.red);
            log('⚠️ Will attempt to continue with Python setup, but tokenizers may fail to build.', colors.yellow);
        } else {
            // Update PATH to include Cargo bin directory
            updateCargoPath();
        }
    }
    
    log('✅ Rust setup complete.', colors.green);
}

function upgradePip() {
    try {
        log('Upgrading pip...', colors.blue);
        execSync('python -m pip install --upgrade pip', { 
            stdio: 'inherit',
            shell: '/bin/bash'
        });
        log('✅ pip upgraded successfully', colors.green);
        return true;
    } catch (error) {
        log('❌ Failed to upgrade pip:', colors.red, error.message);
        return false;
    }
}

function installPythonDependencies() {
    try {
        log('Installing Python dependencies...', colors.blue);
        
        // Try to install pre-built wheels first for all relevant packages
        try {
            execSync('pip install --only-binary=:all: tokenizers==0.19.1 transformers==4.40.0 sentence-transformers==2.6.1', {
                stdio: 'inherit',
                shell: '/bin/bash'
            });
            log('✅ Installed tokenizers, transformers, and sentence-transformers from binary wheels', colors.green);
        } catch (error) {
            log('⚠️ Failed to install pre-built wheels for tokenizers/transformers/sentence-transformers, will build from source:', colors.yellow, error.message);
        }
        
        // Install other dependencies
        execSync('pip install huggingface-hub==0.12.0', { 
            stdio: 'inherit',
            shell: '/bin/bash',
            env: { ...process.env }
        });
        
        log('🎉 Python dependencies installed successfully!', colors.green);
        return true;
    } catch (error) {
        log('❌ Failed to install Python dependencies:', colors.red, error.message);
        return false;
    }
}

function setupPython() {
    log('Setting up Python environment...', colors.blue);
    
    // Upgrade pip first
    upgradePip();
    
    // Install Python dependencies
    if (!installPythonDependencies()) {
        log('❌ Failed to install all Python dependencies.', colors.red);
        process.exit(1);
    }
    
    log('✅ Python setup complete.', colors.green);
}

function main() {
    log('🐍 Starting environment setup for Orpheus Engine...', colors.blue);
    
    // First, set up Rust which is needed by Python packages like tokenizers
    setupRust();
    
    // Then proceed with Python setup
    setupPython();
    
    // Check and install macOS-specific dependencies if on macOS
    const isMacOS = os.platform() === 'darwin';
    if (isMacOS) {
        log('📱 Detected macOS, installing macOS-specific dependencies...', colors.blue);
        try {
            execSync('bash scripts/fix-macos-dependencies.sh', { stdio: 'inherit' });
            log('✅ macOS-specific dependencies installed successfully', colors.green);
        } catch (error) {
            log('❌ Failed to install macOS-specific dependencies:', colors.red, error.message);
        }
    }
    
    log('🎉 Environment setup completed successfully!', colors.green);
}

// Run if called directly
if (require.main === module) {
    main();
}