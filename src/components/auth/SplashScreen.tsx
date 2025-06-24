import React, { useEffect, useState } from 'react';
import './SplashScreen.css';

const SplashScreen: React.FC = () => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(
    'Initializing Orpheus Engine...'
  );

  const loadingMessages = [
    'Initializing Orpheus Engine...',
    'Loading audio plugins...',
    'Configuring AI models...',
    'Setting up workstation...',
    'Ready to create music!',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        const next = prev + 1;
        if (next <= 100) {
          // Update message based on progress
          const messageIndex = Math.floor(
            (next / 100) * loadingMessages.length
          );
          if (messageIndex < loadingMessages.length) {
            setCurrentMessage(loadingMessages[messageIndex]);
          }
          return next;
        }
        clearInterval(interval);
        return 100;
      });
    }, 30); // Smooth progress over 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="splash-screen">
      <div className="splash-content">
        {/* Animated Orpheus Logo */}
        <div className="logo-container">
          <div className="logo-symbol">
            <div className="musical-note">🎵</div>
            <div className="ai-pulse" />
          </div>
          <h1 className="logo-text">
            <span className="orpheus">ORPHEUS</span>
            <span className="engine">ENGINE</span>
          </h1>
          <p className="tagline">
            Professional AI-Powered Digital Audio Workstation
          </p>
        </div>

        {/* Loading Progress */}
        <div className="loading-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <p className="loading-message">{currentMessage}</p>
          <p className="loading-percentage">{loadingProgress}%</p>
        </div>

        {/* Version Info */}
        <div className="version-info">
          <p>Version 1.1.0-beta.1</p>
          <p>© 2025 Creative Organization DAO & JEH Ventures, LLC</p>
        </div>
      </div>

      {/* Animated Background */}
      <div className="background-animation">
        <div className="wave wave-1" />
        <div className="wave wave-2" />
        <div className="wave wave-3" />
      </div>
    </div>
  );
};

export default SplashScreen;
