/** @jsx React.createElement */
/** @jsxRuntime classic */
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useWorkstation, WorkstationContextType } from '../contexts/WorkstationContext';
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

/**
 * Example implementation of Ceramic connector
 * This is a simple mock implementation for demonstration purposes
 * @returns A connector for interacting with Ceramic Network
 */
const createCeramicConnector = (): CeramicConnector => {
  return {
    connect: async (_ceramic: any): Promise<void> => {
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
    storeFile: async (_data: any) => {
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
  const workstation: WorkstationContextType = useWorkstation();
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
    if (!workstation.saveWorkstation) {
      alert('Save functionality not available');
      return;
    }

    // We've already checked that the property exists, so it's safe to call without the assertion
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
    
    if (!workstation.loadWorkstation) {
      alert('Load functionality not available');
      return;
    }
    
    // We've already checked that the property exists, so it's safe to call without the assertion
    const success = await workstation.loadWorkstation(selectedWorkstationId);
    if (success) {
      console.log(`Loaded workstation with ID: ${selectedWorkstationId}`);
    } else {
      alert('Failed to load workstation');
    }
  };
  
  const loadAvailableWorkstations = async () => {
    try {
      if (!workstation.listWorkstations) {
        console.warn('List workstations functionality not available');
        setAvailableWorkstations([]);
        return;
      }
      
      // We've already checked that the property exists, so it's safe to call without the assertion
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
  
  // Use React.createElement instead of JSX to avoid TypeScript compilation issues
  return React.createElement(
    'div',
    null,
    React.createElement('h2', null, 'Web3 Storage Integration'),
    React.createElement('button', { onClick: handleSaveToWeb3 }, 'Save to Web3'),
    React.createElement('h3', null, 'Load Workstation'),
    React.createElement('button', { onClick: loadAvailableWorkstations }, 'Refresh Workstation List'),
    React.createElement(
      'div',
      null,
      React.createElement(
        'select',
        {
          value: selectedWorkstationId,
          onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setSelectedWorkstationId(e.target.value),
          style: { margin: '10px 0', display: 'block' }
        },
        React.createElement('option', { value: '' }, 'Select a workstation'),
        availableWorkstations.map((ws) =>
          React.createElement('option', { key: ws.id, value: ws.id }, ws.name)
        )
      ),
      React.createElement(
        'button',
        {
          onClick: handleLoadFromWeb3,
          disabled: !selectedWorkstationId
        },
        'Load Selected Workstation'
      )
    )
  );
};
