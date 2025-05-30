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
            'workstation/orpheus-engine-workstation/backend/main.py',
            'workstation/orpheus-engine-workstation/backend/requirements.txt',
            'workstation/orpheus-engine-workstation/frontend/package.json'
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
        const backendPath = path.join(process.cwd(), 'workstation/orpheus-engine-workstation/backend');
        
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
            if (this.warnings.some(w => w.includes('Python dependency conflicts'))) {
                this.log('1. Fix Python dependencies: npm run fix-python-deps', colors.blue);
            }
            if (this.warnings.some(w => w.includes('MCP package'))) {
                this.log('2. Install MCP package: pip install mcp', colors.blue);
            }
            if (this.warnings.some(w => w.includes('FFmpeg'))) {
                this.log('3. Install FFmpeg: brew install ffmpeg (macOS) or apt install ffmpeg (Linux)', colors.blue);
            }
            if (this.issues.length > 0) {
                this.log('4. Resolve critical issues before running the application', colors.red);
            }
        }

        return this.issues.length === 0;
    }

    async run() {
        console.log(`${colors.bold}${colors.cyan}🔍 Orpheus Engine System Check${colors.reset}\n`);
        
        await this.checkNodeVersion();
        await this.checkRequiredFiles();
        await this.checkPythonDependencies();
        await this.checkBackendServices();
        await this.checkFFmpeg();
        await this.checkElectron();
        await this.checkPorts();
        
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
