import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MLflowService } from '../mlflow'
import { mockMLflowData, createMockAudioBlob } from '../../test/utils'

describe('MLflowService', () => {
  let mlflowService: MLflowService
  
  beforeEach(() => {
    mlflowService = new MLflowService()
    vi.clearAllMocks()
    
    // Setup fetch mock
    global.fetch = vi.fn()
  })

  describe('Initialization', () => {
    it('should initialize with correct default configuration', () => {
      expect(mlflowService.baseUrl).toBe('http://localhost:5000')
      expect(mlflowService.isConnected).toBe(false)
    })

    it('should allow custom base URL', () => {
      const customService = new MLflowService('http://custom-mlflow:8080')
      expect(customService.baseUrl).toBe('http://custom-mlflow:8080')
    })
  })

  describe('Connection Management', () => {
    it('should check MLflow server health', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'healthy' })
      } as Response)

      const isHealthy = await mlflowService.checkHealth()
      expect(isHealthy).toBe(true)
      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/health')
    })

    it('should handle health check failures', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Connection failed'))

      const isHealthy = await mlflowService.checkHealth()
      expect(isHealthy).toBe(false)
    })

    it('should initialize connection successfully', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'healthy' })
      } as Response)

      await mlflowService.initialize()
      expect(mlflowService.isConnected).toBe(true)
    })
  })

  describe('Experiment Management', () => {
    beforeEach(async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: 'healthy' })
      } as Response)
      await mlflowService.initialize()
    })

    it('should create new experiment', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ experiment_id: '123' })
      } as Response)

      const experimentId = await mlflowService.createExperiment('test-experiment')
      
      expect(experimentId).toBe('123')
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/2.0/mlflow/experiments/create',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'test-experiment' })
        })
      )
    })

    it('should get existing experiment by name', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ experiment: mockMLflowData.experiment })
      } as Response)

      const experiment = await mlflowService.getExperimentByName('existing-experiment')
      
      expect(experiment).toEqual(mockMLflowData.experiment)
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/2.0/mlflow/experiments/get-by-name?experiment_name=existing-experiment'
      )
    })

    it('should handle experiment not found', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404
      } as Response)

      const experiment = await mlflowService.getExperimentByName('non-existent')
      expect(experiment).toBeNull()
    })
  })

  describe('Run Management', () => {
    beforeEach(async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: 'healthy' })
      } as Response)
      await mlflowService.initialize()
    })

    it('should start new run', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ run: mockMLflowData.run })
      } as Response)

      const run = await mlflowService.startRun('123', 'test-run')
      
      expect(run).toEqual(mockMLflowData.run)
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/2.0/mlflow/runs/create',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            experiment_id: '123',
            run_name: 'test-run'
          })
        })
      )
    })

    it('should end run', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({})
      } as Response)

      await mlflowService.endRun('run-123')
      
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/2.0/mlflow/runs/update',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            run_id: 'run-123',
            status: 'FINISHED'
          })
        })
      )
    })
  })

  describe('Metrics and Parameters', () => {
    beforeEach(async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: 'healthy' })
      } as Response)
      await mlflowService.initialize()
    })

    it('should log metrics', async () => {
      const metrics = {
        rms: 0.5,
        spectral_centroid: 2000,
        tempo: 120
      }

      await mlflowService.logMetrics('run-123', metrics)
      
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/2.0/mlflow/runs/log-batch',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            run_id: 'run-123',
            metrics: [
              { key: 'rms', value: 0.5, timestamp: expect.any(Number) },
              { key: 'spectral_centroid', value: 2000, timestamp: expect.any(Number) },
              { key: 'tempo', value: 120, timestamp: expect.any(Number) }
            ]
          })
        })
      )
    })

    it('should log parameters', async () => {
      const params = {
        sample_rate: '48000',
        channels: '2',
        format: 'webm'
      }

      await mlflowService.logParams('run-123', params)
      
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/2.0/mlflow/runs/log-batch',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            run_id: 'run-123',
            params: [
              { key: 'sample_rate', value: '48000' },
              { key: 'channels', value: '2' },
              { key: 'format', value: 'webm' }
            ]
          })
        })
      )
    })

    it('should log tags', async () => {
      const tags = {
        'mlflow.user': 'test-user',
        'audio.genre': 'rock'
      }

      await mlflowService.logTags('run-123', tags)
      
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/2.0/mlflow/runs/log-batch',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            run_id: 'run-123',
            tags: [
              { key: 'mlflow.user', value: 'test-user' },
              { key: 'audio.genre', value: 'rock' }
            ]
          })
        })
      )
    })
  })

  describe('Artifact Management', () => {
    beforeEach(async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: 'healthy' })
      } as Response)
      await mlflowService.initialize()
    })

    it('should log audio artifact', async () => {
      const audioBlob = createMockAudioBlob()
      
      await mlflowService.logAudioArtifact('run-123', audioBlob, 'recording.webm')
      
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/2.0/mlflow/artifacts/upload/run-123/recording.webm',
        expect.objectContaining({
          method: 'POST',
          body: audioBlob
        })
      )
    })

    it('should log analysis results as JSON artifact', async () => {
      const analysisResults = {
        duration: 5.0,
        tempo: 120,
        genre: 'rock',
        quality: { snr: 30, thd: 0.1 }
      }

      await mlflowService.logAnalysisResults('run-123', analysisResults)
      
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/2.0/mlflow/artifacts/upload/run-123/analysis_results.json',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(analysisResults, null, 2)
        })
      )
    })

    it('should log visualization as image artifact', async () => {
      const canvas = document.createElement('canvas')
      canvas.width = 800
      canvas.height = 400
      
      // Mock canvas toBlob
      canvas.toBlob = vi.fn((callback) => {
        if (callback) {
          callback(new Blob(['fake-image-data'], { type: 'image/png' }))
        }
      })

      await mlflowService.logVisualization('run-123', canvas, 'waveform.png')
      
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/2.0/mlflow/artifacts/upload/run-123/waveform.png',
        expect.objectContaining({
          method: 'POST'
        })
      )
    })
  })

  describe('Complete Workflow', () => {
    beforeEach(async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: 'healthy' })
      } as Response)
      await mlflowService.initialize()
    })

    it('should log complete audio analysis workflow', async () => {
      const audioBlob = createMockAudioBlob()
      const analysisResults = {
        duration: 5.0,
        sampleRate: 48000,
        channels: 2,
        spectralCentroid: 2000,
        rms: 0.5,
        zeroCrossingRate: 0.1,
        tempo: 120,
        genre: 'rock',
        quality: {
          snr: 30,
          thd: 0.1,
          dynamicRange: 20,
          clipping: false,
          ebur128Compliant: true
        }
      }

      // Mock different responses for different calls
      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ experiment_id: '123' })
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ run: { info: { run_id: 'run-123' } } })
        } as Response)
        .mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({})
        } as Response)

      const result = await mlflowService.logCompleteAnalysis(
        'audio-analysis-experiment',
        'test-recording',
        audioBlob,
        analysisResults
      )

      expect(result.success).toBe(true)
      expect(result.runId).toBe('run-123')
      expect(result.experimentId).toBe('123')
    })

    it('should handle workflow errors gracefully', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'))

      const audioBlob = createMockAudioBlob()
      const analysisResults = { duration: 5.0 }

      const result = await mlflowService.logCompleteAnalysis(
        'test-experiment',
        'test-run',
        audioBlob,
        analysisResults
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('Network error')
    })
  })

  describe('Report Generation', () => {
    beforeEach(async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: 'healthy' })
      } as Response)
      await mlflowService.initialize()
    })

    it('should generate analysis report', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          runs: [
            {
              info: { run_id: 'run-1', experiment_id: '123' },
              data: {
                metrics: { rms: { value: 0.5 } },
                params: { sample_rate: { value: '48000' } },
                tags: { 'audio.genre': { value: 'rock' } }
              }
            }
          ]
        })
      } as Response)

      const report = await mlflowService.generateReport('123')
      
      expect(report).toHaveProperty('experiment_id', '123')
      expect(report).toHaveProperty('total_runs', 1)
      expect(report).toHaveProperty('runs')
      expect(report.runs).toHaveLength(1)
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error')
      } as Response)

      await expect(mlflowService.createExperiment('test')).rejects.toThrow()
    })

    it('should handle network errors', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'))

      await expect(mlflowService.checkHealth()).resolves.toBe(false)
    })

    it('should validate input parameters', async () => {
      await expect(mlflowService.createExperiment('')).rejects.toThrow()
      await expect(mlflowService.startRun('', 'test')).rejects.toThrow()
    })
  })
})
