"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const menu_1 = __importDefault(require("./menu"));
const contextMenu_1 = __importDefault(require("./contextMenu"));
const handlers_1 = __importDefault(require("./handlers"));
function createWindow() {
    const mainWindow = new electron_1.BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
            devTools: !electron_1.app.isPackaged
        },
        fullscreen: true
    });
    if (electron_1.app.isPackaged) {
        mainWindow.loadFile(path_1.default.join(__dirname, '../src/index.html'));
    }
    else {
        mainWindow.loadURL("http://localhost:5173");
        mainWindow.webContents.openDevTools();
    }
    const menuBuilder = new menu_1.default(mainWindow);
    const contextMenuBuilder = new contextMenu_1.default(mainWindow);
    menuBuilder.buildMenu();
    contextMenuBuilder.buildContextMenus();
    (0, handlers_1.default)(mainWindow);
}
electron_1.app.whenReady().then(() => {
    createWindow();
    electron_1.app.on('activate', function () {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
electron_1.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin')
        electron_1.app.quit();
});
//# sourceMappingURL=main.js.map