"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const channels_1 = require("../src/services/electron/channels");
const types_1 = require("../src/services/types/types");
class MenuBuilder {
    mainWindow;
    constructor(mainWindow) {
        this.mainWindow = mainWindow;
    }
    buildMenu() {
        let template;
        if (process.platform === "darwin")
            template = this.buildDarwinTemplate();
        else
            template = this.buildDefaultTemplate();
        const menu = electron_1.Menu.buildFromTemplate(template);
        electron_1.Menu.setApplicationMenu(menu);
        return menu;
    }
    buildBaseTemplate() {
        const subMenuFile = {
            label: "File",
            submenu: [
                {
                    label: "New",
                    accelerator: "CmdOrCtrl+N",
                },
                {
                    label: "Open",
                    accelerator: "CmdOrCtrl+O"
                },
                { type: "separator" },
                {
                    label: "Save",
                    accelerator: "CmdOrCtrl+S",
                },
                {
                    label: "Save as...",
                    accelerator: "CmdOrCtrl+Shift+S",
                },
                { type: "separator" },
                {
                    label: "Export",
                    accelerator: "CmdOrCtrl+E",
                },
                { type: "separator" },
                { label: 'Close', role: "close" }
            ]
        };
        const subMenuEdit = {
            label: 'Edit',
            submenu: [
                { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: "undo" },
                { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: "redo" },
                { type: 'separator' },
                { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: "cut" },
                { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: "copy" },
                { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: "paste" },
                { type: "separator" },
                { label: "Select All", role: "selectAll", accelerator: "CmdOrCtrl+A" },
                { type: "separator" },
                {
                    label: "Preferences",
                    accelerator: "CmdOrCtrl+,",
                    click: () => {
                        this.mainWindow.webContents.send(channels_1.OPEN_PREFERENCES);
                    }
                }
            ],
        };
        const subMenuTrack = {
            label: "Track",
            submenu: [
                {
                    label: "Toggle Master Track",
                    accelerator: "CmdOrCtrl+Alt+M",
                    click: () => {
                        this.mainWindow.webContents.send(channels_1.TOGGLE_MASTER_TRACK);
                    }
                },
                { type: "separator" },
                {
                    label: "Insert Audio Track",
                    click: () => {
                        this.mainWindow.webContents.send(channels_1.ADD_TRACK, types_1.TrackType.Audio);
                    }
                },
                {
                    label: "Insert MIDI Track",
                    click: () => {
                        this.mainWindow.webContents.send(channels_1.ADD_TRACK, types_1.TrackType.Midi);
                    }
                },
                {
                    label: "Insert Step Sequencer Track",
                    click: () => {
                        this.mainWindow.webContents.send(channels_1.ADD_TRACK, types_1.TrackType.Sequencer);
                    }
                },
            ]
        };
        const subMenuView = {
            label: "View",
            submenu: [
                {
                    label: "Toggle Mixer",
                    accelerator: "CmdOrCtrl+M",
                    click: () => {
                        this.mainWindow.webContents.send(channels_1.TOGGLE_MIXER);
                    }
                },
                { type: "separator" },
            ]
        };
        const subMenuHelp = {
            label: "Help",
            submenu: []
        };
        return {
            file: subMenuFile,
            edit: subMenuEdit,
            track: subMenuTrack,
            view: subMenuView,
            help: subMenuHelp
        };
    }
    buildDarwinTemplate() {
        const base = this.buildBaseTemplate();
        const subMenuAbout = {
            label: 'REAW',
            submenu: [
                { label: "About REAW", role: 'about' },
                { type: 'separator' },
                {
                    label: "Preferences",
                    accelerator: "CmdOrCtrl+,",
                    registerAccelerator: false,
                    click: () => {
                        this.mainWindow.webContents.send(channels_1.OPEN_PREFERENCES);
                    }
                },
                { type: 'separator' },
                { label: 'Services', role: 'services', submenu: [], registerAccelerator: false },
                { type: 'separator' },
                { label: "Hide REAW", role: 'hide' },
                { role: 'hideOthers' },
                { role: 'unhide' },
                { type: 'separator' },
                { label: "Quit REAW", role: 'quit' }
            ],
        };
        if (!electron_1.app.isPackaged) {
            base.view.submenu.push({
                label: 'Reload',
                accelerator: 'Command+R',
                click: () => {
                    this.mainWindow.webContents.reload();
                },
            }, {
                label: 'Toggle Full Screen',
                accelerator: 'Ctrl+Command+F',
                click: () => {
                    this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
                },
            }, {
                label: 'Toggle Developer Tools',
                accelerator: 'Alt+Command+I',
                click: () => {
                    this.mainWindow.webContents.toggleDevTools();
                },
            }, { type: "separator" }, {
                label: "Actual Size",
                accelerator: "CmdOrCtrl+0",
                click: () => {
                    this.mainWindow.webContents.setZoomLevel(0);
                }
            }, {
                label: "Zoom In",
                accelerator: "CmdOrCtrl+=",
                click: () => {
                    this.mainWindow.webContents.setZoomLevel(this.mainWindow.webContents.getZoomLevel() + 0.1);
                }
            }, {
                label: "Zoom Out",
                accelerator: "CmdOrCtrl+-",
                click: () => {
                    this.mainWindow.webContents.setZoomLevel(this.mainWindow.webContents.getZoomLevel() - 0.1);
                }
            });
        }
        const subMenuWindow = {
            label: 'Window',
            submenu: [
                { label: 'Minimize', role: 'minimize' },
                { label: 'Zoom', role: 'zoom' },
                { type: 'separator' },
                { label: 'Bring All to Front', role: "front" },
            ],
        };
        return [subMenuAbout, base.file, base.edit, base.track, base.view, subMenuWindow, base.help];
    }
    buildDefaultTemplate() {
        const base = this.buildBaseTemplate();
        if (!electron_1.app.isPackaged) {
            base.view.submenu.push({
                label: '&Reload',
                accelerator: 'Ctrl+R',
                click: () => {
                    this.mainWindow.webContents.reload();
                },
            }, {
                label: 'Toggle &Full Screen',
                accelerator: 'F11',
                click: () => {
                    this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
                },
            }, {
                label: 'Toggle &Developer Tools',
                accelerator: 'Alt+Ctrl+I',
                click: () => {
                    this.mainWindow.webContents.toggleDevTools();
                },
            }, { type: "separator" }, {
                label: "Actual Size",
                accelerator: "Ctrl+0",
                click: () => {
                    this.mainWindow.webContents.setZoomLevel(0);
                }
            }, {
                label: "Zoom In",
                accelerator: "Ctrl+=",
                click: () => {
                    this.mainWindow.webContents.setZoomLevel(this.mainWindow.webContents.getZoomLevel() + 0.1);
                }
            }, {
                label: "Zoom Out",
                accelerator: "Ctrl+-",
                click: () => {
                    this.mainWindow.webContents.setZoomLevel(this.mainWindow.webContents.getZoomLevel() - 0.1);
                }
            });
        }
        base.view.submenu.push({
            label: 'Toggle &Full Screen',
            accelerator: 'F11',
            click: () => {
                this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
            },
        });
        const subMenuWindow = {
            label: '&Window',
            submenu: []
        };
        return [base.file, base.edit, base.track, base.view, subMenuWindow, base.help];
    }
}
exports.default = MenuBuilder;
//# sourceMappingURL=menu.js.map