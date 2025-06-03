/**
 * Utilities for interacting with Electron
 */
import { ContextMenuType } from '../../services/types/types';

// Define the electron API interface
interface ElectronAPI {
  openFile: () => Promise<string[]>;
  saveFile: (content: string, defaultPath?: string) => Promise<string | null>;
  showOpenDialog: (options: any) => Promise<{ canceled: boolean; filePaths: string[] }>;
  showSaveDialog: (options: any) => Promise<{ canceled: boolean; filePath: string }>;
  showMessageBox: (options: any) => Promise<{ response: number; checkboxChecked: boolean }>;
  platform: () => 'darwin' | 'win32' | 'linux';
  addRecentDocument: (path: string) => void;
  setTitle: (title: string) => void;
  openContextMenu: (type: string, params: any) => void;
  quit: () => void;
  reload: () => void;
  toggleDevTools: () => void;
}

// This is replaced at runtime with the actual electron API exposed by the preload script
export const electronAPI = (window.electron as unknown) as ElectronAPI;

/**
 * Opens a context menu of the specified type
 */
export function openContextMenu<T>(
  contextMenuType: ContextMenuType, 
  params: Record<string, any>,
  callback: (result: T) => void
): void {
  const handleContextMenuResult = (event: CustomEvent) => {
    callback(event.detail as T);
    window.removeEventListener('contextMenuResult', handleContextMenuResult as EventListener);
  };

  window.addEventListener('contextMenuResult', handleContextMenuResult as EventListener);
  electronAPI.openContextMenu(contextMenuType.toString(), params);
}

/**
 * Check if the app is running in Electron
 */
export function isElectron(): boolean {
  return !!(window && window.process && window.process.type);
}
