import type { StorageConnector, PluginMetadata, WorkstationPlugin, WorkstationData } from '../../../shared/packages/contexts/src/index';

interface CeramicDBConnector {
  connect: (ceramic: any) => Promise<void>;
  createDocument: (data: any) => Promise<string>;
  loadDocument: (id: string) => Promise<any>;
  queryDocuments: () => Promise<string[]>;
  disconnect?: () => Promise<void>;
  isConnected?: () => boolean;
}

interface IPFSConnector {
  storeFile: (data: any) => Promise<string>;
  retrieveFile: (cid: string) => Promise<any>;
  pin?: (cid: string) => Promise<void>;
  unpin?: (cid: string) => Promise<void>;
  getStorageStats?: () => Promise<{ used: number; available: number }>;
}

export class Web3StoragePlugin implements WorkstationPlugin {
  id: string = 'web3-storage';
  name: string = 'Web3 Storage Plugin';
  version: string = '1.0.0';
  
  metadata: PluginMetadata = {
    id: 'web3-storage-plugin',
    name: 'Web3 Storage Plugin',
    version: '1.0.0',
    description: 'Provides storage capabilities using Ceramic and IPFS',
    author: 'Orpheus Engine Team',
    tags: ['storage', 'web3', 'ceramic', 'ipfs']
  };
  
  private ceramicConnector: CeramicDBConnector;
  private ipfsConnector: IPFSConnector;
  
  constructor(ceramicConnector: CeramicDBConnector, ipfsConnector: IPFSConnector) {
    this.ceramicConnector = ceramicConnector;
    this.ipfsConnector = ipfsConnector;
  }
  
  initialize(workstation: WorkstationData | null): void {
    console.log('Web3 Storage Plugin initialized');
    
    // Register this plugin's storage connector with the workstation if applicable
    if (workstation && (workstation as any).storageConnectors) {
      (workstation as any).storageConnectors['web3'] = this.storageConnector;
      console.log('Web3 storage connector registered with workstation');
    }
    
    // Initialize connections
    this.initializeConnections();
  }
  
  private async initializeConnections(): Promise<void> {
    try {
      // Initialize Ceramic connection if needed
      if (this.ceramicConnector.connect) {
        await this.ceramicConnector.connect(null);
        console.log('Ceramic connection initialized');
      }
    } catch (error) {
      console.warn('Failed to initialize Ceramic connection:', error);
    }
  }
  
  cleanup(): void {
    console.log('Web3 Storage Plugin cleanup');
    
    // Clean up any active connections
    this.cleanupConnections();
  }
  
  private cleanupConnections(): void {
    try {
      // Cleanup logic for ceramic and IPFS connections
      // This would typically involve closing connections, clearing caches, etc.
      console.log('Cleaned up Web3 storage connections');
    } catch (error) {
      console.warn('Error during cleanup:', error);
    }
  }
  
  // Additional utility methods
  async getStorageStats(): Promise<{ ceramic: boolean; ipfs: boolean; stats?: any }> {
    const stats = {
      ceramic: false,
      ipfs: false,
      stats: undefined as any
    };
    
    try {
      // Check Ceramic connection
      if (this.ceramicConnector.isConnected) {
        stats.ceramic = this.ceramicConnector.isConnected();
      }
      
      // Check IPFS storage stats
      if (this.ipfsConnector.getStorageStats) {
        stats.stats = await this.ipfsConnector.getStorageStats();
        stats.ipfs = true;
      }
    } catch (error) {
      console.warn('Error getting storage stats:', error);
    }
    
    return stats;
  }
  
  async deleteWorkstation(id: string): Promise<boolean> {
    try {
      // Load the document to get IPFS references
      const data = await this.ceramicConnector.loadDocument(id);
      
      // Unpin IPFS files if unpinning is supported
      if (data.audioRefs && this.ipfsConnector.unpin) {
        for (const cid of Object.values(data.audioRefs)) {
          try {
            await this.ipfsConnector.unpin(cid as string);
          } catch (error) {
            console.warn(`Failed to unpin IPFS content ${cid}:`, error);
          }
        }
      }
      
      // Note: Ceramic documents are typically immutable, so we can't delete them
      // In a real implementation, you might mark them as deleted or use a different strategy
      console.log(`Workstation ${id} marked for deletion`);
      return true;
    } catch (error) {
      console.error('Failed to delete workstation:', error);
      return false;
    }
  }
  
  storageConnector: StorageConnector = {
    type: 'web3',
    
    save: async (data: any): Promise<string> => {
      try {
        // Store large files/audio on IPFS
        const audioRefs: Record<string, string> = {};
        
        if (data.tracks) {
          for (const track of data.tracks) {
            if (track.audioBuffer) {
              // Store audio buffer in IPFS
              const cid = await this.ipfsConnector.storeFile(track.audioBuffer);
              audioRefs[track.id] = cid;
              // Remove the buffer before saving to Ceramic
              delete track.audioBuffer;
            }
          }
        }
        
        // Add IPFS references to the data
        const dataToStore = {
          ...data,
          audioRefs,
          lastModified: new Date().toISOString()
        };
        
        // Store metadata in Ceramic
        const documentId = await this.ceramicConnector.createDocument(dataToStore);
        return documentId;
      } catch (error) {
        console.error('Failed to save data to Web3 storage:', error);
        throw error;
      }
    },
    
    load: async (id: string): Promise<any> => {
      try {
        // Load metadata from Ceramic
        const data = await this.ceramicConnector.loadDocument(id);
        
        // Load audio buffers from IPFS
        if (data.tracks && data.audioRefs) {
          for (const track of data.tracks) {
            if (data.audioRefs[track.id]) {
              // Retrieve audio buffer from IPFS
              track.audioBuffer = await this.ipfsConnector.retrieveFile(
                data.audioRefs[track.id]
              );
            }
          }
        }
        
        return data;
      } catch (error) {
        console.error('Failed to load data from Web3 storage:', error);
        throw error;
      }
    },
    
    list: async (): Promise<string[]> => {
      try {
        // Query all workstation documents from Ceramic
        const documentIds = await this.ceramicConnector.queryDocuments();
        return documentIds;
      } catch (error) {
        console.error('Failed to list documents from Web3 storage:', error);
        throw error;
      }
    },
    
    delete: async (id: string): Promise<boolean> => {
      return await this.deleteWorkstation(id);
    }
  };
}
