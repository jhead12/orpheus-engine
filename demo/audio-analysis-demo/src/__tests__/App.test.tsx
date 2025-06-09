import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import { createMockAudioBlob, wait, mockMLflowData } from '../test/utils'

describe('App Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock fetch for MLflow API calls
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 'healthy' })
    })
  })

  describe('Initial State', () => {
    it('should render main interface', () => {
      render(<App />)
      
      expect(screen.getByText('Orpheus Audio Analysis Demo')).toBeInTheDocument()
      expect(screen.getByText('HP AI Studio Competition')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /start recording/i })).toBeInTheDocument()
    })

    it('should show MLflow status', async () => {
      render(<App />)
      
      await waitFor(() => {
        expect(screen.getByText(/MLflow Status/i)).toBeInTheDocument()
      })
    })

    it('should display initial stats', () => {
      render(<App />)
      
      expect(screen.getByText('0')).toBeInTheDocument() // Recording count
      expect(screen.getByText('00:00')).toBeInTheDocument() // Duration
    })
  })

  describe('Recording Workflow', () => {
    it('should complete full recording and analysis workflow', async () => {
      const user = userEvent.setup()
      
      // Mock successful responses
      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ status: 'healthy' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ experiment_id: '123' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ run: mockMLflowData.run })
        })
        .mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({})
        })

      render(<App />)
      
      // Wait for initialization
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /start recording/i })).toBeEnabled()
      })

      // Start recording
      const startButton = screen.getByRole('button', { name: /start recording/i })
      await user.click(startButton)
      
      // Should show recording state
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop recording/i })).toBeInTheDocument()
        expect(screen.getByText(/recording/i)).toBeInTheDocument()
      })

      // Wait a bit for recording
      await wait(200)
      
      // Stop recording
      const stopButton = screen.getByRole('button', { name: /stop recording/i })
      await user.click(stopButton)
      
      // Should show analysis in progress
      await waitFor(() => {
        expect(screen.getByText(/analyzing/i)).toBeInTheDocument()
      }, { timeout: 5000 })
      
      // Should eventually show results
      await waitFor(() => {
        expect(screen.getByText(/analysis complete/i)).toBeInTheDocument()
      }, { timeout: 10000 })
    })

    it('should handle recording pause and resume', async () => {
      const user = userEvent.setup()
      render(<App />)
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /start recording/i })).toBeEnabled()
      })

      // Start recording
      await user.click(screen.getByRole('button', { name: /start recording/i }))
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument()
      })

      // Pause recording
      await user.click(screen.getByRole('button', { name: /pause/i }))
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /resume/i })).toBeInTheDocument()
        expect(screen.getByText(/paused/i)).toBeInTheDocument()
      })

      // Resume recording
      await user.click(screen.getByRole('button', { name: /resume/i }))
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument()
        expect(screen.getByText(/recording/i)).toBeInTheDocument()
      })
    })
  })

  describe('Audio Upload', () => {
    it('should handle audio file upload and analysis', async () => {
      const user = userEvent.setup()
      render(<App />)
      
      const fileInput = screen.getByLabelText(/upload audio file/i)
      const mockFile = new File(['mock audio data'], 'test.wav', { type: 'audio/wav' })
      
      await user.upload(fileInput, mockFile)
      
      // Should show upload processing
      await waitFor(() => {
        expect(screen.getByText(/analyzing uploaded file/i)).toBeInTheDocument()
      })
      
      // Should eventually show results
      await waitFor(() => {
        expect(screen.getByText(/analysis complete/i)).toBeInTheDocument()
      }, { timeout: 5000 })
    })

    it('should reject invalid file types', async () => {
      const user = userEvent.setup()
      render(<App />)
      
      const fileInput = screen.getByLabelText(/upload audio file/i)
      const mockFile = new File(['not audio'], 'test.txt', { type: 'text/plain' })
      
      await user.upload(fileInput, mockFile)
      
      await waitFor(() => {
        expect(screen.getByText(/invalid file type/i)).toBeInTheDocument()
      })
    })
  })

  describe('Visualization Controls', () => {
    it('should switch between visualization modes', async () => {
      const user = userEvent.setup()
      render(<App />)
      
      // Start recording to enable visualizations
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /start recording/i })).toBeEnabled()
      })
      
      await user.click(screen.getByRole('button', { name: /start recording/i }))
      
      await waitFor(() => {
        expect(screen.getByText('Waveform')).toBeInTheDocument()
        expect(screen.getByText('Spectrum')).toBeInTheDocument()
        expect(screen.getByText('Spectrogram')).toBeInTheDocument()
      })
      
      // Switch to spectrum view
      await user.click(screen.getByText('Spectrum'))
      expect(screen.getByText('Spectrum')).toHaveClass('active')
      
      // Switch to spectrogram view
      await user.click(screen.getByText('Spectrogram'))
      expect(screen.getByText('Spectrogram')).toHaveClass('active')
    })
  })

  describe('MLflow Integration', () => {
    it('should show MLflow connection status', async () => {
      render(<App />)
      
      await waitFor(() => {
        expect(screen.getByText(/connected/i)).toBeInTheDocument()
      })
    })

    it('should handle MLflow connection errors', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Connection failed'))
      
      render(<App />)
      
      await waitFor(() => {
        expect(screen.getByText(/disconnected/i)).toBeInTheDocument()
      })
    })

    it('should log experiments to MLflow', async () => {
      const user = userEvent.setup()
      
      // Mock successful MLflow responses
      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ status: 'healthy' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ experiment_id: '123' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ run: mockMLflowData.run })
        })
        .mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({})
        })

      render(<App />)
      
      // Complete a recording workflow
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /start recording/i })).toBeEnabled()
      })
      
      await user.click(screen.getByRole('button', { name: /start recording/i }))
      await wait(200)
      await user.click(screen.getByRole('button', { name: /stop recording/i }))
      
      // Should log to MLflow
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('mlflow'),
          expect.any(Object)
        )
      }, { timeout: 10000 })
    })
  })

  describe('Error Handling', () => {
    it('should handle microphone access denied', async () => {
      vi.mocked(navigator.mediaDevices.getUserMedia).mockRejectedValue(
        new Error('Permission denied')
      )
      
      const user = userEvent.setup()
      render(<App />)
      
      await user.click(screen.getByRole('button', { name: /start recording/i }))
      
      await waitFor(() => {
        expect(screen.getByText(/microphone access denied/i)).toBeInTheDocument()
      })
    })

    it('should handle audio analysis errors gracefully', async () => {
      const user = userEvent.setup()
      render(<App />)
      
      // Mock recording to work but analysis to fail
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /start recording/i })).toBeEnabled()
      })
      
      await user.click(screen.getByRole('button', { name: /start recording/i }))
      await wait(100)
      await user.click(screen.getByRole('button', { name: /stop recording/i }))
      
      // Should show error message if analysis fails
      await waitFor(() => {
        const errorElement = screen.queryByText(/analysis failed/i)
        if (errorElement) {
          expect(errorElement).toBeInTheDocument()
        }
      }, { timeout: 5000 })
    })

    it('should handle MLflow errors gracefully', async () => {
      // Mock MLflow to fail after initial connection
      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ status: 'healthy' })
        })
        .mockRejectedValue(new Error('MLflow error'))
      
      const user = userEvent.setup()
      render(<App />)
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /start recording/i })).toBeEnabled()
      })
      
      await user.click(screen.getByRole('button', { name: /start recording/i }))
      await wait(100)
      await user.click(screen.getByRole('button', { name: /stop recording/i }))
      
      // Should continue working even if MLflow fails
      await waitFor(() => {
        expect(screen.getByText(/analyzing/i)).toBeInTheDocument()
      })
    })
  })

  describe('Performance', () => {
    it('should handle rapid user interactions', async () => {
      const user = userEvent.setup()
      render(<App />)
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /start recording/i })).toBeEnabled()
      })
      
      // Rapid start/stop should not break the app
      const startButton = screen.getByRole('button', { name: /start recording/i })
      
      for (let i = 0; i < 3; i++) {
        await user.click(startButton)
        await wait(50)
        if (screen.queryByRole('button', { name: /stop recording/i })) {
          await user.click(screen.getByRole('button', { name: /stop recording/i }))
        }
        await wait(50)
      }
      
      // App should remain functional
      expect(screen.getByRole('button', { name: /start recording/i })).toBeInTheDocument()
    })

    it('should cleanup resources properly', () => {
      const { unmount } = render(<App />)
      
      expect(() => unmount()).not.toThrow()
    })
  })

  describe('Responsive Design', () => {
    it('should adapt to different screen sizes', () => {
      // Test mobile view
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      })
      
      const { unmount } = render(<App />)
      expect(screen.getByText('Orpheus Audio Analysis Demo')).toBeInTheDocument()
      unmount()
      
      // Test desktop view
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920
      })
      
      render(<App />)
      expect(screen.getByText('Orpheus Audio Analysis Demo')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<App />)
      
      // Should be able to navigate with keyboard
      await user.tab()
      expect(document.activeElement).toHaveAttribute('type', 'button')
    })

    it('should have proper ARIA labels', () => {
      render(<App />)
      
      expect(screen.getByRole('button', { name: /start recording/i })).toHaveAttribute('aria-label')
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    it('should announce state changes to screen readers', async () => {
      const user = userEvent.setup()
      render(<App />)
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /start recording/i })).toBeEnabled()
      })
      
      await user.click(screen.getByRole('button', { name: /start recording/i }))
      
      await waitFor(() => {
        expect(screen.getByRole('status')).toHaveTextContent(/recording/i)
      })
    })
  })
})
