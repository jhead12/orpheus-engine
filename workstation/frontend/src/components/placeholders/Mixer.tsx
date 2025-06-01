import React from 'react';

const Mixer: React.FC = () => {
  return (
    <div style={{ 
      background: '#2a2a2a', 
      height: '100%',
      color: 'white',
      padding: '10px',
      display: 'flex',
      alignItems: 'center'
    }}>
      <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
        <div className="track" style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ height: '100px', background: '#3a3a3a', margin: '0 5px' }}></div>
          <div>Track 1</div>
        </div>
        <div className="track" style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ height: '100px', background: '#3a3a3a', margin: '0 5px' }}></div>
          <div>Track 2</div>
        </div>
        <div className="master" style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ height: '100px', background: '#4a3a3a', margin: '0 5px' }}></div>
          <div>Master</div>
        </div>
      </div>
    </div>
  );
};

export default Mixer;
