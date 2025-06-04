import React from 'react';
import { useAudioLibrary } from '../../hooks/useAudioLibrary';

const AudioLibrary: React.FC = () => {
  const { audioFiles, loading, error, suggestions } = useAudioLibrary();

  if (loading) return <div>Loading...</div>;
  if (typeof error === 'string' && error) return <div>Error: {error}</div>;

  return (
    <div className="audio-library">
      <h3>Audio Library</h3>
      <div className="audio-files">
        {audioFiles.map(file => (
          <div key={file.id} className="audio-file-item">
            {file.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AudioLibrary;
