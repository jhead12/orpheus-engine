import React, { useState, useEffect } from 'react';
import './App.css';
import Timeline from './components/Timeline';
import AudioRecorder from './components/AudioRecorder';
import AudioLibrary from './components/AudioLibrary';
import TrackManager from './components/TrackManager';
import TransportControls from './components/TransportControls';

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [projectDuration, setProjectDuration] = useState(60); // 60 seconds by default
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [recordedAudios, setRecordedAudios] = useState([]);
  
  // Playback timer
  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= projectDuration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, projectDuration]);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setIsPlaying(true);
    }
  };

  const handleRewind = () => {
    setCurrentTime(Math.max(0, currentTime - 5));
  };

  const handleForward = () => {
    setCurrentTime(Math.min(projectDuration, currentTime + 5));
  };

  const handleTimeChange = (newTime) => {
    setCurrentTime(newTime);
  };

  const handleRecordingComplete = (audioUrl, audioBlob) => {
    const newRecording = {
      id: Date.now(),
      name: `Recording ${recordedAudios.length + 1}`,
      url: audioUrl,
      blob: audioBlob
    };
    
    setRecordedAudios([...recordedAudios, newRecording]);
    setIsRecording(false);
  };

  const handleSelectAudio = (audio) => {
    setSelectedAudio(audio);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Orpheus Engine Workstation</h1>
      </header>
      
      <main className="App-main">
        <TransportControls 
          onPlay={handlePlay}
          onPause={handlePause}
          onStop={handleStop}
          onRecord={handleRecord}
          onRewind={handleRewind}
          onForward={handleForward}
          isPlaying={isPlaying}
          isRecording={isRecording}
        />
        
        <Timeline 
          duration={projectDuration} 
          currentTime={currentTime}
          onTimeChange={handleTimeChange}
        />
        
        <div className="workstation-panel">
          <div className="left-panel">
            <AudioRecorder 
              onRecordingComplete={handleRecordingComplete}
              isRecording={isRecording}
            />
            <AudioLibrary onSelectAudio={handleSelectAudio} />
          </div>
          
          <div className="right-panel">
            <TrackManager />
          </div>
        </div>
      </main>
      
      <footer className="App-footer">
        <p>Orpheus Engine Workstation v1.0.9</p>
      </footer>
    </div>
  );
}

export default App;
