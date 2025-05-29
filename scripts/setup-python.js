#!/usr/bin/env node

const { execSync } = require('child_process');
const { existsSync } = require('fs');
const { join } = require('path');

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

function main() {
    log('🐍 Setting up Python environment for Orpheus Engine...', colors.blue);
    
    // Check Python installation
    const pythonCmd = checkPythonInstallation();
    if (!pythonCmd) {
        process.exit(1);
    }
    
    // Check pip installation
    const pipCmd = checkPipInstallation(pythonCmd);
    if (!pipCmd) {
        process.exit(1);
    }
    
    log(`✅ Found pip: ${pipCmd}`, colors.green);
    
    // Check if we're in a virtual environment or if we should create one
    const backendDir = join(process.cwd(), 'workstation', 'backend');
    if (existsSync(backendDir)) {
        const venvDir = join(backendDir, 'venv');
        
        if (!existsSync(venvDir)) {
            log('📦 Creating Python virtual environment...', colors.blue);
            if (!runCommand(`cd "${backendDir}" && ${pythonCmd} -m venv venv`, 'Create virtual environment')) {
                log('⚠️  Could not create virtual environment, installing globally', colors.yellow);
            }
        } else {
            log('✅ Virtual environment already exists', colors.green);
        }
        
        // Try to install requirements from backend directory
        const requirementsPath = join(backendDir, 'requirements.txt');
        if (existsSync(requirementsPath)) {
            const installCmd = existsSync(venvDir) 
                ? `cd "${backendDir}" && source venv/bin/activate && pip install -r requirements.txt`
                : `${pipCmd} install -r "${requirementsPath}"`;
            
            if (!runCommand(installCmd, 'Install Python requirements from backend')) {
                log('⚠️  Failed to install requirements, trying individual packages...', colors.yellow);
            } else {
                log('🎉 Python setup completed successfully!', colors.green);
                return;
            }
        }
    }
    
    // Fallback: Install essential packages individually
    log('📦 Installing essential Python packages...', colors.blue);
    const packages = [
        'flask',
        'flask-cors',
        'librosa',
        'numpy',
        'matplotlib',
        'pyloudnorm',
        'requests',
        'python-dotenv'
    ];
    
    for (const pkg of packages) {
        runCommand(`${pipCmd} install ${pkg}`, `Install ${pkg}`);
    }
    
    log('🎉 Python setup completed!', colors.green);
}

// Run if called directly
if (require.main === module) {
    main();
}