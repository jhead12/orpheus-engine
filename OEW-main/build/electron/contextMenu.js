"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const types_1 = require("./../src/services/types/types");
const channels_1 = require("./../src/services/electron/channels");
class ContextMenuBuilder {
    mainWindow;
    constructor(mainWindow) {
        this.mainWindow = mainWindow;
    }
    buildContextMenus() {
        electron_1.ipcMain.on(channels_1.OPEN_CONTEXT_MENU, (_, contextMenuType, params) => {
            let menu = [];
            switch (contextMenuType) {
                case types_1.ContextMenuType.AddAutomationLane:
                    menu = this.buildAddAutomationContextMenu(params.lanes);
                    break;
                case types_1.ContextMenuType.Automation:
                    menu = this.buildAutomationContextMenu(!!params.showPasteOptions, params.disablePaste);
                    break;
                case types_1.ContextMenuType.AutomationMode:
                    menu = this.buildAutomationModesContextMenu(params.mode);
                    break;
                case types_1.ContextMenuType.Clip:
                    menu = this.buildClipContextMenu(params.clip);
                    break;
                case types_1.ContextMenuType.FXChainPreset:
                    menu = this.buildFXChainPresetMenu(params.presetModified);
                    break;
                case types_1.ContextMenuType.Lane:
                    menu = this.buildLaneContextMenu(params.track, params.disablePaste);
                    break;
                case types_1.ContextMenuType.Node:
                    menu = this.buildNodeContextMenu();
                    break;
                case types_1.ContextMenuType.Region:
                    menu = this.buildRegionContextMenu(!!params.trackRegion);
                    break;
                case types_1.ContextMenuType.Text:
                    menu = this.buildDefaultContextMenu(params.selectedText);
                    break;
                case types_1.ContextMenuType.Track:
                    menu = this.buildTrackContextMenu();
                    break;
            }
            if (menu.length) {
                electron_1.Menu.buildFromTemplate(menu).popup({
                    window: this.mainWindow,
                    callback: () => this.mainWindow.webContents.send(channels_1.CLOSE_CONTEXT_MENU)
                });
            }
        });
    }
    buildAddAutomationContextMenu(lanes) {
        const menu = [
            ...lanes.map(lane => {
                return {
                    enabled: !lane.show,
                    label: lane.label,
                    click: () => this.mainWindow.webContents.send(channels_1.SELECT_CONTEXT_MENU_ITEM, { lane })
                };
            }),
        ];
        return menu;
    }
    buildAutomationContextMenu(showPasteOptions, disablePaste) {
        const menu = [
            {
                label: "Hide Automation",
                click: () => {
                    this.mainWindow.webContents.send(channels_1.SELECT_CONTEXT_MENU_ITEM, { action: 0 });
                }
            },
            {
                label: "Clear Automation",
                click: () => {
                    this.mainWindow.webContents.send(channels_1.SELECT_CONTEXT_MENU_ITEM, { action: 1 });
                }
            },
            {
                label: "Remove Automation",
                click: () => {
                    this.mainWindow.webContents.send(channels_1.SELECT_CONTEXT_MENU_ITEM, { action: 2 });
                }
            }
        ];
        if (showPasteOptions) {
            menu.push({ type: "separator" }, {
                label: "Paste At Playhead",
                accelerator: "CmdOrCtrl+V",
                click: () => {
                    this.mainWindow.webContents.send(channels_1.SELECT_CONTEXT_MENU_ITEM, { action: 3 });
                },
                enabled: !disablePaste
            }, {
                label: "Paste",
                click: () => {
                    this.mainWindow.webContents.send(channels_1.SELECT_CONTEXT_MENU_ITEM, { action: 4 });
                },
                enabled: !disablePaste
            });
        }
        return menu;
    }
    buildAutomationModesContextMenu(mode) {
        const menu = Object.values(types_1.AutomationMode).map(value => ({
            type: "radio",
            label: value,
            checked: mode === value,
            click: () => this.mainWindow.webContents.send(channels_1.SELECT_CONTEXT_MENU_ITEM, { mode: value })
        }));
        return menu;
    }
    buildClipContextMenu(clip) {
        const menu = [
            { label: "Cut", role: "cut", accelerator: "CmdOrCtrl+X" },
            { label: "Copy", role: "copy", accelerator: "CmdOrCtrl+C" },
            {
                label: "Delete",
                accelerator: "Delete",
                registerAccelerator: false,
                click: () => {
                    this.mainWindow.webContents.send(channels_1.SELECT_CONTEXT_MENU_ITEM, { action: 0 });
                }
            },
            { type: "separator" },
            {
                label: "Rename",
                accelerator: "F2",
                registerAccelerator: false,
                click: () => {
                    this.mainWindow.webContents.send(channels_1.SELECT_CONTEXT_MENU_ITEM, { action: 1 });
                }
            },
            {
                label: "Set Song Region To Clip",
                click: () => {
                    this.mainWindow.webContents.send(channels_1.SELECT_CONTEXT_MENU_ITEM, { action: 2 });
                }
            },
            { type: "separator" },
            {
                label: "Duplicate",
                accelerator: "CmdOrCtrl+D",
                registerAccelerator: false,
                click: () => {
                    this.mainWindow.webContents.send(channels_1.SELECT_CONTEXT_MENU_ITEM, { action: 3 });
                }
            },
            {
                label: "Split",
                accelerator: "CmdOrCtrl+Alt+S",
                registerAccelerator: false,
                click: () => {
                    this.mainWindow.webContents.send(channels_1.SELECT_CONTEXT_MENU_ITEM, { action: 4 });
                }
            },
            {
                label: "Consolidate",
                accelerator: "CmdOrCtrl+Shift+C",
                registerAccelerator: false,
                click: () => {
                    this.mainWindow.webContents.send(channels_1.SELECT_CONTEXT_MENU_ITEM, { action: 5 });
                }
            },
            { type: "separator" },
            {
                label: clip.muted ? "Unmute" : "Mute",
                accelerator: "CmdOrCtrl+Shift+M",
                registerAccelerator: false,
                click: () => {
                    this.mainWindow.webContents.send(channels_1.SELECT_CONTEXT_MENU_ITEM, { action: 6 });
                }
            }
        ];
        if (clip.type === types_1.TrackType.Audio && clip.audio) {
            menu.push({ type: "separator", visible: Boolean(clip.audio) }, {
                label: "Effects",
                submenu: [
                    {
                        label: "Reverse",
                        click: () => {
                            this.mainWindow.webContents.send(channels_1.SELECT_CONTEXT_MENU_ITEM, { action: 7 });
                        }
                    }
                ]
            });
        }
        return menu;
    }
    buildDefaultContextMenu(selectedText) {
        const trimmed = selectedText.trim();
        let menu = [];
        if (process.platform === "darwin" && trimmed.length > 0) {
            menu.push({
                label: `Look Up "${trimmed}"`,
                click: () => {
                    this.mainWindow.webContents.showDefinitionForSelection();
                }
            }, {
                label: "Search With Google",
                click: () => {
                    electron_1.shell.openExternal(`https://google.com/search?q=${encodeURIComponent(trimmed)}`);
                }
            }, { type: "separator" });
        }
        menu.push({ label: "Undo", role: "undo", accelerator: "CmdOrCtrl+Z" }, { label: "Redo", role: "redo", accelerator: "Shift+CmdOrCtrl+Z" }, { type: "separator" }, {
            label: "Cut",
            accelerator: "CmdOrCtrl+X",
            enabled: selectedText.length > 0,
            click: () => this.mainWindow.webContents.cut()
        }, {
            label: "Copy",
            accelerator: "CmdOrCtrl+C",
            enabled: selectedText.length > 0,
            click: () => this.mainWindow.webContents.copy()
        }, { label: "Paste", role: "paste", accelerator: "CmdOrCtrl+V" }, { type: "separator" }, { label: "Select All", role: "selectAll", accelerator: "CmdOrCtrl+A" }, { type: "separator" });
        if (process.platform === "darwin") {
            menu.push({ label: "Share", role: "shareMenu", sharingItem: { texts: [selectedText] } }, { type: "separator" }, {
                label: "Substitutions",
                submenu: [
                    { label: "Show Substitutions", role: "showSubstitutions" },
                    { type: "separator" },
                    { label: "Smart Quotes", role: "toggleSmartQuotes" },
                    { label: "Smart Dashes", role: "toggleSmartDashes" },
                    { label: "Text Replacement", role: "toggleTextReplacement" },
                ]
            });
        }
        if (trimmed.length > 0 && /[a-zA-Z]/.test(trimmed)) {
            menu.push({
                label: "Transformations",
                submenu: [
                    {
                        label: "Make Upper Case",
                        click: () => {
                            this.mainWindow.webContents.replace(trimmed.toUpperCase());
                        }
                    },
                    {
                        label: "Make Lower Case",
                        click: () => {
                            this.mainWindow.webContents.replace(trimmed.toLowerCase());
                        }
                    },
                    {
                        label: "Capitalize",
                        click: () => {
                            this.mainWindow.webContents.replace(trimmed.toLowerCase()
                                .replace(/\b./g, l => l.toUpperCase()));
                        }
                    }
                ]
            });
        }
        if (process.platform === "darwin") {
            menu.push({
                label: "Speech",
                submenu: [
                    { label: "Start Speaking", role: "startSpeaking" },
                    { label: "Stop Speaking", role: "stopSpeaking" },
                ]
            });
        }
        return menu;
    }
    buildFXChainPresetMenu(presetModified) {
        const menu = [
            {
                label: "Save As New FX Chain Preset",
                click: () => {
                    this.mainWindow.webContents.send(channels_1.SELECT_CONTEXT_MENU_ITEM, { action: 0 });
                }
            },
            { type: "separator" },
            {
                label: "Rename",
                click: () => {
                    this.mainWindow.webContents.send(channels_1.SELECT_CONTEXT_MENU_ITEM, { action: 1 });
                }
            },
            {
                enabled: presetModified,
                label: "Reset",
                click: () => {
                    this.mainWindow.webContents.send(channels_1.SELECT_CONTEXT_MENU_ITEM, { action: 2 });
                }
            },
            {
                label: "Delete",
                click: () => {
                    this.mainWindow.webContents.send(channels_1.SELECT_CONTEXT_MENU_ITEM, { action: 3 });
                }
            }
        ];
        return menu;
    }
    buildLaneContextMenu(track, disablePaste) {
        const menu = [];
        if (track) {
            if (track.type === types_1.TrackType.Audio || track.type === types_1.TrackType.Midi) {
                menu.push({
                    label: `Insert ${track.type === types_1.TrackType.Audio ? "Audio" : "MIDI"} File(s)...`,
                    click: () => {
                        this.mainWindow.webContents.send(channels_1.SELECT_CONTEXT_MENU_ITEM, { action: 0 });
                    }
                }, { type: "separator" });
            }
        }
        menu.push({
            label: "Paste At Playhead",
            accelerator: "CmdOrCtrl+V",
            click: () => {
                this.mainWindow.webContents.send(channels_1.SELECT_CONTEXT_MENU_ITEM, { action: 1 });
            },
            enabled: !disablePaste
        }, {
            label: "Paste",
            click: () => {
                this.mainWindow.webContents.send(channels_1.SELECT_CONTEXT_MENU_ITEM, { action: 2 });
            },
            enabled: !disablePaste
        });
        return menu;
    }
    buildNodeContextMenu() {
        const menu = [
            { label: "Cut", role: "cut", accelerator: "CmdOrCtrl+X" },
            { label: "Copy", role: "copy", accelerator: "CmdOrCtrl+C" },
            {
                label: "Delete",
                accelerator: "Delete",
                registerAccelerator: false,
                click: () => {
                    this.mainWindow.webContents.send(channels_1.SELECT_CONTEXT_MENU_ITEM, { action: 0 });
                }
            },
            {
                label: "Type Value",
                click: () => {
                    this.mainWindow.webContents.send(channels_1.SELECT_CONTEXT_MENU_ITEM, { action: 1 });
                }
            }
        ];
        return menu;
    }
    buildRegionContextMenu(trackRegion) {
        const menu = [];
        if (trackRegion) {
            menu.push({
                label: "Create Clip from Region",
                accelerator: "CmdOrCtrl+Alt+C",
                registerAccelerator: false,
                click: () => {
                    this.mainWindow.webContents.send(channels_1.SELECT_CONTEXT_MENU_ITEM, { action: 0 });
                }
            }, { type: "separator" });
        }
        menu.push({
            label: "Delete Region",
            click: () => {
                this.mainWindow.webContents.send(channels_1.SELECT_CONTEXT_MENU_ITEM, { action: 1 });
            }
        });
        return menu;
    }
    buildTrackContextMenu() {
        const menu = [
            {
                label: "Duplicate",
                accelerator: "CmdOrCtrl+D",
                click: () => {
                    this.mainWindow.webContents.send(channels_1.SELECT_CONTEXT_MENU_ITEM, { action: 0 });
                }
            },
            {
                label: "Delete",
                accelerator: "Delete",
                click: () => {
                    this.mainWindow.webContents.send(channels_1.SELECT_CONTEXT_MENU_ITEM, { action: 1 });
                }
            },
            { type: "separator" },
            {
                label: "Change Hue",
                click: () => {
                    this.mainWindow.webContents.send(channels_1.SELECT_CONTEXT_MENU_ITEM, { action: 2 });
                }
            }
        ];
        return menu;
    }
}
exports.default = ContextMenuBuilder;
//# sourceMappingURL=contextMenu.js.map