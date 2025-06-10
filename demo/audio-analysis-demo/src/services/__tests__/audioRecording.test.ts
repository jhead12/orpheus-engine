import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { AudioRecordingService } from '../audioRecording'
import { createMockAudioBlob, wait } from '../../test/utils'

describe('AudioRecordingService', () => {
  let recordingService: AudioRecordingService
  
  beforeEach(() => {
    recordingService = new AudioRecordingService()
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (recordingService.isRecording) {
      recordingService.stopRecording()
    }
  })

  describe('Initialization', () => {
    it('should initialize with correct default state', () => {
      expect(recordingService.isRecording).toBe(false)
      expect(recordingService.isPaused).toBe(false)
      expect(recordingService.recordingDuration).toBe(0)
    })

    it('should check browser compatibility', () => {
      const isSupported = recordingService.isBrowserSupported()
      expect(typeof isSupported).toBe('boolean')
      expect(isSupported).toBe(true) // Our mock should support it
    })
  })

  describe('Microphone Access', () => {
    it('should request microphone access successfully', async () => {
      await expect(recordingService.requestMicrophoneAccess()).resolves.toBeUndefined()
    })

    it('should handle microphone access errors', async () => {
      // Mock getUserMedia to reject
      vi.mocked(navigator.mediaDevices.getUserMedia).mockRejectedValueOnce(
        new Error('Permission denied')
      )

      await expect(recordingService.requestMicrophoneAccess()).rejects.toThrow('Permission denied')
    })

    it('should get available audio devices', async () => {
      // Mock enumerateDevices
      navigator.mediaDevices.enumerateDevices = vi.fn().mockResolvedValue([
        {
          deviceId: 'device1',
          kind: 'audioinput',
          label: 'Microphone 1',
          groupId: 'group1'
        },
        {
          deviceId: 'device2',
          kind: 'audioinput',
          label: 'Microphone 2',
          groupId: 'group2'
        }
      ])

      const devices = await recordingService.getAvailableDevices()
      expect(devices).toHaveLength(2)
      expect(devices[0]).toHaveProperty('deviceId', 'device1')
      expect(devices[0]).toHaveProperty('label', 'Microphone 1')
    })
  })

  describe('Recording Control', () => {
    beforeEach(async () => {
      await recordingService.requestMicrophoneAccess()
    })

    it('should start recording successfully', async () => {
      const startPromise = recordingService.startRecording()
      
      await wait(50) // Allow time for setup
      expect(recordingService.isRecording).toBe(true)
      expect(recordingService.isPaused).toBe(false)
      
      await startPromise
    })

    it('should stop recording and return audio blob', async () => {
      await recordingService.startRecording()
      await wait(100)
      
      const audioBlob = await recordingService.stopRecording()
      
      expect(recordingService.isRecording).toBe(false)
      expect(audioBlob).toBeInstanceOf(Blob)
      expect(audioBlob.type).toContain('audio')
    })

    it('should pause and resume recording', async () => {
      await recordingService.startRecording()
      await wait(50)
      
      recordingService.pauseRecording()
      expect(recordingService.isPaused).toBe(true)
      
      recordingService.resumeRecording()
      expect(recordingService.isPaused).toBe(false)
    })

    it('should not start recording if already recording', async () => {
      await recordingService.startRecording()
      
      await expect(recordingService.startRecording()).rejects.toThrow()
    })

    it('should not stop recording if not recording', async () => {
      await expect(recordingService.stopRecording()).rejects.toThrow()
    })
  })

  describe('Audio Levels Monitoring', () => {
    beforeEach(async () => {
      await recordingService.requestMicrophoneAccess()
    })

    it('should monitor audio levels during recording', async () => {
      let levelUpdates = 0
      const unsubscribe = recordingService.onLevelUpdate((level) => {
        expect(typeof level).toBe('number')
        expect(level).toBeGreaterThanOrEqual(0)
        expect(level).toBeLessThanOrEqual(100)
        levelUpdates++
      })

      await recordingService.startRecording()
      await wait(200) // Wait for level updates
      
      expect(levelUpdates).toBeGreaterThan(0)
      
      unsubscribe()
      await recordingService.stopRecording()
    })

    it('should stop level monitoring when recording stops', async () => {
      let levelUpdates = 0
      recordingService.onLevelUpdate(() => levelUpdates++)

      await recordingService.startRecording()
      await wait(100)
      await recordingService.stopRecording()
      
      const updatesAfterStop = levelUpdates
      await wait(100)
      
      expect(levelUpdates).toBe(updatesAfterStop) // No new updates
    })
  })

  describe('Recording Duration', () => {
    beforeEach(async () => {
      await recordingService.requestMicrophoneAccess()
    })

    it('should track recording duration', async () => {
      await recordingService.startRecording()
      
      await wait(100)
      expect(recordingService.recordingDuration).toBeGreaterThan(0)
      
      await wait(100)
      const duration1 = recordingService.recordingDuration
      
      await wait(100)
      const duration2 = recordingService.recordingDuration
      
      expect(duration2).toBeGreaterThan(duration1)
      
      await recordingService.stopRecording()
    })

    it('should reset duration when stopping', async () => {
      await recordingService.startRecording()
      await wait(200)
      
      expect(recordingService.recordingDuration).toBeGreaterThan(0)
      
      await recordingService.stopRecording()
      expect(recordingService.recordingDuration).toBe(0)
    })

    it('should not increment duration when paused', async () => {
      await recordingService.startRecording()
      await wait(100)
      
      recordingService.pauseRecording()
      const pausedDuration = recordingService.recordingDuration
      
      await wait(100)
      expect(recordingService.recordingDuration).toBe(pausedDuration)
      
      await recordingService.stopRecording()
    })
  })

  describe('Audio Formats', () => {
    it('should get supported audio formats', () => {
      const formats = recordingService.getSupportedFormats()
      
      expect(Array.isArray(formats)).toBe(true)
      expect(formats.length).toBeGreaterThan(0)
      formats.forEach(format => {
        expect(typeof format).toBe('string')
        expect(format).toMatch(/^audio\//)
      })
    })

    it('should use preferred format if available', async () => {
      const preferredFormat = 'audio/webm;codecs=opus'
      await recordingService.requestMicrophoneAccess()
      await recordingService.startRecording(preferredFormat)
      
      const audioBlob = await recordingService.stopRecording()
      expect(audioBlob.type).toBe(preferredFormat)
    })
  })

  describe('Error Handling', () => {
    it('should handle MediaRecorder errors', async () => {
      await recordingService.requestMicrophoneAccess()
      
      // Mock MediaRecorder to throw error
      const originalMediaRecorder = global.MediaRecorder
      global.MediaRecorder = class extends originalMediaRecorder {
        start() {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror(new Event('error'))
            }
          }, 50)
        }
      }

      await expect(recordingService.startRecording()).rejects.toThrow()
      
      global.MediaRecorder = originalMediaRecorder
    })

    it('should cleanup resources on error', async () => {
      await recordingService.requestMicrophoneAccess()
      
      try {
        await recordingService.startRecording()
        // Simulate error
        throw new Error('Test error')
      } catch (error) {
        expect(recordingService.isRecording).toBe(false)
      }
    })
  })

  describe('Multiple Recording Sessions', () => {
    beforeEach(async () => {
      await recordingService.requestMicrophoneAccess()
    })

    it('should handle multiple recording sessions', async () => {
      // First recording
      await recordingService.startRecording()
      await wait(100)
      const blob1 = await recordingService.stopRecording()
      
      expect(blob1).toBeInstanceOf(Blob)
      
      // Second recording
      await recordingService.startRecording()
      await wait(100)
      const blob2 = await recordingService.stopRecording()
      
      expect(blob2).toBeInstanceOf(Blob)
      expect(blob1).not.toBe(blob2) // Should be different objects
    })
  })

  describe('Resource Management', () => {
    it('should cleanup resources when destroyed', async () => {
      await recordingService.requestMicrophoneAccess()
      await recordingService.startRecording()
      
      recordingService.cleanup()
      
      expect(recordingService.isRecording).toBe(false)
    })

    it('should handle cleanup when not recording', () => {
      expect(() => recordingService.cleanup()).not.toThrow()
    })
  })
})
