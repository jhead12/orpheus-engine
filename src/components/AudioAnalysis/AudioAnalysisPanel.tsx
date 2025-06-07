import React, { useState } from 'react';

type AnalysisResult = {
    filename: string;
    duration: number;
    sampleRate: number;
    channels: number;
    // Add more fields as needed
};

const AudioAnalysisPanel: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
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
            const result: AnalysisResult = await window.electronAPI.analyzeAudio(selectedFile.path);
            setAnalysisResult(result);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to analyze audio');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
            setAnalysisResult(null);
            setError(null);
        }
    };

    return (
        <div style={{ padding: 24, maxWidth: 600 }}>
            <h2>Audio Analysis Panel</h2>
            <input
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                disabled={loading}
            />
            <button
                onClick={handleAnalyze}
                disabled={!selectedFile || loading}
                style={{ marginLeft: 12 }}
            >
                {loading ? 'Analyzing...' : 'Analyze'}
            </button>
            {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
            {analysisResult && (
                <div style={{ marginTop: 24 }}>
                    <h3>Analysis Result</h3>
                    <ul>
                        <li><strong>Filename:</strong> {analysisResult.filename}</li>
                        <li><strong>Duration:</strong> {analysisResult.duration} seconds</li>
                        <li><strong>Sample Rate:</strong> {analysisResult.sampleRate} Hz</li>
                        <li><strong>Channels:</strong> {analysisResult.channels}</li>
                        {/* Add more fields as needed */}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default AudioAnalysisPanel;