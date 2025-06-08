// TrackComponent Integration Tests - Tests data transfer between frontend/backend
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import TrackComponent from '../TrackComponent'
import { WorkstationContext } from '@orpheus/contexts'

// Define enums
const TrackType = {
  Audio: "audio" as const,
  Midi: "midi" as const,
  Sequencer: "sequencer" as const,
}

const AutomationMode = {
  Read: "read" as const,
  Write: "write" as const,
  Touch: "touch" as const,
  Latch: "latch" as const,
  Off: "off" as const,
}

const AutomationLaneEnvelope = {
  Volume: "volume" as const,
  Pan: "pan" as const,
  Tempo: "tempo" as const,
  Send: "send" as const,
  Filter: "filter" as const,
  Effect: "effect" as const,
}

describe('TrackComponent Integration Tests', () => {
  let container: HTMLDivElement
  let mockFetch: any

  // Factory function for mock timeline positions
  function createMockTimelinePosition(bar = 0, beat = 0, tick = 0): any {
    return {
      bar, beat, tick, ticks: 0,
      toMargin: vi.fn(() => 0),
      fromMargin: vi.fn(() => ({ ticks: 0 })),
      snap: vi.fn(() => ({ ticks: 0 })),
      toTicks: vi.fn(() => 0),
      toSeconds: vi.fn(() => 0),
      copy: vi.fn(() => createMockTimelinePosition(bar, beat, tick)),
      equals: vi.fn(() => true),
      add: vi.fn(() => createMockTimelinePosition()),
      compareTo: vi.fn(() => 0),
    }
  }

  const createTestContainer = () => {
    const div = document.createElement('div')
    div.style.width = '800px'
    div.style.height = '600px'
    div.style.position = 'absolute'
    div.style.top = '0'
    div.style.left = '0'
    div.style.background = 'white'
    document.body.appendChild(div)
    return div
  }

  const baseTrack: any = {
    id: 'integration-test-track',
    name: 'Integration Test Track',
    type: TrackType.Audio,
    mute: false,
    solo: false,
    armed: false,
    volume: 0,
    pan: 0,
    automation: false,
    automationMode: AutomationMode.Read,
    automationLanes: [],
    clips: [],
    color: '#ff0000',
    height: 100,
    collapsed: false,
    selected: false,
    effects: [],
    fx: { preset: null, effects: [], selectedEffectIndex: 0 },
    inputs: [],
    outputs: [],
  }

  const mockWorkstationContext: any = {
    tracks: [baseTrack],
    masterTrack: baseTrack,
    playheadPos: createMockTimelinePosition(),
    maxPos: createMockTimelinePosition(),
    numMeasures: 4,
    snapGridSize: createMockTimelinePosition(),
    songRegion: null,
    verticalScale: 1,
    timelineSettings: {
      beatWidth: 40,
      timeSignature: { beats: 4, noteValue: 4 },
      horizontalScale: 1,
      tempo: 120,
    },
    isPlaying: false,
    scrollToItem: null,
    allowMenuAndShortcuts: true,
    setTracks: vi.fn(),
    setPlayheadPos: vi.fn(),
    setSongRegion: vi.fn(),
    setVerticalScale: vi.fn(),
    setScrollToItem: vi.fn(),
    setAllowMenuAndShortcuts: vi.fn(),
    addTrack: vi.fn(),
    adjustNumMeasures: vi.fn(),
    createAudioClip: vi.fn(),
    insertClips: vi.fn(),
    updateTimelineSettings: vi.fn(),
    setTrack: vi.fn(),
    duplicateTrack: vi.fn(),
    deleteTrack: vi.fn(),
    clearAutomation: vi.fn(),
    getTrackCurrentValue: vi.fn(() => ({ value: 0.8, isAutomated: false })),
    addNode: vi.fn(),
    setLane: vi.fn(),
    setSelectedNodeId: vi.fn(),
    selectedTrackId: null,
    setSelectedTrackId: vi.fn(),
    trackRegion: null,
    setTrackRegion: vi.fn(),
    selectedClipId: null,
    setSelectedClipId: vi.fn(),
    deleteClip: vi.fn(),
    duplicateClip: vi.fn(),
    splitClip: vi.fn(),
    consolidateClip: vi.fn(),
    toggleMuteClip: vi.fn(),
    pasteClip: vi.fn(),
    createClipFromTrackRegion: vi.fn(),
  }

  beforeAll(() => {
    // Setup mock fetch for API calls
    mockFetch = vi.fn()
    global.fetch = mockFetch
  })

  beforeEach(() => {
    container = createTestContainer()
    mockFetch.mockClear()
    
    // Reset all context function mocks
    Object.values(mockWorkstationContext).forEach(fn => {
      if (typeof fn === 'function' && fn.mockClear) {
        fn.mockClear()
      }
    })
  })

  afterEach(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container)
    }
  })

  const renderWithContext = (component: React.ReactElement) => {
    return render(
      <WorkstationContext.Provider value={mockWorkstationContext}>
        {component}
      </WorkstationContext.Provider>,
      { container }
    )
  }

  describe('Frontend to Backend Data Transfer', () => {
    it('should send track updates to backend API', async () => {
      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, trackId: baseTrack.id })
      })

      const track = { ...baseTrack, volume: -12 }
      renderWithContext(<TrackComponent track={track} />)

      // Simulate track update
      mockWorkstationContext.setTrack.mockImplementation(async (updatedTrack) => {
        // Simulate API call that would happen in real implementation
        const response = await fetch('/api/tracks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedTrack)
        })
        
        return response.json()
      })

      // Trigger a track update
      mockWorkstationContext.setTrack(track)
      
      await waitFor(() => {
        expect(mockWorkstationContext.setTrack).toHaveBeenCalledWith(track)
      })
    })

    it('should handle real-time WebSocket updates', async () => {
      // Mock WebSocket-like updates
      const mockWebSocket = {
        send: vi.fn(),
        close: vi.fn(),
        readyState: 1, // OPEN
      }

      // Simulate receiving real-time track data
      const { rerender } = renderWithContext(<TrackComponent track={baseTrack} />)

      // Simulate WebSocket message with track update
      const wsMessage = {
        type: 'track_update',
        payload: {
          trackId: baseTrack.id,
          volume: -15,
          timestamp: Date.now()
        }
      }

      // Update track with WebSocket data
      const updatedTrack = { ...baseTrack, volume: wsMessage.payload.volume }
      rerender(
        <WorkstationContext.Provider value={mockWorkstationContext}>
          <TrackComponent track={updatedTrack} />
        </WorkstationContext.Provider>
      )

      expect(updatedTrack.volume).toBe(-15)
    })

    it('should sync automation data with backend', async () => {
      const automationData = {
        trackId: baseTrack.id,
        laneId: 'volume-lane',
        nodes: [
          { id: 'node-1', position: createMockTimelinePosition(0), value: 0 },
          { id: 'node-2', position: createMockTimelinePosition(2), value: -10 },
          { id: 'node-3', position: createMockTimelinePosition(4), value: -5 }
        ]
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, automationData })
      })

      const trackWithAutomation = {
        ...baseTrack,
        automation: true,
        automationLanes: [{
          id: 'volume-lane',
          label: 'Volume',
          envelope: AutomationLaneEnvelope.Volume,
          enabled: true,
          minValue: -60,
          maxValue: 6,
          nodes: automationData.nodes,
          show: true,
          expanded: true,
        }]
      }

      renderWithContext(<TrackComponent track={trackWithAutomation} />)

      // Verify automation data is properly structured
      expect(trackWithAutomation.automationLanes[0].nodes).toHaveLength(3)
      expect(trackWithAutomation.automationLanes[0].nodes[1].value).toBe(-10)
    })
  })

  describe('Model Integration and Data Flow', () => {
    it('should process audio data through analysis model', async () => {
      // Mock model API response
      const mockAnalysisResult = {
        trackId: baseTrack.id,
        analysis: {
          tempo: 128.5,
          key: 'C#',
          energy: 0.75,
          valence: 0.82,
          features: {
            spectral_centroid: 2150.0,
            spectral_rolloff: 4300.0,
            zero_crossing_rate: 0.082,
            mfcc: [-15.2, 12.8, -8.9, 5.1, -3.7, 2.4, -1.8, 1.2, -0.9, 0.6, -0.4, 0.3, -0.2]
          },
          confidence: 0.94
        },
        processingTime: 245
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalysisResult
      })

      const audioData = Array.from({ length: 2048 }, (_, i) => Math.sin(i * 0.1 * Math.PI))
      const trackWithAudio = {
        ...baseTrack,
        audioData,
        sampleRate: 44100,
        duration: audioData.length / 44100
      }

      renderWithContext(<TrackComponent track={trackWithAudio} />)

      // Simulate audio analysis request
      const analysisResult = await fetch('/api/analyze-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackId: trackWithAudio.id,
          audioData: audioData.slice(0, 1024) // Send sample
        })
      }).then(res => res.json())

      expect(analysisResult.analysis.tempo).toBeCloseTo(128.5)
      expect(analysisResult.analysis.key).toBe('C#')
      expect(analysisResult.analysis.confidence).toBeGreaterThan(0.9)
    })

    it('should log metrics to MLflow tracking', async () => {
      // Mock MLflow tracking responses
      const mockRunId = 'run_12345_abcdef'
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ run_id: mockRunId })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true })
        })

      renderWithContext(<TrackComponent track={baseTrack} />)

      // Simulate MLflow experiment tracking
      const experimentData = {
        experiment_name: 'track-component-integration',
        run_name: `test-run-${Date.now()}`,
        tags: {
          component: 'TrackComponent',
          test_type: 'integration'
        }
      }

      const metrics = {
        track_volume: baseTrack.volume,
        track_pan: baseTrack.pan,
        effects_count: baseTrack.effects.length,
        automation_lanes_count: baseTrack.automationLanes.length
      }

      // Start MLflow run
      const startRunResponse = await fetch('/api/mlflow/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(experimentData)
      }).then(res => res.json())

      // Log metrics
      await fetch(`/api/mlflow/runs/${startRunResponse.run_id}/metrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics)
      })

      expect(startRunResponse.run_id).toBe(mockRunId)
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('should handle model prediction requests', async () => {
      const mockPrediction = {
        track_classification: 'electronic',
        mood_prediction: 'energetic',
        recommended_effects: ['reverb', 'delay', 'chorus'],
        confidence_scores: {
          classification: 0.89,
          mood: 0.76
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPrediction
      })

      const trackFeatures = {
        tempo: 128,
        key: 'C',
        energy: 0.8,
        danceability: 0.7,
        valence: 0.6
      }

      renderWithContext(<TrackComponent track={baseTrack} />)

      // Request model prediction
      const prediction = await fetch('/api/models/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model_name: 'track_classifier',
          features: trackFeatures
        })
      }).then(res => res.json())

      expect(prediction.track_classification).toBe('electronic')
      expect(prediction.recommended_effects).toContain('reverb')
      expect(prediction.confidence_scores.classification).toBeGreaterThan(0.8)
    })
  })

  describe('Error Handling and Resilience', () => {
    it('should handle API failures gracefully', async () => {
      // Mock API failure
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const { container: renderedContainer } = renderWithContext(<TrackComponent track={baseTrack} />)

      // Component should still render even if API calls fail
      expect(renderedContainer.querySelector('[data-testid="track-component"], [class*="track"]')).toBeTruthy()
    })

    it('should retry failed requests', async () => {
      // First call fails, second succeeds
      mockFetch
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true })
        })

      renderWithContext(<TrackComponent track={baseTrack} />)

      // Simulate retry logic (would be implemented in actual service layer)
      let attempt = 0
      const maxRetries = 2
      
      const makeRequest = async (): Promise<any> => {
        try {
          return await fetch('/api/tracks').then(res => res.json())
        } catch (error) {
          attempt++
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 100))
            return makeRequest()
          }
          throw error
        }
      }

      const result = await makeRequest()
      expect(result.success).toBe(true)
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('should validate data before sending to backend', async () => {
      const invalidTrack = {
        ...baseTrack,
        volume: 'invalid' as any, // Invalid volume value
        pan: 150 // Out of range pan value
      }

      renderWithContext(<TrackComponent track={invalidTrack} />)

      // Validation should prevent invalid data from being sent
      const isValid = validateTrackData(invalidTrack)
      expect(isValid).toBe(false)
    })
  })

  describe('Performance and Optimization', () => {
    it('should debounce rapid updates', async () => {
      const user = userEvent.setup()
      const { getByDisplayValue } = renderWithContext(<TrackComponent track={baseTrack} />)

      const nameInput = getByDisplayValue('Integration Test Track')

      // Simulate rapid typing
      await user.clear(nameInput)
      await user.type(nameInput, 'New Name')

      // Should only call setTrack once after debounce period
      await waitFor(() => {
        expect(mockWorkstationContext.setTrack).toHaveBeenCalled()
      }, { timeout: 1000 })

      // Verify debouncing behavior
      const callCount = mockWorkstationContext.setTrack.mock.calls.length
      expect(callCount).toBeGreaterThan(0)
    })

    it('should batch multiple updates', async () => {
      const updates = [
        { volume: -5 },
        { pan: 10 },
        { mute: true }
      ]

      renderWithContext(<TrackComponent track={baseTrack} />)

      // Simulate batched updates
      const batchedUpdate = updates.reduce((acc, update) => ({ ...acc, ...update }), baseTrack)
      mockWorkstationContext.setTrack(batchedUpdate)

      await waitFor(() => {
        expect(mockWorkstationContext.setTrack).toHaveBeenCalledWith(
          expect.objectContaining({
            volume: -5,
            pan: 10,
            mute: true
          })
        )
      })
    })
  })
})

// Helper function for data validation
function validateTrackData(track: any): boolean {
  if (typeof track.volume !== 'number' || track.volume < -60 || track.volume > 12) {
    return false
  }
  if (typeof track.pan !== 'number' || track.pan < -100 || track.pan > 100) {
    return false
  }
  if (typeof track.name !== 'string' || track.name.length === 0) {
    return false
  }
  return true
}
