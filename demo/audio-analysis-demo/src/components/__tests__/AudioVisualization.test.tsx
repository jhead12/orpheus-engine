import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AudioVisualization } from '../AudioVisualization'
import { createMockCanvasContext, createMockAudioBuffer } from '../../test/utils'

describe('AudioVisualization', () => {
  const mockProps = {
    audioData: createMockAudioBuffer(1024),
    frequencyData: new Uint8Array(512),
    isRecording: false,
    width: 800,
    height: 400
  }

  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn(() => createMockCanvasContext())
  })

  describe('Rendering', () => {
    it('should render canvas elements', () => {
      render(<AudioVisualization {...mockProps} />)
      
      const canvases = screen.getAllByRole('img', { hidden: true })
      expect(canvases).toHaveLength(3) // Waveform, spectrum, spectrogram
    })

    it('should render with correct dimensions', () => {
      render(<AudioVisualization {...mockProps} />)
      
      const canvases = screen.getAllByRole('img', { hidden: true })
      canvases.forEach(canvas => {
        expect(canvas).toHaveAttribute('width', '800')
        expect(canvas).toHaveAttribute('height', '400')
      })
    })

    it('should render mode selector', () => {
      render(<AudioVisualization {...mockProps} />)
      
      expect(screen.getByText('Waveform')).toBeInTheDocument()
      expect(screen.getByText('Spectrum')).toBeInTheDocument()
      expect(screen.getByText('Spectrogram')).toBeInTheDocument()
    })
  })

  describe('Visualization Modes', () => {
    it('should switch between visualization modes', async () => {
      const { user } = render(<AudioVisualization {...mockProps} />)
      
      // Default should be waveform
      expect(screen.getByText('Waveform')).toHaveClass('active')
      
      // Switch to spectrum
      await user.click(screen.getByText('Spectrum'))
      expect(screen.getByText('Spectrum')).toHaveClass('active')
      
      // Switch to spectrogram
      await user.click(screen.getByText('Spectrogram'))
      expect(screen.getByText('Spectrogram')).toHaveClass('active')
    })

    it('should draw waveform visualization', () => {
      const mockContext = createMockCanvasContext()
      HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext)
      
      render(<AudioVisualization {...mockProps} />)
      
      // Waveform drawing should use line drawing
      expect(mockContext.beginPath).toHaveBeenCalled()
      expect(mockContext.moveTo).toHaveBeenCalled()
      expect(mockContext.lineTo).toHaveBeenCalled()
      expect(mockContext.stroke).toHaveBeenCalled()
    })

    it('should draw spectrum visualization', async () => {
      const mockContext = createMockCanvasContext()
      HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext)
      
      const { user } = render(<AudioVisualization {...mockProps} />)
      
      await user.click(screen.getByText('Spectrum'))
      
      // Spectrum drawing should use rectangles
      expect(mockContext.fillRect).toHaveBeenCalled()
    })

    it('should draw spectrogram visualization', async () => {
      const mockContext = createMockCanvasContext()
      HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext)
      
      const { user } = render(<AudioVisualization {...mockProps} />)
      
      await user.click(screen.getByText('Spectrogram'))
      
      // Spectrogram should use image data manipulation
      expect(mockContext.getImageData).toHaveBeenCalled()
      expect(mockContext.putImageData).toHaveBeenCalled()
    })
  })

  describe('Real-time Updates', () => {
    it('should update visualization when recording', () => {
      const mockContext = createMockCanvasContext()
      HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext)
      
      const { rerender } = render(<AudioVisualization {...mockProps} isRecording={true} />)
      
      const initialCalls = mockContext.clearRect.mock.calls.length
      
      // Update with new audio data
      const newAudioData = createMockAudioBuffer(1024)
      rerender(<AudioVisualization {...mockProps} audioData={newAudioData} isRecording={true} />)
      
      // Should clear and redraw
      expect(mockContext.clearRect.mock.calls.length).toBeGreaterThan(initialCalls)
    })

    it('should handle empty audio data gracefully', () => {
      const mockContext = createMockCanvasContext()
      HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext)
      
      expect(() => {
        render(<AudioVisualization {...mockProps} audioData={new Float32Array(0)} />)
      }).not.toThrow()
    })

    it('should handle missing frequency data', () => {
      const mockContext = createMockCanvasContext()
      HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext)
      
      expect(() => {
        render(<AudioVisualization {...mockProps} frequencyData={undefined} />)
      }).not.toThrow()
    })
  })

  describe('Performance', () => {
    it('should throttle updates during recording', () => {
      const mockContext = createMockCanvasContext()
      HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext)
      
      const { rerender } = render(<AudioVisualization {...mockProps} isRecording={true} />)
      
      // Multiple rapid updates
      for (let i = 0; i < 10; i++) {
        const newData = createMockAudioBuffer(1024)
        rerender(<AudioVisualization {...mockProps} audioData={newData} isRecording={true} />)
      }
      
      // Should not redraw for every update due to throttling
      const drawCalls = mockContext.clearRect.mock.calls.length
      expect(drawCalls).toBeLessThan(10)
    })

    it('should cleanup on unmount', () => {
      const { unmount } = render(<AudioVisualization {...mockProps} />)
      
      expect(() => unmount()).not.toThrow()
    })
  })

  describe('Responsive Design', () => {
    it('should handle different canvas sizes', () => {
      const smallProps = { ...mockProps, width: 400, height: 200 }
      
      expect(() => {
        render(<AudioVisualization {...smallProps} />)
      }).not.toThrow()
    })

    it('should maintain aspect ratio', () => {
      render(<AudioVisualization {...mockProps} />)
      
      const canvases = screen.getAllByRole('img', { hidden: true })
      canvases.forEach(canvas => {
        const width = parseInt(canvas.getAttribute('width') || '0')
        const height = parseInt(canvas.getAttribute('height') || '0')
        expect(width / height).toBe(2) // 800/400 = 2
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<AudioVisualization {...mockProps} />)
      
      expect(screen.getByLabelText(/waveform visualization/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/frequency spectrum/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/spectrogram/i)).toBeInTheDocument()
    })

    it('should indicate recording state', () => {
      render(<AudioVisualization {...mockProps} isRecording={true} />)
      
      expect(screen.getByText(/recording/i)).toBeInTheDocument()
    })
  })

  describe('Color Schemes', () => {
    it('should apply different color schemes for different modes', () => {
      const mockContext = createMockCanvasContext()
      HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext)
      
      const { user } = render(<AudioVisualization {...mockProps} />)
      
      // Check that colors are applied
      expect(mockContext.strokeStyle).toBeDefined()
      expect(mockContext.fillStyle).toBeDefined()
    })

    it('should use recording colors when recording', () => {
      const mockContext = createMockCanvasContext()
      HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext)
      
      render(<AudioVisualization {...mockProps} isRecording={true} />)
      
      // Should use recording-specific colors (typically red-based)
      expect(mockContext.strokeStyle).toMatch(/#.*/)
    })
  })

  describe('Error Handling', () => {
    it('should handle canvas context creation failure', () => {
      HTMLCanvasElement.prototype.getContext = vi.fn(() => null)
      
      expect(() => {
        render(<AudioVisualization {...mockProps} />)
      }).not.toThrow()
    })

    it('should handle invalid audio data', () => {
      const invalidData = new Float32Array(1024)
      invalidData.fill(NaN)
      
      expect(() => {
        render(<AudioVisualization {...mockProps} audioData={invalidData} />)
      }).not.toThrow()
    })

    it('should handle invalid frequency data', () => {
      const invalidFreqData = new Uint8Array(512)
      invalidFreqData.fill(255)
      
      expect(() => {
        render(<AudioVisualization {...mockProps} frequencyData={invalidFreqData} />)
      }).not.toThrow()
    })
  })
})
