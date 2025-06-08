import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './DocsNavigation.css';

interface DocsNavigationProps {
  show?: boolean;
}

const DocsNavigation: React.FC<DocsNavigationProps> = ({ show = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!show) return null;

  const isOnDocs = location.pathname === '/docs';
  const isOnMain = location.pathname === '/';

  const handleNavigation = () => {
    if (isOnDocs) {
      navigate('/');
    } else {
      navigate('/docs');
    }
    setIsExpanded(false);
  };

  return (
    <div className="docs-navigation">
      <button 
        className={`docs-nav-button ${isExpanded ? 'expanded' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
        title={isOnDocs ? 'Back to DAW' : 'View Documentation'}
      >
        {isOnDocs ? '🎵' : '📚'}
      </button>
      
      {isExpanded && (
        <div className="docs-nav-menu">
          <button 
            className={`nav-option ${isOnMain ? 'active' : ''}`}
            onClick={handleNavigation}
            disabled={isOnMain}
          >
            🎵 DAW Workstation
          </button>
          <button 
            className={`nav-option ${isOnDocs ? 'active' : ''}`}
            onClick={handleNavigation}
            disabled={isOnDocs}
          >
            📚 Test Documentation
          </button>
        </div>
      )}
    </div>
  );
};

export default DocsNavigation;
