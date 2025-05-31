import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  invoke: (channel: string, args: any) => {
    // Whitelist channels
    const validChannels = ['mcp:analyze'];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, args);
    }
    
    return Promise.reject(new Error(`Unauthorized IPC channel: ${channel}`));
  },
  
  // Add other Electron API methods as needed
  platform: () => process.platform,
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  saveFile: (content: string, defaultPath?: string) => 
    ipcRenderer.invoke('dialog:saveFile', content, defaultPath),
  
  // Event listeners
  on: (channel: string, func: (...args: any[]) => void) => {
    const validChannels = ['context-menu-result'];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes sender 
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
  
  // Events
  openContextMenu: (type: string, params: any) => 
    ipcRenderer.invoke('context-menu:open', { type, params })
});
