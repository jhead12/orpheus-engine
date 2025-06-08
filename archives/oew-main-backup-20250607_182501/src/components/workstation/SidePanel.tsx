import React, { useState } from 'react';
import { useWorkstation } from '../../contexts';

interface SidePanelProps {
  className?: string;
  style?: React.CSSProperties;
}

const SidePanel: React.FC<SidePanelProps> = ({ className = '', style = {} }) => {
  const { 
    tracks, 
    selectedTrackId, 
    setSelectedTrackId, 
    plugins, 
    mixerHeight, 
    showMixer,
    electronAPI = { isAvailable: false }
  } = useWorkstation();
  
  const [activeTab, setActiveTab] = useState<'tracks' | 'plugins' | 'mixer'>('tracks');

  const defaultStyle: React.CSSProperties = {
    width: '300px',
    backgroundColor: '#2d2d2d',
    borderLeft: '1px solid #444',
    display: 'flex',
    flexDirection: 'column',
    color: '#ffffff',
    ...style
  };

  const tabStyle: React.CSSProperties = {
    display: 'flex',
    borderBottom: '1px solid #444'
  };

  const tabButtonStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '12px 16px',
    backgroundColor: active ? '#4ecdc4' : 'transparent',
    color: active ? '#000' : '#fff',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: active ? 'bold' : 'normal'
  });

  const contentStyle: React.CSSProperties = {
    flex: 1,
    padding: '16px',
    overflow: 'auto'
  };

  const trackItemStyle = (isSelected: boolean): React.CSSProperties => ({
    padding: '8px 12px',
    margin: '4px 0',
    backgroundColor: isSelected ? '#4ecdc4' : '#333',
    color: isSelected ? '#000' : '#fff',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  });

  const pluginItemStyle: React.CSSProperties = {
    padding: '8px 12px',
    margin: '4px 0',
    backgroundColor: '#333',
    borderRadius: '4px',
    fontSize: '12px'
  };

  const sectionHeaderStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '12px',
    color: '#4ecdc4'
  };

  const renderTracksTab = () => (
    <div>
      <h3 style={sectionHeaderStyle}>Tracks ({tracks.length})</h3>
      {tracks.length === 0 ? (
        <p style={{ color: '#999', fontSize: '14px' }}>No tracks available</p>
      ) : (
        tracks.map(track => (
          <div 
            key={track.id} 
            style={trackItemStyle(selectedTrackId === track.id)}
            onClick={() => setSelectedTrackId(track.id)}
          >
            <div>
              <div style={{ fontWeight: 'bold' }}>{track.name}</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>{track.type}</div>
            </div>
            <div style={{ fontSize: '12px' }}>
              {track.clips?.length || 0} clips
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderPluginsTab = () => (
    <div>
      <h3 style={sectionHeaderStyle}>
        Plugins ({plugins.length})
        {electronAPI.isAvailable && <span style={{ fontSize: '12px', color: '#4ecdc4' }}> ⚡</span>}
      </h3>
      {plugins.length === 0 ? (
        <p style={{ color: '#999', fontSize: '14px' }}>No plugins loaded</p>
      ) : (
        plugins.map(plugin => (
          <div key={plugin.id} style={pluginItemStyle}>
            <div style={{ fontWeight: 'bold' }}>{plugin.name}</div>
            <div style={{ opacity: 0.8 }}>v{plugin.version}</div>
            {plugin.metadata?.description && (
              <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.7 }}>
                {plugin.metadata.description}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );

  const renderMixerTab = () => (
    <div>
      <h3 style={sectionHeaderStyle}>Mixer Settings</h3>
      <div style={{ fontSize: '14px' }}>
        <div style={{ marginBottom: '8px' }}>
          <strong>Status:</strong> {showMixer ? 'Visible' : 'Hidden'}
        </div>
        <div style={{ marginBottom: '8px' }}>
          <strong>Height:</strong> {mixerHeight}px
        </div>
        <div style={{ marginBottom: '16px' }}>
          <strong>Tracks:</strong> {tracks.length}
        </div>
        
        <div style={{ padding: '12px', backgroundColor: '#333', borderRadius: '4px' }}>
          <div style={{ fontSize: '12px', color: '#4ecdc4', marginBottom: '8px' }}>
            Quick Stats
          </div>
          <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
            • Audio tracks: {tracks.filter(t => t.type === 'audio').length}<br/>
            • MIDI tracks: {tracks.filter(t => t.type === 'midi').length}<br/>
            • Total clips: {tracks.reduce((sum, t) => sum + (t.clips?.length || 0), 0)}
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'tracks':
        return renderTracksTab();
      case 'plugins':
        return renderPluginsTab();
      case 'mixer':
        return renderMixerTab();
      default:
        return renderTracksTab();
    }
  };

  return (
    <div className={`side-panel ${className}`} style={defaultStyle}>
      {/* Tab navigation */}
      <div style={tabStyle}>
        <button 
          style={tabButtonStyle(activeTab === 'tracks')}
          onClick={() => setActiveTab('tracks')}
        >
          Tracks
        </button>
        <button 
          style={tabButtonStyle(activeTab === 'plugins')}
          onClick={() => setActiveTab('plugins')}
        >
          Plugins
        </button>
        <button 
          style={tabButtonStyle(activeTab === 'mixer')}
          onClick={() => setActiveTab('mixer')}
        >
          Mixer
        </button>
      </div>

      {/* Tab content */}
      <div style={contentStyle}>
        {renderContent()}
      </div>

      {/* Footer with status */}
      <div style={{
        padding: '8px 16px',
        backgroundColor: '#1a1a1a',
        borderTop: '1px solid #444',
        fontSize: '12px',
        color: '#999'
      }}>
        {electronAPI.isAvailable ? '⚡ Electron Mode' : '🌐 Web Mode'}
      </div>
    </div>
  );
};

export default SidePanel;
