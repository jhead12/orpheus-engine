import { BrowserWindow, type MenuItemConstructorOptions } from "electron";
import { AutomationLane, AutomationMode, Clip, Track } from "./types";
export default class ContextMenuBuilder {
    mainWindow: BrowserWindow;
    constructor(mainWindow: BrowserWindow);
    buildContextMenus(): void;
    buildAddAutomationContextMenu(lanes: AutomationLane[]): MenuItemConstructorOptions[];
    buildAutomationContextMenu(showPasteOptions?: boolean, disablePaste?: boolean): MenuItemConstructorOptions[];
    buildAutomationModesContextMenu(mode: AutomationMode): Electron.MenuItemConstructorOptions[];
    buildClipContextMenu(clip: Clip): Electron.MenuItemConstructorOptions[];
    buildDefaultContextMenu(selectedText: string): Electron.MenuItemConstructorOptions[];
    buildFXChainPresetMenu(presetModified: boolean): MenuItemConstructorOptions[];
    buildLaneContextMenu(track: Track, disablePaste?: boolean): MenuItemConstructorOptions[];
    buildNodeContextMenu(): MenuItemConstructorOptions[];
    buildRegionContextMenu(trackRegion: boolean): MenuItemConstructorOptions[];
    buildTrackContextMenu(): MenuItemConstructorOptions[];
}
