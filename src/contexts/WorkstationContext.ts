import React, { useContext } from 'react';

// Plugin metadata interface
export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  author?: string;
  tags?: string[];
}

// Storage connector interface for plugin implementations
export interface StorageConnector {
  type: string;
  save: (data: any) => Promise<string>;
  load: (id: string) => Promise<any>;
  list: () => Promise<string[]>;
  delete?: (id: string) => Promise<boolean>;
}

// Base interface for all workstation plugins
export interface WorkstationPlugin {
  metadata: PluginMetadata;
  initialize: (workstation: any) => void;
  cleanup: () => void;
  storageConnector?: StorageConnector;
  // Other optional plugin interfaces can be added here
}

// Workstation data interface
export interface WorkstationData {
  id?: string;
  name: string;
  tracks: any[];
  effects?: any[];
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
}

// Workstation context interface
export interface WorkstationContextType {
  // Existing plugin management
  plugins: WorkstationPlugin[];
  registerPlugin: (plugin: WorkstationPlugin) => void;
  unregisterPlugin: (pluginId: string) => void;
  getPlugin: (pluginId: string) => WorkstationPlugin | undefined;
  storageConnectors: Record<string, StorageConnector>;
  
  // Workstation data management
  currentWorkstation: WorkstationData | null;
  saveWorkstation: (name: string) => Promise<string | null>;
  loadWorkstation: (id: string) => Promise<boolean>;
  listWorkstations: () => Promise<string[]>;
  createNewWorkstation: (name: string) => void;
}

// Create the context with default values
const WorkstationContext = React.createContext<WorkstationContextType>({
  plugins: [],
  registerPlugin: () => {},
  unregisterPlugin: () => {},
  getPlugin: () => undefined,
  storageConnectors: {},
  
  currentWorkstation: null,
  saveWorkstation: async () => null,
  loadWorkstation: async () => false,
  listWorkstations: async () => [],
  createNewWorkstation: () => {}
});

// Create a hook to use the workstation context
export const useWorkstation = (): WorkstationContextType => {
  const context = useContext(WorkstationContext);
  if (!context) {
    throw new Error('useWorkstation must be used within a WorkstationProvider');
  }
  return context;
};

export default WorkstationContext;
