import React, { useEffect, useState } from 'react';
import { useWorkstation } from '../contexts/WorkstationContext';
import { Web3StoragePlugin } from '../plugins/Web3StoragePlugin';

// Define TypeScript interfaces for improved type safety
interface CeramicConnector {
  connect: (ceramic: any) => Promise<void>;
  createDocument: (data: any) => Promise<string>;
  loadDocument: (id: string) => Promise<WorkstationData>;
  queryDocuments: () => Promise<string[]>;
}

interface WorkstationData {
  name: string;
  tracks: any[];
  [key: string]: any;
}

interface WorkstationItem {
  id: string;
  name: string;
  dateCreated: string;
}

/**
 * Example implementation of Ceramic connector
 * This is a simple mock implementation for demonstration purposes
 * @returns A connector for interacting with Ceramic Network
 */
const createCeramicConnector = (): CeramicConnector => {
  return {
    connect: async (ceramic: any): Promise<void> => {
      console.log('Connected to Ceramic');
    },
    createDocument: async (data: any): Promise<string> => {
      console.log('Creating document in Ceramic', data);
      return `ceramic://doc-${Date.now()}`; // Placeholder
    },
    loadDocument: async (id: string): Promise<WorkstationData> => {
      console.log(`Loading document ${id} from Ceramic`);
      return { name: 'Example Workstation', tracks: [] }; // Placeholder
    },
    queryDocuments: async (): Promise<string[]> => {
      return ['ceramic://doc-1', 'ceramic://doc-2']; // Placeholder
    }
  };
};

// Example implementation of IPFS connector
const createIPFSConnector = () => {
  return {
    storeFile: async (data: any) => {
      console.log('Storing file in IPFS');
      return `ipfs://QmExample${Date.now()}`; // Placeholder
    },
    retrieveFile: async (cid: string) => {
      console.log(`Retrieving file ${cid} from IPFS`);
      return new ArrayBuffer(0); // Placeholder
    }
  };
};

export const Web3Integration: React.FC = () => {
  const workstation = useWorkstation();
  const [availableWorkstations, setAvailableWorkstations] = useState<{ id: string; name: string }[]>([]);
  const [selectedWorkstationId, setSelectedWorkstationId] = useState<string>('');

  useEffect(() => {
    // Create and register Web3 storage plugin
    const ceramicConnector = createCeramicConnector();
    const ipfsConnector = createIPFSConnector();
    
    const web3Plugin = new Web3StoragePlugin(ceramicConnector, ipfsConnector);
    workstation.registerPlugin(web3Plugin);
    
    return () => {
      // Clean up plugin when component unmounts
      workstation.unregisterPlugin(web3Plugin.metadata.id);
    };
  }, [workstation]);
  
  const handleSaveToWeb3 = async () => {
    const id = await workstation.saveWorkstation('My Web3 Workstation');
    if (id) {
      console.log(`Saved workstation with ID: ${id}`);
      // Refresh the list after saving
      loadAvailableWorkstations();
    }
  };
  
  const handleLoadFromWeb3 = async () => {
    if (!selectedWorkstationId) {
      alert('Please select a workstation to load');
      return;
    }
    
    const success = await workstation.loadWorkstation(selectedWorkstationId);
    if (success) {
      console.log(`Loaded workstation with ID: ${selectedWorkstationId}`);
    } else {
      alert('Failed to load workstation');
    }
  };
  
  const loadAvailableWorkstations = async () => {
    try {
      const workstationList = await workstation.listWorkstations();
      
      // More robust implementation with better type handling
      const formattedWorkstations: {id: string, name: string}[] = [];
      
      if (Array.isArray(workstationList)) {
        workstationList.forEach(item => {
          // Handle string IDs
          if (typeof item === 'string') {
            formattedWorkstations.push({ 
              id: item, 
              name: `Workstation ${item}` 
            });
          }
          // Handle objects with safer property access
          else if (item && typeof item === 'object') {
            const id = String((item as any).id || (item as any)._id || '');
            const name = String((item as any).name || (item as any).title || `Workstation ${id}`);
            
            if (id) {
              formattedWorkstations.push({ id, name });
            }
          }
        });
      }
      
      setAvailableWorkstations(formattedWorkstations);
    } catch (error) {
      console.error('Error listing workstations:', error);
      setAvailableWorkstations([]);
    }
  };
  
  return (
    <div>
      <h2>Web3 Storage Integration</h2>
      <button onClick={handleSaveToWeb3}>Save to Web3</button>
      
      <h3>Load Workstation</h3>
      <button onClick={loadAvailableWorkstations}>
        Refresh Workstation List
      </button>
      
      <div>
        <select 
          value={selectedWorkstationId}
          onChange={(e) => setSelectedWorkstationId(e.target.value)}
          style={{ margin: '10px 0', display: 'block' }}
        >
          <option value="">Select a workstation</option>
          {availableWorkstations.map((ws) => (
            <option key={ws.id} value={ws.id}>
              {ws.name}
            </option>
          ))}
        </select>

        <button
          onClick={handleLoadFromWeb3}
          disabled={!selectedWorkstationId}
        >
          Load Selected Workstation
        </button>
      </div>
    </div>
  );
};
