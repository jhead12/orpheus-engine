import { MIDISettings } from '../types';

export const updateMIDISettings = (
  current: MIDISettings,
  updates: Partial<MIDISettings>
): MIDISettings => {
  return {
    ...current,
    ...updates
  };
};

export const midiSettingsFields = [
  {
    id: 'inputDevices',
    label: 'MIDI Input Devices',
    description: 'Select MIDI input devices to enable',
    type: 'multiselect'
  },
  {
    id: 'outputDevices',
    label: 'MIDI Output Devices',
    description: 'Select MIDI output devices to enable',
    type: 'multiselect'
  },
  {
    id: 'enableMPE',
    label: 'Enable MPE',
    description: 'Enable MIDI Polyphonic Expression support',
    type: 'boolean'
  }
];

// Function to access Web MIDI API and get MIDI devices
export async function getMIDIDevices() {
  if (!navigator.requestMIDIAccess) {
    return { inputs: [], outputs: [] };
  }

  try {
    const midiAccess = await navigator.requestMIDIAccess();
    
    const inputs = Array.from(midiAccess.inputs.values()).map(input => ({ 
      label: input.name || `Input ${input.id}`, 
      value: input.id 
    }));
    
    const outputs = Array.from(midiAccess.outputs.values()).map(output => ({ 
      label: output.name || `Output ${output.id}`, 
      value: output.id 
    }));
    
    return { inputs, outputs };
  } catch (error) {
    console.error('Error accessing MIDI devices:', error);
    return { inputs: [], outputs: [] };
  }
}
