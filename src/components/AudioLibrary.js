import React, { useState, useEffect } from 'react';
import './AudioLibrary.css';

const AudioLibrary = ({ onSelectAudio }) => {
  const [audioFiles, setAudioFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    // Load audio files from local storage or API
    const loadAudioLibrary = async () => {
      try {
        setIsLoading(true);
        
        // Mock data - replace with actual API call
        // const response = await fetch('/api/audio-library');
        // if (!response.ok) throw new Error('Failed to fetch audio library');
        // const data = await response.json();
        
        // For demo purposes, creating mock data
        const mockData = [
          { id: '1', name: 'Drum Loop 1', duration: '0:30', type: 'loop' },
          { id: '2', name: 'Bass Line', duration: '0:45', type: 'sample' },
          { id: '3', name: 'Piano Melody', duration: '1:20', type: 'recording' },
          { id: '4', name: 'Vocal Sample', duration: '0:15', type: 'sample' },
        ];
        
        setAudioFiles(mockData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading audio library:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    loadAudioLibrary();
  }, []);

  const handleFileSelect = (file) => {
    setSelectedFile(file.id);
    onSelectAudio(file);
  };

  if (isLoading) {
    return <div className="audio-library-loading">Loading audio library...</div>;
  }

  if (error) {
    return <div className="audio-library-error">Error loading audio library: {error}</div>;
  }

  return (
    <div className="audio-library">
      <h3>Audio Library</h3>
      <div className="audio-files-list">
        {audioFiles.length === 0 ? (
          <p>No audio files found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Duration</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {audioFiles.map(file => (
                <tr 
                  key={file.id} 
                  className={selectedFile === file.id ? 'selected' : ''}
                  onClick={() => handleFileSelect(file)}
                >
                  <td>{file.name}</td>
                  <td>{file.duration}</td>
                  <td>{file.type}</td>
                  <td>
                    <button className="use-audio-btn">Use</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AudioLibrary;
