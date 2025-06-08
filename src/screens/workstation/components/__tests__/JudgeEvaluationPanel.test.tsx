import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import JudgeEvaluationPanel from '../JudgeEvaluationPanel';

// Mock dependencies
vi.mock('@mui/material', async () => {
  const actual = await vi.importActual('@mui/material');
  return {
    ...actual,
    Button: ({ children, onClick, disabled, ...props }: any) => (
      <button onClick={onClick} disabled={disabled} {...props}>
        {children}
      </button>
    ),
    Typography: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    Box: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    LinearProgress: ({ value, ...props }: any) => (
      <div data-testid="progress" data-value={value} {...props} />
    ),
    Chip: ({ label, ...props }: any) => <span {...props}>{label}</span>,
  };
});

// Mock audio recording
const mockMediaRecorder = {
  start: vi.fn(),
  stop: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  state: 'inactive',
};

const mockGetUserMedia = vi.fn().mockResolvedValue({
  getTracks: () => [{ stop: vi.fn() }],
});

// Mock global objects
Object.defineProperty(global, 'MediaRecorder', {
  writable: true,
  value: vi.fn().mockImplementation(() => mockMediaRecorder),
});

Object.defineProperty(global.navigator, 'mediaDevices', {
  writable: true,
  value: { getUserMedia: mockGetUserMedia },
});

// Mock HP AI Studio MLflow client
vi.mock('mlflow', () => ({
  default: {
    startRun: vi.fn().mockResolvedValue({ info: { run_id: 'test-run-id' } }),
    logMetric: vi.fn(),
    logParam: vi.fn(),
    logArtifact: vi.fn(),
    endRun: vi.fn(),
  },
}));

describe('JudgeEvaluationPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the judge evaluation panel', () => {
    render(<JudgeEvaluationPanel />);
    
    expect(screen.getByText('HP AI Studio Judge Evaluation')).toBeInTheDocument();
    expect(screen.getByText('Professional Audio Analysis & Quality Assessment')).toBeInTheDocument();
  });

  it('shows audio input options', () => {
    render(<JudgeEvaluationPanel />);
    
    expect(screen.getByText('Audio Input')).toBeInTheDocument();
    expect(screen.getByText('Record Audio')).toBeInTheDocument();
    expect(screen.getByText('Upload File')).toBeInTheDocument();
  });

  it('displays analysis metrics section', () => {
    render(<JudgeEvaluationPanel />);
    
    expect(screen.getByText('Analysis Progress')).toBeInTheDocument();
    expect(screen.getByText('Audio Quality Metrics')).toBeInTheDocument();
    expect(screen.getByText('Professional Standards Compliance')).toBeInTheDocument();
  });

  it('shows HP AI Studio integration status', () => {
    render(<JudgeEvaluationPanel />);
    
    expect(screen.getByText('HP AI Studio Integration')).toBeInTheDocument();
    expect(screen.getByText('MLflow Tracking')).toBeInTheDocument();
  });

  it('starts recording when record button is clicked', async () => {
    mockGetUserMedia.mockResolvedValueOnce({
      getTracks: () => [{ stop: vi.fn() }],
    });

    render(<JudgeEvaluationPanel />);
    
    const recordButton = screen.getByText('Record Audio');
    fireEvent.click(recordButton);

    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: true });
    });
  });

  it('handles file upload', () => {
    render(<JudgeEvaluationPanel />);
    
    const fileInput = screen.getByLabelText('Upload Audio File');
    const file = new File(['audio data'], 'test.wav', { type: 'audio/wav' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    expect(fileInput.files?.[0]).toBe(file);
    expect(fileInput.files?.length).toBe(1);
  });

  it('displays audio quality metrics when available', () => {
    render(<JudgeEvaluationPanel />);
    
    // Check for metric displays
    expect(screen.getByText('Loudness (LUFS)')).toBeInTheDocument();
    expect(screen.getByText('Dynamic Range')).toBeInTheDocument();
    expect(screen.getByText('Peak Level')).toBeInTheDocument();
    expect(screen.getByText('True Peak')).toBeInTheDocument();
  });

  it('shows professional standards compliance', () => {
    render(<JudgeEvaluationPanel />);
    
    expect(screen.getByText('EBU R128 Compliance')).toBeInTheDocument();
    expect(screen.getByText('ITU-R BS.1770 Standard')).toBeInTheDocument();
    expect(screen.getByText('Broadcast Safe')).toBeInTheDocument();
  });

  it('displays spectral analysis information', () => {
    render(<JudgeEvaluationPanel />);
    
    expect(screen.getByText('Spectral Analysis')).toBeInTheDocument();
    expect(screen.getByText('Frequency Response')).toBeInTheDocument();
    expect(screen.getByText('Harmonic Content')).toBeInTheDocument();
  });
});
