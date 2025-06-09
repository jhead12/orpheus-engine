import React, { useState } from "react";

type AnalysisResult = {
  filename: string;
  duration: number;
  sampleRate: number;
  channels: number;
  // Add more fields as needed
};

const AudioAnalysisPanel: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<{ name: string; path: string } | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // This function uses Electron's IPC API to send the file path to the main process
  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      // Use Electron's IPC renderer to send the file path to the main process
      // @ts-expect-error - window.electronAPI is injected by Electron but not typed
      const result: AnalysisResult = await window.electronAPI.analyzeAudio(
        (selectedFile as any).path || selectedFile.name
      );
      setAnalysisResult(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to analyze audio");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async () => {
    try {
      // @ts-expect-error - window.electronAPI is injected by Electron but not typed
      const result = await window.electronAPI.openFileDialog({
        filters: [{ name: 'Audio files', extensions: ['mp3', 'wav', 'flac', 'ogg'] }]
      });
      if (result && !result.canceled && result.filePaths.length > 0) {
        const filePath = result.filePaths[0];
        const fileName = filePath.split('/').pop() || 'Unknown';
        setSelectedFile({ name: fileName, path: filePath });
        setAnalysisResult(null);
        setError(null);
      }
    } catch (err) {
      setError('Failed to open file dialog');
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 600 }}>
      <h2>Audio Analysis Panel</h2>
      <button
        onClick={handleFileChange}
        disabled={loading}
        style={{ marginRight: 12 }}
      >
        Select Audio File
      </button>
      {selectedFile && <span>Selected: {selectedFile.name}</span>}
      <button
        onClick={handleAnalyze}
        disabled={!selectedFile || loading}
        style={{ marginLeft: 12 }}
      >
        {loading ? "Analyzing..." : "Analyze"}
      </button>
      {error && <div style={{ color: "red", marginTop: 12 }}>{error}</div>}
      {analysisResult && (
        <div style={{ marginTop: 24 }}>
          <h3>Analysis Result</h3>
          <ul>
            <li>
              <strong>Filename:</strong> {analysisResult.filename}
            </li>
            <li>
              <strong>Duration:</strong> {analysisResult.duration} seconds
            </li>
            <li>
              <strong>Sample Rate:</strong> {analysisResult.sampleRate} Hz
            </li>
            <li>
              <strong>Channels:</strong> {analysisResult.channels}
            </li>
            {/* Add more fields as needed */}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AudioAnalysisPanel;
