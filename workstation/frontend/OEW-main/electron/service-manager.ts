import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import path from 'path';
import net from 'net';

export interface ServiceConfig {
    name: string;
    command: string;
    args: string[];
    cwd: string;
    env?: Record<string, string>;
    port?: number;
    healthCheck?: () => Promise<boolean>;
    description: string;
    critical: boolean; // If true, app won't start without this service
    pluginId?: string; // Optional: ID of the plugin this service belongs to
    type?: 'system' | 'plugin'; // Service type
}

export interface ServiceStatus {
    name: string;
    status: 'pending' | 'starting' | 'running' | 'failed' | 'stopped';
    port?: number;
    pid?: number;
    startTime?: Date;
    error?: string;
    description: string;
}

export class ServiceManager extends EventEmitter {
    private services: Map<string, ChildProcess> = new Map();
    private statuses: Map<string, ServiceStatus> = new Map();
    private configs: ServiceConfig[] = [];

    constructor() {
        super();
    }

    registerService(config: ServiceConfig) {
        this.configs.push(config);
        this.statuses.set(config.name, {
            name: config.name,
            status: 'pending',
            port: config.port,
            description: config.description
        });
    }

    async startAllServices(): Promise<void> {
        this.emit('startup-begin');
        
        for (const config of this.configs) {
            if (config.critical) {
                await this.startService(config);
            }
        }
        
        // Start non-critical services
        for (const config of this.configs) {
            if (!config.critical) {
                await this.startService(config);
            }
        }
        
        this.emit('startup-complete');
    }

    private async startService(config: ServiceConfig): Promise<void> {
        const status = this.statuses.get(config.name)!;
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
        const child = spawn(config.command, config.args, {
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

    private async waitForService(config: ServiceConfig): Promise<void> {
        const maxWaitTime = 30000; // 30 seconds
        const checkInterval = 1000; // 1 second
        const startTime = Date.now();

        while (Date.now() - startTime < maxWaitTime) {
            if (config.healthCheck) {
                try {
                    const healthy = await config.healthCheck();
                    if (healthy) return;
                } catch (error) {
                    // Continue waiting
                }
            } else if (config.port) {
                // Default health check: try to connect to port
                try {
                    await this.checkPort(config.port);
                    return;
                } catch (error) {
                    // Continue waiting
                }
            } else {
                // No health check, just wait a bit
                await new Promise(resolve => setTimeout(resolve, 2000));
                return;
            }

            await new Promise(resolve => setTimeout(resolve, checkInterval));
        }

        throw new Error(`Service ${config.name} failed to become ready within ${maxWaitTime}ms`);
    }

    private async findAvailablePort(startPort: number): Promise<number> {
        for (let port = startPort; port <= startPort + 100; port++) {
            try {
                await new Promise<void>((resolve, reject) => {
                    const server = net.createServer();
                    server.listen(port, () => {
                        server.close(() => resolve());
                    });
                    server.on('error', reject);
                });
                return port;
            } catch (error) {
                continue;
            }
        }
        throw new Error(`No available ports found starting from ${startPort}`);
    }

    private checkPort(port: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const socket = new net.Socket();
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

    getServiceStatus(name: string): ServiceStatus | undefined {
        return this.statuses.get(name);
    }

    getAllStatuses(): ServiceStatus[] {
        return Array.from(this.statuses.values());
    }

    async stopAllServices(): Promise<void> {
        for (const [name, process] of this.services) {
            try {
                process.kill('SIGTERM');
                // Give process time to shut down gracefully
                await new Promise(resolve => setTimeout(resolve, 2000));
                if (!process.killed) {
                    process.kill('SIGKILL');
                }
            } catch (error) {
                console.error(`Error stopping ${name}:`, error);
            }
        }
        this.services.clear();
    }

    async startPluginService(pluginId: string, config: ServiceConfig): Promise<boolean> {
        try {
            console.log(`Starting plugin service: ${config.name} for plugin ${pluginId}`);
            
            // Register the plugin service
            this.registerService({
                ...config,
                pluginId,
                type: 'plugin',
                critical: false // Plugin services are never critical
            });
            
            // Start the service
            await this.startService(config);
            
            const status = this.statuses.get(config.name);
            const success = status?.status === 'running';
            
            if (success) {
                this.emit('plugin-service-started', { pluginId, serviceName: config.name });
            }
            
            return success;
        } catch (error) {
            console.error(`Failed to start plugin service for ${pluginId}:`, error);
            return false;
        }
    }

    async stopService(serviceName: string): Promise<void> {
        const child = this.services.get(serviceName);
        if (child) {
            child.kill();
            this.services.delete(serviceName);
            
            const status = this.statuses.get(serviceName);
            if (status) {
                status.status = 'stopped';
                this.emit('service-status-change', status);
            }
        }
    }

    async stopPluginService(pluginId: string): Promise<boolean> {
        try {
            // Find services for this plugin
            const pluginServices = this.configs.filter(config => config.pluginId === pluginId);
            
            for (const config of pluginServices) {
                await this.stopService(config.name);
                this.emit('plugin-service-stopped', { pluginId, serviceName: config.name });
            }
            
            // Remove plugin services from configs
            this.configs = this.configs.filter(config => config.pluginId !== pluginId);
            
            return true;
        } catch (error) {
            console.error(`Failed to stop plugin services for ${pluginId}:`, error);
            return false;
        }
    }

    getPluginServices(pluginId: string): ServiceStatus[] {
        return Array.from(this.statuses.values())
            .filter(status => {
                const config = this.configs.find(c => c.name === status.name);
                return config?.pluginId === pluginId;
            });
    }

    getAllPluginServices(): Record<string, ServiceStatus[]> {
        const pluginServices: Record<string, ServiceStatus[]> = {};
        
        for (const config of this.configs) {
            if (config.pluginId && config.type === 'plugin') {
                if (!pluginServices[config.pluginId]) {
                    pluginServices[config.pluginId] = [];
                }
                
                const status = this.statuses.get(config.name);
                if (status) {
                    pluginServices[config.pluginId].push(status);
                }
            }
        }
        
        return pluginServices;
    }

    async checkPluginHealth(pluginId: string): Promise<boolean> {
        const pluginServices = this.getPluginServices(pluginId);
        
        if (pluginServices.length === 0) {
            return false; // No services means plugin is not running
        }
        
        // Check if all plugin services are running
        const allRunning = pluginServices.every(service => service.status === 'running');
        
        if (!allRunning) {
            return false;
        }
        
        // Perform health checks if configured
        for (const service of pluginServices) {
            const config = this.configs.find(c => c.name === service.name);
            if (config?.healthCheck) {
                try {
                    const healthy = await config.healthCheck();
                    if (!healthy) {
                        return false;
                    }
                } catch (error) {
                    console.error(`Health check failed for ${service.name}:`, error);
                    return false;
                }
            }
        }
        
        return true;
    }
}
