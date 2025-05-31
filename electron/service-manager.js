"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceManager = void 0;
const child_process_1 = require("child_process");
const events_1 = require("events");
const net_1 = __importDefault(require("net"));
class ServiceManager extends events_1.EventEmitter {
    constructor() {
        super();
        this.services = new Map();
        this.statuses = new Map();
        this.configs = [];
    }
    registerService(config) {
        this.configs.push(config);
        this.statuses.set(config.name, {
            name: config.name,
            status: 'pending',
            port: config.port,
            description: config.description
        });
    }
    async startAllServices() {
        this.emit('startup-begin');
        for (const config of this.configs) {
            try {
                await this.startService(config);
            }
            catch (error) {
                console.error(`Failed to start ${config.name}:`, error);
                if (config.critical) {
                    throw new Error(`Critical service ${config.name} failed to start`);
                }
            }
        }
        this.emit('startup-complete');
    }
    async startService(config) {
        const status = this.statuses.get(config.name);
        status.status = 'starting';
        status.startTime = new Date();
        this.emit('service-status-change', status);
        // Find available port if needed
        if (config.port) {
            const availablePort = await this.findAvailablePort(config.port);
            if (availablePort !== config.port) {
                console.log(`Port ${config.port} busy, using ${availablePort} for ${config.name}`);
                status.port = availablePort;
                config.port = availablePort;
            }
        }
        // Set up environment
        const env = {
            ...process.env,
            ...(config.env || {}),
            ...(config.port ? { [`${config.name.toUpperCase()}_PORT`]: config.port.toString() } : {})
        };
        // Start the process
        const child = (0, child_process_1.spawn)(config.command, config.args, {
            cwd: config.cwd,
            env,
            stdio: ['ignore', 'pipe', 'pipe']
        });
        child.stdout?.on('data', (data) => {
            console.log(`[${config.name}] ${data.toString().trim()}`);
        });
        child.stderr?.on('data', (data) => {
            console.error(`[${config.name}] ${data.toString().trim()}`);
        });
        child.on('exit', (code) => {
            console.log(`[${config.name}] Process exited with code ${code}`);
            status.status = code === 0 ? 'stopped' : 'failed';
            if (code !== 0) {
                status.error = `Process exited with code ${code}`;
            }
            this.emit('service-status-change', status);
        });
        child.on('error', (error) => {
            console.error(`[${config.name}] Process error:`, error);
            status.status = 'failed';
            status.error = error.message;
            this.emit('service-status-change', status);
        });
        this.services.set(config.name, child);
        status.pid = child.pid;
        // Wait for service to be ready
        await this.waitForService(config);
        status.status = 'running';
        this.emit('service-status-change', status);
    }
    async waitForService(config) {
        const maxWaitTime = 30000; // 30 seconds
        const checkInterval = 1000; // 1 second
        const startTime = Date.now();
        while (Date.now() - startTime < maxWaitTime) {
            if (config.healthCheck) {
                try {
                    const healthy = await config.healthCheck();
                    if (healthy)
                        return;
                }
                catch (error) {
                    // Continue waiting
                }
            }
            else if (config.port) {
                // Default health check: try to connect to port
                try {
                    await this.checkPort(config.port);
                    return;
                }
                catch (error) {
                    // Continue waiting
                }
            }
            else {
                // No health check, just wait a bit
                await new Promise(resolve => setTimeout(resolve, 2000));
                return;
            }
            await new Promise(resolve => setTimeout(resolve, checkInterval));
        }
        throw new Error(`Service ${config.name} failed to become ready within ${maxWaitTime}ms`);
    }
    async findAvailablePort(startPort) {
        for (let port = startPort; port <= startPort + 100; port++) {
            try {
                await new Promise((resolve, reject) => {
                    const server = net_1.default.createServer();
                    server.listen(port, () => {
                        server.close(() => resolve());
                    });
                    server.on('error', reject);
                });
                return port;
            }
            catch (error) {
                continue;
            }
        }
        throw new Error(`No available ports found starting from ${startPort}`);
    }
    checkPort(port) {
        return new Promise((resolve, reject) => {
            const socket = new net_1.default.Socket();
            socket.setTimeout(2000);
            socket.on('connect', () => {
                socket.destroy();
                resolve();
            });
            socket.on('timeout', () => {
                socket.destroy();
                reject(new Error('Timeout'));
            });
            socket.on('error', (error) => {
                reject(error);
            });
            socket.connect(port, 'localhost');
        });
    }
    getServiceStatus(name) {
        return this.statuses.get(name);
    }
    getAllStatuses() {
        return Array.from(this.statuses.values());
    }
    async stopAllServices() {
        for (const [name, process] of this.services) {
            try {
                process.kill('SIGTERM');
                // Give process time to shut down gracefully
                await new Promise(resolve => setTimeout(resolve, 2000));
                if (!process.killed) {
                    process.kill('SIGKILL');
                }
            }
            catch (error) {
                console.error(`Error stopping ${name}:`, error);
            }
        }
        this.services.clear();
    }
}
exports.ServiceManager = ServiceManager;
