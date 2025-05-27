import type { WorkstationPlugin, PluginMetadata, StorageConnector } from '../contexts/WorkstationContext';

interface CeramicDBConnector {
  connect: (ceramic: any) => Promise<void>;
  createDocument: (data: any) => Promise<string>;
  loadDocument: (id: string) => Promise<any>;
  queryDocuments: () => Promise<string[]>;
}

interface IPFSConnector {
  storeFile: (data: any) => Promise<string>;
  retrieveFile: (cid: string) => Promise<any>;
}

export class Web3StoragePlugin implements WorkstationPlugin {
  metadata: PluginMetadata = {
    id: 'web3-storage-plugin',
    name: 'Web3 Storage Plugin',
    version: '1.0.0',
    description: 'Provides storage capabilities using Ceramic and IPFS'
  };
  
  private ceramicConnector: CeramicDBConnector;
  private ipfsConnector: IPFSConnector;
  
  constructor(ceramicConnector: CeramicDBConnector, ipfsConnector: IPFSConnector) {
    this.ceramicConnector = ceramicConnector;
    this.ipfsConnector = ipfsConnector;
  }
  
  initialize(workstation: any): void {
    console.log('Web3 Storage Plugin initialized');
  }
  
  cleanup(): void {
    console.log('Web3 Storage Plugin cleanup');
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
    }
  };
}
