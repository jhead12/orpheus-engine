import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AnalysisResults } from '../AnalysisResults'
import type { AudioAnalysisResult } from '../../types/audio'

describe('AnalysisResults', () => {
  const mockResults: AudioAnalysisResult = {
    duration: 5.2,
    sampleRate: 48000,
    channels: 2,
    spectralCentroid: 2500.5,
    rms: 0.65,
    zeroCrossingRate: 0.15,
    tempo: 125.5,
    genre: 'rock',
    quality: {
      snr: 35.2,
      thd: 0.05,
      dynamicRange: 22.5,
      clipping: false,
      ebur128Compliant: true
    },
    frequencySpectrum: new Float32Array(512),
    waveform: new Float32Array(1024)
  }

  describe('Rendering', () => {
    it('should render all basic audio properties', () => {
      render(<AnalysisResults results={mockResults} />)
      
      expect(screen.getByText('Duration')).toBeInTheDocument()
      expect(screen.getByText('5.2s')).toBeInTheDocument()
      
      expect(screen.getByText('Sample Rate')).toBeInTheDocument()
      expect(screen.getByText('48,000 Hz')).toBeInTheDocument()
      
      expect(screen.getByText('Channels')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('should render spectral analysis results', () => {
      render(<AnalysisResults results={mockResults} />)
      
      expect(screen.getByText('Spectral Centroid')).toBeInTheDocument()
      expect(screen.getByText('2,501 Hz')).toBeInTheDocument()
      
      expect(screen.getByText('RMS Level')).toBeInTheDocument()
      expect(screen.getByText('65.0%')).toBeInTheDocument()
      
      expect(screen.getByText('Zero Crossing Rate')).toBeInTheDocument()
      expect(screen.getByText('15.0%')).toBeInTheDocument()
    })

    it('should render tempo and genre information', () => {
      render(<AnalysisResults results={mockResults} />)
      
      expect(screen.getByText('Tempo')).toBeInTheDocument()
      expect(screen.getByText('126 BPM')).toBeInTheDocument()
      
      expect(screen.getByText('Genre')).toBeInTheDocument()
      expect(screen.getByText('Rock')).toBeInTheDocument()
    })

    it('should render quality assessment', () => {
      render(<AnalysisResults results={mockResults} />)
      
      expect(screen.getByText('Signal-to-Noise Ratio')).toBeInTheDocument()
      expect(screen.getByText('35.2 dB')).toBeInTheDocument()
      
      expect(screen.getByText('Total Harmonic Distortion')).toBeInTheDocument()
      expect(screen.getByText('5.0%')).toBeInTheDocument()
      
      expect(screen.getByText('Dynamic Range')).toBeInTheDocument()
      expect(screen.getByText('22.5 dB')).toBeInTheDocument()
    })

    it('should render quality indicators', () => {
      render(<AnalysisResults results={mockResults} />)
      
      expect(screen.getByText('No Clipping')).toBeInTheDocument()
      expect(screen.getByText('EBU R128 Compliant')).toBeInTheDocument()
    })
  })

  describe('Data Formatting', () => {
    it('should format numbers with appropriate precision', () => {
      const preciseResults = {
        ...mockResults,
        spectralCentroid: 2500.123456,
        rms: 0.654321,
        tempo: 125.987654
      }
      
      render(<AnalysisResults results={preciseResults} />)
      
      expect(screen.getByText('2,500 Hz')).toBeInTheDocument() // Rounded to nearest integer
      expect(screen.getByText('65.4%')).toBeInTheDocument() // One decimal place
      expect(screen.getByText('126 BPM')).toBeInTheDocument() // Rounded to integer
    })

    it('should format large numbers with commas', () => {
      const highSampleRate = {
        ...mockResults,
        sampleRate: 192000,
        spectralCentroid: 15432.5
      }
      
      render(<AnalysisResults results={highSampleRate} />)
      
      expect(screen.getByText('192,000 Hz')).toBeInTheDocument()
      expect(screen.getByText('15,433 Hz')).toBeInTheDocument()
    })

    it('should capitalize genre names properly', () => {
      const genreTests = [
        { genre: 'hip-hop', expected: 'Hip-hop' },
        { genre: 'electronic', expected: 'Electronic' },
        { genre: 'classical', expected: 'Classical' },
        { genre: 'jazz', expected: 'Jazz' },
        { genre: 'unknown', expected: 'Unknown' }
      ]
      
      genreTests.forEach(({ genre, expected }) => {
        const { unmount } = render(<AnalysisResults results={{ ...mockResults, genre }} />)
        expect(screen.getByText(expected)).toBeInTheDocument()
        unmount()
      })
    })
  })

  describe('Quality Indicators', () => {
    it('should show clipping warning when present', () => {
      const clippedResults = {
        ...mockResults,
        quality: {
          ...mockResults.quality,
          clipping: true
        }
      }
      
      render(<AnalysisResults results={clippedResults} />)
      
      expect(screen.getByText('Clipping Detected')).toBeInTheDocument()
      expect(screen.getByText('Clipping Detected')).toHaveClass('warning')
    })

    it('should show non-compliant warning for EBU R128', () => {
      const nonCompliantResults = {
        ...mockResults,
        quality: {
          ...mockResults.quality,
          ebur128Compliant: false
        }
      }
      
      render(<AnalysisResults results={nonCompliantResults} />)
      
      expect(screen.getByText('Not EBU R128 Compliant')).toBeInTheDocument()
      expect(screen.getByText('Not EBU R128 Compliant')).toHaveClass('warning')
    })

    it('should show good quality indicators in green', () => {
      render(<AnalysisResults results={mockResults} />)
      
      expect(screen.getByText('No Clipping')).toHaveClass('good')
      expect(screen.getByText('EBU R128 Compliant')).toHaveClass('good')
    })
  })

  describe('Loading and Error States', () => {
    it('should show loading state when no results', () => {
      render(<AnalysisResults results={null} />)
      
      expect(screen.getByText('Analyzing audio...')).toBeInTheDocument()
    })

    it('should handle undefined results gracefully', () => {
      render(<AnalysisResults results={undefined} />)
      
      expect(screen.getByText('Analyzing audio...')).toBeInTheDocument()
    })

    it('should handle partial results', () => {
      const partialResults = {
        duration: 3.5,
        sampleRate: 44100,
        channels: 1
      } as Partial<AudioAnalysisResult>
      
      render(<AnalysisResults results={partialResults as AudioAnalysisResult} />)
      
      expect(screen.getByText('Duration')).toBeInTheDocument()
      expect(screen.getByText('3.5s')).toBeInTheDocument()
    })
  })

  describe('Visual Organization', () => {
    it('should group related metrics in sections', () => {
      render(<AnalysisResults results={mockResults} />)
      
      // Check for section headers
      expect(screen.getByText('Basic Properties')).toBeInTheDocument()
      expect(screen.getByText('Spectral Analysis')).toBeInTheDocument()
      expect(screen.getByText('Musical Properties')).toBeInTheDocument()
      expect(screen.getByText('Quality Assessment')).toBeInTheDocument()
    })

    it('should use appropriate icons for different metrics', () => {
      render(<AnalysisResults results={mockResults} />)
      
      // Icons should be present (testing by checking svg elements or icon classes)
      const icons = screen.getAllByRole('img', { hidden: true })
      expect(icons.length).toBeGreaterThan(0)
    })
  })

  describe('Responsive Design', () => {
    it('should render properly in different container sizes', () => {
      // Test with CSS styles that simulate different container sizes
      const { container } = render(<AnalysisResults results={mockResults} />)
      
      // Should not overflow or break layout
      expect(container.firstChild).toHaveClass('analysis-results')
    })
  })

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      render(<AnalysisResults results={mockResults} />)
      
      // Check for proper headings
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
    })

    it('should have descriptive labels for screen readers', () => {
      render(<AnalysisResults results={mockResults} />)
      
      // Values should be properly associated with labels
      expect(screen.getByText('Duration')).toBeInTheDocument()
      expect(screen.getByText('5.2s')).toBeInTheDocument()
    })

    it('should indicate quality status clearly', () => {
      render(<AnalysisResults results={mockResults} />)
      
      // Quality indicators should be clear
      const noClipping = screen.getByText('No Clipping')
      expect(noClipping).toHaveAttribute('aria-label', expect.stringContaining('good'))
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero values gracefully', () => {
      const zeroResults = {
        ...mockResults,
        duration: 0,
        spectralCentroid: 0,
        rms: 0,
        tempo: 0
      }
      
      render(<AnalysisResults results={zeroResults} />)
      
      expect(screen.getByText('0s')).toBeInTheDocument()
      expect(screen.getByText('0 Hz')).toBeInTheDocument()
      expect(screen.getByText('0.0%')).toBeInTheDocument()
      expect(screen.getByText('0 BPM')).toBeInTheDocument()
    })

    it('should handle very large values', () => {
      const largeResults = {
        ...mockResults,
        duration: 3600, // 1 hour
        spectralCentroid: 20000,
        tempo: 300
      }
      
      render(<AnalysisResults results={largeResults} />)
      
      expect(screen.getByText('3,600s')).toBeInTheDocument()
      expect(screen.getByText('20,000 Hz')).toBeInTheDocument()
      expect(screen.getByText('300 BPM')).toBeInTheDocument()
    })

    it('should handle NaN and Infinity values', () => {
      const invalidResults = {
        ...mockResults,
        spectralCentroid: NaN,
        rms: Infinity,
        tempo: -Infinity
      }
      
      expect(() => {
        render(<AnalysisResults results={invalidResults} />)
      }).not.toThrow()
    })
  })
})
