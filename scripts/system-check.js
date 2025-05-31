#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

class SystemChecker {
    constructor() {
        this.issues = [];
        this.warnings = [];
        this.successes = [];
    }

    log(message, color = colors.white) {
        console.log(`${color}${message}${colors.reset}`);
    }

    logHeader(message) {
        console.log('\n' + '='.repeat(60));
        this.log(`${colors.bold}${message}`, colors.cyan);
        console.log('='.repeat(60));
    }

    logSuccess(message) {
        this.log(`✅ ${message}`, colors.green);
        this.successes.push(message);
    }

    logWarning(message) {
        this.log(`⚠️  ${message}`, colors.yellow);
        this.warnings.push(message);
    }

    logError(message) {
        this.log(`❌ ${message}`, colors.red);
        this.issues.push(message);
    }

    async checkNodeVersion() {
        this.logHeader('Checking Node.js Version');
        try {
            const nodeVersion = process.version;
            const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0]);
            
            if (majorVersion >= 16) {
                this.logSuccess(`Node.js version: ${nodeVersion} (meets requirement >=16.0.0)`);
            } else {
                this.logError(`Node.js version: ${nodeVersion} (requires >=16.0.0)`);
            }
        } catch (error) {
            this.logError(`Failed to check Node.js version: ${error.message}`);
        }
    }
    
    async checkPackageManagers() {
        this.logHeader('Checking Package Managers');
        
        // Check npm version
        try {
            const npmVersion = execSync('npm --version').toString().trim();
            const npmMajorVersion = parseInt(npmVersion.split('.')[0]);
            
            if (npmMajorVersion >= 7) {
                this.logSuccess(`npm version: ${npmVersion} (meets requirement >=7.0.0)`);
            } else {
                this.logWarning(`npm version: ${npmVersion} (recommended >=7.0.0)`);
            }
        } catch (error) {
            this.logError(`Failed to check npm version: ${error.message}`);
        }
        
        // Check yarn availability
        try {
            const yarnVersion = execSync('yarn --version').toString().trim();
            this.logSuccess(`Yarn is installed (version ${yarnVersion})`);
            
            // Check if this is Yarn 1.x or Yarn 2+
            const yarnMajorVersion = parseInt(yarnVersion.split('.')[0]);
            if (yarnMajorVersion >= 2) {
                this.log(`Note: You're using Yarn 2+. This project is optimized for Yarn 1.x, but should work with newer versions.`, colors.blue);
            }
        } catch (error) {
            this.logWarning(`Yarn is not installed. Installing it with 'npm install -g yarn' is recommended for this project.`);
        }
    }

    async checkPythonDependencies() {
        this.logHeader('Checking Python Dependencies');
        try {
            // Check if pip is available
            execSync('python3 -m pip --version', { stdio: 'ignore' });
            this.logSuccess('Python pip is available');

            // Check for dependency conflicts
            try {
                const pipCheck = execSync('python3 -m pip check', { encoding: 'utf8', stdio: 'pipe' });
                this.logSuccess('No Python dependency conflicts detected');
            } catch (error) {
                const conflictsOutput = error.stdout || error.stderr || '';
                if (conflictsOutput.includes('pydantic-ai-slim') || 
                    conflictsOutput.includes('open-webui') || 
                    conflictsOutput.includes('incompatible')) {
                    this.logWarning('Python dependency conflicts detected:');
                    console.log(conflictsOutput);
                    this.logWarning('Consider running: npm run fix-python-deps');
                } else {
                    this.logSuccess('Python dependencies check completed');
                }
            }

            // Check MCP package availability
            try {
                execSync('python3 -c "import mcp"', { stdio: 'ignore' });
                this.logSuccess('MCP package is installed and importable');
            } catch (error) {
                this.logWarning('MCP package not found - run: pip install mcp');
            }

        } catch (error) {
            this.logError(`Python/pip not available: ${error.message}`);
        }
    }

    async checkRequiredFiles() {
        this.logHeader('Checking Required Files');
        const requiredFiles = [
            'package.json',
            'requirements.txt',
            'workstation/backend/main.py',
            'workstation/backend/requirements.txt',
            'workstation/frontend/package.json'
        ];

        for (const file of requiredFiles) {
            const filePath = path.join(process.cwd(), file);
            if (fs.existsSync(filePath)) {
                this.logSuccess(`Found: ${file}`);
            } else {
                this.logError(`Missing: ${file}`);
            }
        }
    }

    async checkBackendServices() {
        this.logHeader('Checking Backend Services');
        const backendPath = path.join(process.cwd(), 'workstation/backend');
        
        if (fs.existsSync(backendPath)) {
            const servicesPath = path.join(backendPath, 'agentic_rag');
            if (fs.existsSync(servicesPath)) {
                const services = fs.readdirSync(servicesPath)
                    .filter(file => file.endsWith('.py') && file !== '__init__.py');
                
                this.logSuccess(`Found ${services.length} backend services:`);
                services.forEach(service => {
                    console.log(`  - ${service}`);
                });

                // Check for MCP service specifically
                if (services.includes('rag_pipeline.py')) {
                    this.logSuccess('RAG pipeline service is available');
                } else {
                    this.logWarning('RAG pipeline service not found in backend/agentic_rag/');
                }
            } else {
                this.logWarning('Backend services directory not found');
            }
        } else {
            this.logError('Backend directory not found');
        }
    }

    async checkSystemPackages() {
        this.logHeader('Checking System Packages');
        
        // Only run on Linux systems
        const isLinux = process.platform === 'linux';
        if (!isLinux) {
            this.log('System package checks skipped (not on Linux)', colors.blue);
            return;
        }
        
        // Check if apt-get is available
        try {
            execSync('which apt-get', { stdio: 'ignore' });
            this.logSuccess('apt-get package manager is available');
            
            // Check if sudo is available
            let hasSudo = false;
            try {
                execSync('which sudo', { stdio: 'ignore' });
                hasSudo = true;
                this.logSuccess('sudo is available');
            } catch (error) {
                this.logWarning('sudo is not available - some installations may require root privileges');
            }
            
            // Check for essential build packages
            const requiredPackages = [
                'gcc',
                'g++',
                'make',
                'python3-dev',
                'build-essential',
                'cmake',
                'libopenblas-dev',
                'libsqlite3-dev',
                'zlib1g-dev'
            ];
            const missingPackages = [];
            
            for (const pkg of requiredPackages) {
                try {
                    execSync(`dpkg -s ${pkg}`, { stdio: 'ignore' });
                } catch (error) {
                    missingPackages.push(pkg);
                }
            }
            
            // Check for NVIDIA CUDA support
            let hasCuda = false;
            try {
                execSync('nvidia-smi', { stdio: 'ignore' });
                hasCuda = true;
                this.logSuccess('NVIDIA GPU detected');
                
                // Check for CUDA libraries if GPU is detected
                try {
                    execSync('dpkg -s nvidia-cuda-toolkit', { stdio: 'ignore' });
                    this.logSuccess('CUDA toolkit is installed');
                } catch (error) {
                    this.logWarning('NVIDIA GPU detected but CUDA toolkit not installed');
                    this.logWarning('For GPU acceleration with llama-cpp-python, consider installing: sudo apt install nvidia-cuda-toolkit');
                }
            } catch (error) {
                // No NVIDIA GPU detected - this is not an error
                this.log('No NVIDIA GPU detected - skipping CUDA checks', colors.blue);
            }
            
            if (missingPackages.length === 0) {
                this.logSuccess('All required system packages are installed');
            } else {
                this.logWarning(`Missing required packages: ${missingPackages.join(', ')}`);
                this.log(`These packages are needed for building Python extensions like llama-cpp-python and pysqlite3`, colors.blue);
                
                const updateCmd = hasSudo ? 'sudo apt-get update' : 'apt-get update';
                const installCmd = hasSudo ? 
                    `sudo apt install -y ${missingPackages.join(' ')}` : 
                    `apt install -y ${missingPackages.join(' ')}`;
                
                this.logWarning(`Run the following commands to install missing packages:`);
                console.log(`  ${updateCmd}`);
                console.log(`  ${installCmd}`);
            }
            
        } catch (error) {
            this.log('apt-get package manager not found - system package checks skipped', colors.blue);
        }
    }
    
    async checkFFmpeg() {
        this.logHeader('Checking FFmpeg');
        try {
            execSync('ffmpeg -version', { stdio: 'ignore' });
            this.logSuccess('FFmpeg is installed and available');
        } catch (error) {
            this.logWarning('FFmpeg not found in PATH - may need manual installation');
        }
    }

    async checkElectron() {
        this.logHeader('Checking Electron');
        try {
            const electronPath = path.join(process.cwd(), 'node_modules/.bin/electron');
            if (fs.existsSync(electronPath)) {
                this.logSuccess('Electron is installed');
            } else {
                this.logWarning('Electron not found in node_modules');
            }
        } catch (error) {
            this.logWarning(`Electron check failed: ${error.message}`);
        }
    }

    async checkPorts() {
        this.logHeader('Checking Port Availability');
        const ports = [3000, 5001, 8000];
        
        for (const port of ports) {
            try {
                // Simple port check using Node.js net module
                const net = require('net');
                const server = net.createServer();
                
                await new Promise((resolve, reject) => {
                    server.listen(port, () => {
                        server.close(() => resolve());
                    });
                    server.on('error', reject);
                });
                
                this.logSuccess(`Port ${port} is available`);
            } catch (error) {
                this.logWarning(`Port ${port} may be in use`);
            }
        }
    }

    async checkGitSubmodules() {
        this.logHeader('Checking Git Submodules');
        
        try {
            // Check if git is available
            execSync('git --version', { stdio: 'ignore' });
            
            // Check if .gitmodules exists (in root or workstation folder)
            const rootGitmodules = path.join(process.cwd(), '.gitmodules');
            const workstationGitmodules = path.join(process.cwd(), 'workstation', '.gitmodules');
            
            let gitmodulesPath = null;
            
            if (fs.existsSync(rootGitmodules)) {
                gitmodulesPath = rootGitmodules;
                this.logSuccess('Found .gitmodules in root directory');
            } else if (fs.existsSync(workstationGitmodules)) {
                gitmodulesPath = workstationGitmodules;
                this.logSuccess('Found .gitmodules in workstation directory');
            } else {
                this.logWarning('No .gitmodules file found - project may not use submodules');
                return;
            }
            
            // Get submodule status to detect initialized/uninitialized modules
            const submoduleStatus = execSync('git submodule status', { encoding: 'utf8' }).trim();
            
            if (!submoduleStatus) {
                this.logSuccess('No submodules detected in project');
                return;
            }
            
            const submoduleLines = submoduleStatus.split('\n');
            const uninitializedModules = [];
            const initializedModules = [];
            
            submoduleLines.forEach(line => {
                if (line.trim()) {
                    // Line format: [<status char>]<commit hash> <path> [(<branch>)]
                    // Status char: '-' = uninitialized, '+' = different commit, ' ' = clean
                    const statusChar = line[0];
                    const parts = line.trim().split(' ');
                    const submodulePath = parts[1];
                    
                    if (statusChar === '-') {
                        uninitializedModules.push(submodulePath);
                    } else {
                        initializedModules.push(submodulePath);
                    }
                }
            });
            
            if (initializedModules.length > 0) {
                this.logSuccess(`Initialized submodules: ${initializedModules.join(', ')}`);
            }
            
            if (uninitializedModules.length > 0) {
                this.logWarning(`Uninitialized submodules detected: ${uninitializedModules.join(', ')}`);
                this.logWarning('Run: git submodule update --init --recursive');
                
                // Initialize and update submodules if needed
                try {
                    this.log('Automatically initializing submodules...', colors.blue);
                    execSync('git submodule update --init --recursive', { stdio: 'inherit' });
                    this.logSuccess('Submodules initialized successfully');
                } catch (error) {
                    this.logError(`Failed to initialize submodules: ${error.message}`);
                }
            } else {
                this.logSuccess('All submodules are initialized');
            }
            
        } catch (error) {
            this.logWarning(`Git submodule check failed: ${error.message}`);
        }
    }

    async generateReport() {
        this.logHeader('System Check Summary');
        
        console.log(`${colors.green}✅ Successes: ${this.successes.length}${colors.reset}`);
        console.log(`${colors.yellow}⚠️  Warnings: ${this.warnings.length}${colors.reset}`);
        console.log(`${colors.red}❌ Issues: ${this.issues.length}${colors.reset}\n`);

        if (this.issues.length > 0) {
            this.log('Issues that need attention:', colors.red);
            this.issues.forEach(issue => console.log(`  - ${issue}`));
            console.log();
        }

        if (this.warnings.length > 0) {
            this.log('Warnings (recommended fixes):', colors.yellow);
            this.warnings.forEach(warning => console.log(`  - ${warning}`));
            console.log();
        }

        // Provide recommendations
        this.logHeader('Recommendations');
        if (this.issues.length === 0 && this.warnings.length === 0) {
            this.logSuccess('Your system looks good! 🎉');
        } else {
            let recommendationCount = 1;
            
            if (this.warnings.some(w => w.includes('Python dependency conflicts'))) {
                this.log(`${recommendationCount}. Fix Python dependencies: npm run fix-python-deps`, colors.blue);
                recommendationCount++;
            }
            
            if (this.warnings.some(w => w.includes('MCP package'))) {
                this.log(`${recommendationCount}. Install MCP package: pip install mcp`, colors.blue);
                recommendationCount++;
            }
            
            if (this.warnings.some(w => w.includes('Uninitialized submodules'))) {
                this.log(`${recommendationCount}. Initialize Git submodules: git submodule update --init --recursive`, colors.blue);
                recommendationCount++;
            }
            
            if (this.warnings.some(w => w.includes('Missing required packages'))) {
                this.log(`${recommendationCount}. Install missing system packages using the commands suggested above`, colors.blue);
                recommendationCount++;
            }
            
            if (this.warnings.some(w => w.includes('FFmpeg'))) {
                this.log(`${recommendationCount}. Install FFmpeg: brew install ffmpeg (macOS) or sudo apt install ffmpeg (Linux)`, colors.blue);
                recommendationCount++;
            }
            
            if (this.issues.length > 0) {
                this.log(`${recommendationCount}. Resolve critical issues before running the application`, colors.red);
            }
        }

        return this.issues.length === 0;
    }

    async run() {
        console.log(`${colors.bold}${colors.cyan}🔍 Orpheus Engine System Check${colors.reset}\n`);
        
        await this.checkNodeVersion();
        await this.checkPackageManagers();
        await this.checkRequiredFiles();
        await this.checkGitSubmodules();
        await this.checkPythonDependencies();
        await this.checkBackendServices();
        await this.checkSystemPackages();
        await this.checkFFmpeg();
        await this.checkElectron();
        await this.checkPorts();
        await this.checkGitSubmodules();
        
        const allGood = await this.generateReport();
        
        if (!allGood) {
            process.exit(1);
        }
    }
}

// Run the system check
if (require.main === module) {
    const checker = new SystemChecker();
    checker.run().catch(error => {
        console.error(`${colors.red}System check failed: ${error.message}${colors.reset}`);
        process.exit(1);
    });
}

module.exports = SystemChecker;
