
const { ipcRenderer } = require('electron');

window.electronAPI = {
    getServiceStatuses: () => ipcRenderer.invoke('get-service-statuses'),
    startServices: () => ipcRenderer.invoke('start-services'),
    onStartupBegin: (callback) => ipcRenderer.on('startup-begin', callback),
    onServiceStatusChange: (callback) => ipcRenderer.on('service-status-change', callback),
    onStartupComplete: (callback) => ipcRenderer.on('startup-complete', callback),
};
