import React, { useState } from 'react';
import { useMixer } from '../contexts/MixerContext'; 
import AudioSearchPanel from './search/AudioSearchPanel';
import Editor, { AudioAnalysisProvider } from '../screens/workstation/Editor';
import './Workstation.css';

const Workstation: React.FC = () => {
  const { mixerHeight } = useMixer();
  const [showAudioSearch, setShowAudioSearch] = useState(false);
  
  const handleImportAudio = (filePath: string, startTime?: number, endTime?: number) => {
    console.log('Importing audio:', { filePath, startTime, endTime });
    // Your implementation to add audio to the DAW timeline
    // This would integrate with your existing audio management system
  };
  
  const toggleAudioSearch = () => {
    setShowAudioSearch(!showAudioSearch);
  };
  
  return (
    <div style={{ height: `calc(100% - ${mixerHeight}px)` }} className="workstation-container">
      <div className="workstation-toolbar">
        <button 
          className={`toolbar-button ${showAudioSearch ? 'active' : ''}`} 
          onClick={toggleAudioSearch}
        >
          Audio Search
        </button>
        {/* Other toolbar buttons */}
      </div>
      
      <div className="workstation-main">
        <div className="workstation-content">
          {/* Main DAW Editor with tracks, timeline, mixer */}
          <AudioAnalysisProvider>
            <Editor />
          </AudioAnalysisProvider>
        </div>
        
        {showAudioSearch && (
          <div className="workstation-sidebar">
            <AudioSearchPanel onImportAudio={handleImportAudio} />
          </div>
        )}
      </div>
    </div>
  );
};

// Export with a wrapper that ensures the provider hierarchy is correct
export default Workstation;
