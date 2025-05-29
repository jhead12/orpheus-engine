"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Expose APIs to renderer process safely through contextBridge
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    // Audio analysis
    analyzeAudio: (filePath) => electron_1.ipcRenderer.invoke('audio:analyze', filePath),
    listAudioFiles: (directoryPath) => electron_1.ipcRenderer.invoke('audio:list-files', directoryPath),
    // System information
    getAppVersion: () => electron_1.ipcRenderer.invoke('app:getVersion'),
    getPlatform: () => process.platform,
    // File system operations
    openFile: () => electron_1.ipcRenderer.invoke('dialog:openFile'),
    openDirectory: () => electron_1.ipcRenderer.invoke('dialog:openDirectory'),
    saveFile: (content) => electron_1.ipcRenderer.invoke('dialog:saveFile', content),
    // App lifecycle
    quitApp: () => electron_1.ipcRenderer.send('app:quit'),
    // IPC communication
    on: (channel, callback) => {
        const validChannels = ['file-selected', 'process-completed', 'error-occurred'];
        if (validChannels.includes(channel)) {
            // Strip event as it includes `sender` and other internal electron properties
            electron_1.ipcRenderer.on(channel, (_event, ...args) => callback(...args));
        }
    },
    send: (channel, data) => {
        const validChannels = ['start-process', 'cancel-process', 'request-data'];
        if (validChannels.includes(channel)) {
            electron_1.ipcRenderer.send(channel, data);
        }
    }
});
// Add orpheus-specific API
electron_1.contextBridge.exposeInMainWorld('orpheusAPI', {
    isElectron: true,
    audioAnalysis: {
        enabled: true,
        supportedFormats: ['.mp3', '.wav', '.ogg', '.flac'],
        getDataDirectory: () => electron_1.ipcRenderer.invoke('app:getUserDataPath', 'audioData'),
        defaultVisualization: 'waveform'
    },
    capabilities: {
        audioProcessing: true,
        gpu: false, // Default value - will be updated using system:detect-capabilities
        maxChannels: 32,
        maxSampleRate: 192000
    },
    // Add method to detect capabilities at runtime
    detectCapabilities: () => {
        return electron_1.ipcRenderer.invoke('system:detect-capabilities');
    }
});
console.log('Preload script loaded successfully');
