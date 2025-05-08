"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    ipcRenderer: {
        invoke: async (channel, ...args) => {
            return electron_1.ipcRenderer.invoke(channel, ...args);
        },
        on: (channel, func) => {
            electron_1.ipcRenderer.on(channel, (_event, ...args) => func(...args));
        },
        once: (channel, func) => {
            electron_1.ipcRenderer.once(channel, (_event, ...args) => func(...args));
        },
        removeAllListeners: (channel) => {
            electron_1.ipcRenderer.removeAllListeners(channel);
        },
        send: (channel, ...args) => {
            electron_1.ipcRenderer.send(channel, ...args);
        }
    }
});
//# sourceMappingURL=preload.js.map