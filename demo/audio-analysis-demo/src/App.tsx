import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Upload, Activity, BarChart3 } from 'lucide-react';
import { AudioRecordingService } from './services/audioRecording';
import { AudioAnalysisService } from './services/audioAnalysis';
import { MLflowService } from './services/mlflow';
import AudioVisualization from './components/AudioVisualization';
import AnalysisResults from './components/AnalysisResults';
import { AudioAnalysisResults, RecordingState, MLflowExperiment } from './types/audio';

const App: React.FC = () => {
  // Services
  const recordingService = useRef(new AudioRecordingService());
  const analysisService = useRef(new AudioAnalysisService());
  const mlflowService = useRef(new MLflowService());

  // State
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioLevel: 0,
    sampleRate: 48000,
    channels: 2,
  });
  const [analysisResults, setAnalysisResults] = useState<AudioAnalysisResults | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentExperiment, setCurrentExperiment] = useState<MLflowExperiment | null>(null);
  const [status, setStatus] = useState<'idle' | 'recording' | 'analyzing' | 'complete'>('idle');
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Set up recording state callback
    recordingService.current.setStateChangeCallback(setRecordingState);
    
    // Initialize MLflow experiment
    initializeMLflow();
  }, []);

  const initializeMLflow = async () => {
    try {
      const experimentId = await mlflowService.current.createExperiment();
      console.log('MLflow experiment created:', experimentId);
    } catch (error) {
      console.error('Failed to initialize MLflow:', error);
    }
  };

  const startRecording = async () => {
    try {
      await recordingService.current.startRecording();
      setStatus('recording');
      setAnalysisResults(null);
      setRecordedBlob(null);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to start recording. Please check your microphone permissions.');
    }
  };

  const pauseRecording = () => {
    recordingService.current.pauseRecording();
  };

  const resumeRecording = () => {
    recordingService.current.resumeRecording();
  };

  const stopRecording = async () => {
    try {
      const audioBlob = await recordingService.current.stopRecording();
      setRecordedBlob(audioBlob);
      setStatus('complete');
      await analyzeAudio(audioBlob);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setStatus('idle');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      alert('Please select an audio file.');
      return;
    }

    setStatus('analyzing');
    await analyzeAudio(file);
  };

  const analyzeAudio = async (audioData: File | Blob) => {
    setIsAnalyzing(true);
    setStatus('analyzing');

    try {
      // Start MLflow run
      const experimentId = await mlflowService.current.createExperiment();
      const experiment = await mlflowService.current.startRun(experimentId);
      setCurrentExperiment(experiment);

      // Convert blob to file if needed
      let audioFile: File;
      if (audioData instanceof File) {
        audioFile = audioData;
      } else {
        audioFile = new File([audioData], 'recording.webm', { type: audioData.type });
      }

      // Analyze audio
      const results = await analysisService.current.analyzeAudioFile(audioFile);
      setAnalysisResults(results);
      setStatus('complete');

      // Log to MLflow
      await logToMLflow(experiment, results, audioFile);

    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Failed to analyze audio. Please try again.');
      setStatus('idle');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const logToMLflow = async (experiment: MLflowExperiment, results: AudioAnalysisResults, audioFile: File) => {
    try {
      const { runId } = experiment;

      // Log parameters
      await mlflowService.current.logParameter(runId, 'audio_file_name', audioFile.name);
      await mlflowService.current.logParameter(runId, 'audio_file_size', audioFile.size.toString());
      await mlflowService.current.logParameter(runId, 'sample_rate', results.characteristics.sampleRate.toString());
      await mlflowService.current.logParameter(runId, 'channels', results.characteristics.channels.toString());
      await mlflowService.current.logParameter(runId, 'duration', results.characteristics.duration.toString());

      // Log metrics
      if (results.features.tempo) {
        await mlflowService.current.logMetric(runId, 'tempo', results.features.tempo);
      }
      if (results.features.energy) {
        await mlflowService.current.logMetric(runId, 'energy', results.features.energy);
      }
      if (results.features.danceability) {
        await mlflowService.current.logMetric(runId, 'danceability', results.features.danceability);
      }
      if (results.features.valence) {
        await mlflowService.current.logMetric(runId, 'valence', results.features.valence);
      }
      if (results.features.spectralCentroid) {
        await mlflowService.current.logMetric(runId, 'spectral_centroid', results.features.spectralCentroid);
      }
      if (results.quality.score) {
        await mlflowService.current.logMetric(runId, 'quality_score', results.quality.score);
      }

      // Log artifacts
      const analysisReport = mlflowService.current.generateAnalysisReport(results, results.characteristics.duration);
      await mlflowService.current.logArtifact(runId, 'analysis_report.md', analysisReport);
      
      // Log the audio file itself
      await mlflowService.current.logArtifact(runId, `audio/${audioFile.name}`, audioFile);
      
      // Log analysis results as JSON
      await mlflowService.current.logArtifact(runId, 'analysis_results.json', JSON.stringify(results, null, 2));

      // End the run
      await mlflowService.current.endRun(runId, 'FINISHED');

      console.log('MLflow logging completed for run:', runId);
    } catch (error) {
      console.error('Failed to log to MLflow:', error);
    }
  };

  const getStatusInfo = () => {
    switch (status) {
      case 'recording':
        return { text: 'Recording Audio', color: 'status-recording', icon: Mic };
      case 'analyzing':
        return { text: 'Analyzing Audio', color: 'status-analyzing', icon: Activity };
      case 'complete':
        return { text: 'Analysis Complete', color: 'status-complete', icon: BarChart3 };
      default:
        return { text: 'Ready', color: 'status-idle', icon: Activity };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="app-container">
      <header className="header">
        <h1>🎵 Orpheus Audio Analysis Demo</h1>
        <p>Real-time audio recording and AI-powered analysis for HP AI Studio Competition</p>
        <div className={`status-indicator ${statusInfo.color} ${status === 'recording' || status === 'analyzing' ? 'pulse' : ''}`} role="status" aria-label={`Application status: ${statusInfo.text}`}>
          <StatusIcon size={16} />
          {statusInfo.text}
        </div>
      </header>

      <div className="demo-grid">
        {/* Recording Panel */}
        <div className="demo-panel">
          <h2 className="panel-title">
            <Mic size={24} />
            Audio Recording
          </h2>

          <div className="recorder-controls">
            <div className="control-row">
              {!recordingState.isRecording ? (
                <button 
                  type="button"
                  className="btn btn-primary" 
                  onClick={startRecording}
                  disabled={status === 'analyzing'}
                  aria-label="Start audio recording"
                >
                  <Mic size={16} />
                  Start Recording
                </button>
              ) : (
                <>
                  {recordingState.isPaused ? (
                    <button 
                      type="button"
                      className="btn btn-success" 
                      onClick={resumeRecording}
                      aria-label="Resume audio recording"
                    >
                      <Play size={16} />
                      Resume
                    </button>
                  ) : (
                    <button 
                      type="button"
                      className="btn btn-warning" 
                      onClick={pauseRecording}
                      aria-label="Pause audio recording"
                    >
                      <Pause size={16} />
                      Pause
                    </button>
                  )}
                  <button 
                    type="button"
                    className="btn btn-primary" 
                    onClick={stopRecording}
                    aria-label="Stop recording and analyze audio"
                  >
                    <Square size={16} />
                    Stop & Analyze
                  </button>
                </>
              )}
            </div>

            {recordingState.isRecording && (
              <div className="timer" role="timer" aria-label="Recording duration">
                {recordingService.current.formatDuration(recordingState.duration)}
              </div>
            )}

            <div className="level-meter">
              <div 
                className="level-bar" 
                style={{ width: `${recordingState.audioLevel * 100}%` }}
              />
            </div>
          </div>

          <div className="upload-area" onClick={() => fileInputRef.current?.click()} role="button" tabIndex={0} aria-label="Upload audio file">
            <Upload size={32} />
            <p>Or click to upload an audio file</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="file-input"
              aria-label="Select audio file for analysis"
            />
          </div>

          {recordedBlob && (
            <div className="visualization-container">
              <h3>Live Audio Visualization</h3>
              <AudioVisualization 
                audioBlob={recordedBlob}
                analysisResults={analysisResults}
                isRecording={recordingState.isRecording}
                audioLevel={recordingState.audioLevel}
              />
            </div>
          )}
        </div>

        {/* Analysis Panel */}
        <div className="demo-panel">
          <h2 className="panel-title">
            <BarChart3 size={24} />
            AI Analysis Results
          </h2>

          {isAnalyzing ? (
            <div className="analysis-loading">
              <Activity size={32} className="pulse" />
              <p>Analyzing audio features...</p>
              <p>Running spectral analysis, genre classification, and quality assessment</p>
            </div>
          ) : analysisResults ? (
            <AnalysisResults results={analysisResults} />
          ) : (
            <div className="analysis-placeholder">
              <BarChart3 size={64} style={{ opacity: 0.3 }} />
              <p>Record or upload audio to see analysis results</p>
              <ul style={{ textAlign: 'left', color: '#b0b0b0' }}>
                <li>🎵 Tempo and genre detection</li>
                <li>📊 Spectral analysis and features</li>
                <li>🎚️ Audio quality assessment</li>
                <li>📈 Real-time visualizations</li>
                <li>🤖 MLflow experiment tracking</li>
              </ul>
            </div>
          )}

          {currentExperiment && (
            <div className="mlflow-info">
              <h3>MLflow Tracking</h3>
              <p><strong>Experiment ID:</strong> {currentExperiment.experimentId}</p>
              <p><strong>Run ID:</strong> {currentExperiment.runId}</p>
              <p><strong>Artifact URI:</strong> {currentExperiment.artifactUri}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
