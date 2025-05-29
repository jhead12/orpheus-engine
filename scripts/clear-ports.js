#!/usr/bin/env node

const { execSync } = require('child_process');
const net = require('net');

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

// Orpheus Engine ports
const ORPHEUS_PORTS = [
    { port: 3000, description: 'DAW/Electron Development Server' },
    { port: 5001, description: 'Python RAG Backend API', systemSensitive: false },
    { port: 5173, description: 'Vite Frontend Development Server' },
    { port: 5174, description: 'Alternative Vite Server' },
    { port: 7008, description: 'Audio Processing Service' },
    { port: 8000, description: 'Monitor Backend/Flask API' }
];

// System processes that should NOT be killed
const PROTECTED_PROCESSES = [
    'ControlCenter',
    'Finder',
    'Dock',
    'WindowServer',
    'loginwindow',
    'SystemUIServer',
    'AirPlay',
    'ssh',
    'kernel_task',
    'launchd'
];

// Additional common development ports that might conflict
const ADDITIONAL_PORTS = [
    { port: 3001, description: 'React Development (Alternative)' },
    { port: 4000, description: 'Express/Node Server' },
    { port: 4173, description: 'Vite Preview Server' },
    { port: 5001, description: 'Flask Alternative' },
    { port: 9000, description: 'Webpack Dev Server' }
];

class PortCleaner {
    constructor(includeAdditional = false) {
        this.ports = includeAdditional ? [...ORPHEUS_PORTS, ...ADDITIONAL_PORTS] : ORPHEUS_PORTS;
        this.clearedPorts = [];
        this.failedPorts = [];
    }

    async checkPort(port) {
        return new Promise((resolve) => {
            const server = net.createServer();
            server.listen(port, () => {
                server.close(() => resolve(false)); // Port is available
            });
            server.on('error', () => resolve(true)); // Port is in use
        });
    }

    async findProcessOnPort(port) {
        try {
            let command;
            if (process.platform === 'win32') {
                command = `netstat -ano | findstr :${port}`;
            } else {
                command = `lsof -ti:${port}`;
            }
            
            const result = execSync(command, { encoding: 'utf8' }).trim();
            return result ? result.split('\n')[0] : null;
        } catch (error) {
            return null;
        }
    }

    async killProcess(pid) {
        try {
            if (process.platform === 'win32') {
                execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
            } else {
                execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
            }
            return true;
        } catch (error) {
            return false;
        }
    }

    async clearPort(portInfo) {
        const { port, description } = portInfo;
        
        try {
            const isInUse = await this.checkPort(port);
            
            if (!isInUse) {
                log(`✅ Port ${port} (${description}) - Already available`, colors.green);
                return true;
            }

            log(`🔍 Port ${port} (${description}) - In use, attempting to clear...`, colors.yellow);
            
            const pid = await this.findProcessOnPort(port);
            
            if (!pid) {
                log(`⚠️  Port ${port} - Cannot find process ID`, colors.yellow);
                this.failedPorts.push(portInfo);
                return false;
            }

            // Try to get process name and full command before killing
            let processName = 'Unknown';
            let fullCommand = 'Unknown';
            try {
                if (process.platform === 'win32') {
                    const nameResult = execSync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`, { encoding: 'utf8' });
                    processName = nameResult.split(',')[0].replace(/"/g, '');
                } else {
                    processName = execSync(`ps -p ${pid} -o comm=`, { encoding: 'utf8' }).trim();
                    // Also get the full command path to better identify system processes
                    fullCommand = execSync(`ps -p ${pid} -o args=`, { encoding: 'utf8' }).trim();
                }
            } catch (e) {
                // Process name lookup failed, continue with kill
            }

            // Check if this is a protected system process
            const isProtectedProcess = PROTECTED_PROCESSES.some(protectedName => 
                processName.toLowerCase().includes(protectedName.toLowerCase()) ||
                fullCommand.toLowerCase().includes(protectedName.toLowerCase())
            );
            
            if (isProtectedProcess) {
                log(`🛡️  Port ${port} - PROTECTED SYSTEM PROCESS: ${processName}`, colors.yellow);
                log(`   📍 Full path: ${fullCommand}`, colors.yellow);
                log(`   ⚠️  This is a critical system component - NOT killing!`, colors.yellow);
                
                if (portInfo.systemSensitive) {
                    log(`   💡 Suggestion: Use alternative port for ${description}`, colors.blue);
                    log(`   💡 Try: BACKEND_PORT=5001 npm run start:backend`, colors.blue);
                }
                
                this.failedPorts.push({ ...portInfo, reason: 'Protected system process', processName });
                return false;
            }

            log(`📋 Found process: ${fullCommand} (PID: ${pid})`, colors.blue);
            
            const killed = await this.killProcess(pid);
            
            if (killed) {
                // Wait a moment for the port to be released
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                const nowAvailable = !(await this.checkPort(port));
                if (nowAvailable) {
                    log(`✅ Port ${port} - Successfully cleared (killed ${processName})`, colors.green);
                    this.clearedPorts.push({ ...portInfo, processName, pid });
                    return true;
                } else {
                    log(`⚠️  Port ${port} - Process killed but port still in use`, colors.yellow);
                    this.failedPorts.push(portInfo);
                    return false;
                }
            } else {
                log(`❌ Port ${port} - Failed to kill process (PID: ${pid})`, colors.red);
                this.failedPorts.push(portInfo);
                return false;
            }
        } catch (error) {
            log(`❌ Port ${port} - Error: ${error.message}`, colors.red);
            this.failedPorts.push(portInfo);
            return false;
        }
    }

    async clearAllPorts() {
        logHeader('🧹 Orpheus Engine Port Cleaner');
        
        log(`🎯 Clearing ${this.ports.length} ports used by Orpheus Engine...`, colors.blue);
        
        for (const portInfo of this.ports) {
            await this.clearPort(portInfo);
        }
        
        this.showSummary();
    }

    async clearSpecificPorts(portNumbers) {
        logHeader('🧹 Clearing Specific Ports');
        
        const portsToCheck = this.ports.filter(p => portNumbers.includes(p.port));
        
        if (portsToCheck.length === 0) {
            log(`⚠️  No recognized Orpheus Engine ports found in: ${portNumbers.join(', ')}`, colors.yellow);
            return;
        }
        
        for (const portInfo of portsToCheck) {
            await this.clearPort(portInfo);
        }
        
        this.showSummary();
    }

    showSummary() {
        logHeader('📊 Port Clearing Summary');
        
        if (this.clearedPorts.length > 0) {
            log(`✅ Successfully cleared ${this.clearedPorts.length} ports:`, colors.green);
            this.clearedPorts.forEach(({ port, description, processName }) => {
                log(`   • Port ${port}: ${description} (was: ${processName})`, colors.green);
            });
        }
        
        if (this.failedPorts.length > 0) {
            log(`\n⚠️  Failed to clear ${this.failedPorts.length} ports:`, colors.yellow);
            this.failedPorts.forEach(({ port, description }) => {
                log(`   • Port ${port}: ${description}`, colors.yellow);
            });
            
            log(`\n💡 Manual cleanup options:`, colors.blue);
            log(`   • Try running with sudo/administrator privileges`, colors.blue);
            log(`   • Use system task manager to force-kill processes`, colors.blue);
            log(`   • Restart your computer to clear all ports`, colors.blue);
        }
        
        if (this.clearedPorts.length === 0 && this.failedPorts.length === 0) {
            log(`✨ All checked ports were already available!`, colors.green);
        }
        
        log(`\n🚀 You can now run: npm start`, colors.cyan);
    }
}

// CLI Interface
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch (command) {
        case 'all':
        case 'extended':
            {
                const cleaner = new PortCleaner(true);
                await cleaner.clearAllPorts();
            }
            break;
            
        case 'orpheus':
        case undefined:
            {
                const cleaner = new PortCleaner(false);
                await cleaner.clearAllPorts();
            }
            break;
            
        case 'ports':
            {
                const portNumbers = args.slice(1).map(p => parseInt(p)).filter(p => !isNaN(p));
                if (portNumbers.length === 0) {
                    log(`❌ Please provide port numbers: npm run clear-ports ports 3000 5001`, colors.red);
                    process.exit(1);
                }
                const cleaner = new PortCleaner(true);
                await cleaner.clearSpecificPorts(portNumbers);
            }
            break;
            
        case 'help':
        case '--help':
        case '-h':
            showHelp();
            break;
            
        default:
            log(`❌ Unknown command: ${command}`, colors.red);
            showHelp();
            process.exit(1);
    }
}

function showHelp() {
    logHeader('🧹 Orpheus Engine Port Cleaner - Help');
    
    log(`Usage:`, colors.bold);
    log(`  npm run clear-ports [command] [options]`, colors.cyan);
    
    log(`\nCommands:`, colors.bold);
    log(`  (default)          Clear Orpheus Engine ports (3000, 5001, 5173, 7008, 8000)`, colors.green);
    log(`  orpheus            Same as default`, colors.green);
    log(`  all | extended     Clear Orpheus + additional development ports`, colors.yellow);
    log(`  ports <port...>    Clear specific port numbers`, colors.blue);
    log(`  help               Show this help message`, colors.cyan);
    
    log(`\nExamples:`, colors.bold);
    log(`  npm run clear-ports`, colors.cyan);
    log(`  npm run clear-ports all`, colors.cyan);
    log(`  npm run clear-ports ports 3000 5001`, colors.cyan);
    
    log(`\nPort Reference:`, colors.bold);
    ORPHEUS_PORTS.forEach(({ port, description }) => {
        log(`  ${port}: ${description}`, colors.green);
    });
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    log(`❌ Unexpected error: ${error.message}`, colors.red);
    process.exit(1);
});

// Run the CLI
if (require.main === module) {
    main().catch(error => {
        log(`❌ Error: ${error.message}`, colors.red);
        process.exit(1);
    });
}

module.exports = { PortCleaner, ORPHEUS_PORTS, ADDITIONAL_PORTS };
