#!/usr/bin/env node

const net = require('net');
const { spawn } = require('child_process');
const path = require('path');

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

async function findAvailablePort(startPort = 5001, maxPort = 5100) {
    for (let port = startPort; port <= maxPort; port++) {
        try {
            await new Promise((resolve, reject) => {
                const server = net.createServer();
                server.listen(port, () => {
                    server.close(() => resolve());
                });
                server.on('error', reject);
            });
            return port;
        } catch (error) {
            // Port is in use, try next one
            continue;
        }
    }
    throw new Error(`No available ports found between ${startPort} and ${maxPort}`);
}

async function checkPortProcess(port) {
    try {
        const { execSync } = require('child_process');
        const result = execSync(`lsof -ti:${port}`, { encoding: 'utf8' }).trim();
        if (result) {
            const pid = result.split('\n')[0];
            try {
                const processName = execSync(`ps -p ${pid} -o comm=`, { encoding: 'utf8' }).trim();
                return { pid, processName };
            } catch (e) {
                return { pid, processName: 'Unknown' };
            }
        }
        return null;
    } catch (error) {
        return null;
    }
}

async function main() {
    const args = process.argv.slice(2);
    const preferredPort = parseInt(process.env.BACKEND_PORT) || 5001;
    const isDevelopment = process.env.DEVELOPMENT !== 'false';
    
    log(`🚀 Starting Orpheus Engine Backend`, colors.cyan);
    log(`🔍 Checking port ${preferredPort}...`, colors.blue);
    
    // Check if preferred port is available
    let targetPort = preferredPort;
    const portProcess = await checkPortProcess(preferredPort);
    
    if (portProcess) {
        log(`⚠️  Port ${preferredPort} is in use by: ${portProcess.processName} (PID: ${portProcess.pid})`, colors.yellow);
        
        // Check if it's a system process
        const systemProcesses = ['ControlCenter', 'Finder', 'Dock', 'WindowServer'];
        const isSystemProcess = systemProcesses.some(name => 
            portProcess.processName.toLowerCase().includes(name.toLowerCase())
        );
        
        if (isSystemProcess) {
            log(`🛡️  This is a system process - finding alternative port...`, colors.yellow);
            try {
                targetPort = await findAvailablePort(5001, 5100);
                log(`✅ Found available port: ${targetPort}`, colors.green);
            } catch (error) {
                log(`❌ Could not find available port: ${error.message}`, colors.red);
                process.exit(1);
            }
        } else {
            log(`💡 You can clear this port with: npm run clear-ports ports ${preferredPort}`, colors.blue);
            log(`   Or use a different port: BACKEND_PORT=5001 npm run start:backend`, colors.blue);
            process.exit(1);
        }
    } else {
        log(`✅ Port ${preferredPort} is available`, colors.green);
    }
    
    // Start the backend with the selected port
    const backendPath = path.join(process.cwd(), 'workstation', 'backend');
    
    log(`📂 Backend directory: ${backendPath}`, colors.blue);
    log(`🎯 Starting backend on port ${targetPort}...`, colors.green);
    
    const env = {
        ...process.env,
        BACKEND_PORT: targetPort.toString(),
        DEVELOPMENT: isDevelopment.toString()
    };
    
    const pythonProcess = spawn('python', ['main.py'], {
        cwd: backendPath,
        env: env,
        stdio: 'inherit'
    });
    
    pythonProcess.on('error', (error) => {
        log(`❌ Failed to start backend: ${error.message}`, colors.red);
        process.exit(1);
    });
    
    pythonProcess.on('exit', (code) => {
        if (code !== 0) {
            log(`❌ Backend exited with code ${code}`, colors.red);
        } else {
            log(`✅ Backend stopped gracefully`, colors.green);
        }
        process.exit(code);
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
        log(`\n🛑 Stopping backend...`, colors.yellow);
        pythonProcess.kill('SIGINT');
    });
    
    process.on('SIGTERM', () => {
        log(`\n🛑 Stopping backend...`, colors.yellow);
        pythonProcess.kill('SIGTERM');
    });
}

if (require.main === module) {
    main().catch(error => {
        log(`❌ Error: ${error.message}`, colors.red);
        process.exit(1);
    });
}
