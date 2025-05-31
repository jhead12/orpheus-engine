import React from 'react';

const Header: React.FC = () => {
  return (
    <div style={{ 
      background: '#282828', 
      height: '69px',
      color: 'white',
      padding: '0 20px',
      display: 'flex',
      alignItems: 'center'
    }}>
      <h1>Orpheus Engine Workstation</h1>
    </div>
  );
};

export default Header;
