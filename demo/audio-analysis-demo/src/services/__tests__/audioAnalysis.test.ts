import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AudioAnalysisService } from '../services/audioAnalysis'
import { createMockAudioBuffer, mockPerformance } from '../test/utils'

describe('AudioAnalysisService', () => {
  let audioAnalysis: AudioAnalysisService
  
  beforeEach(() => {
    audioAnalysis = new AudioAnalysisService()
    mockPerformance()
  })

  describe('FFT Analysis', () => {
    it('should compute FFT correctly', () => {
      const mockBuffer = createMockAudioBuffer(1024)
      const fftResult = audioAnalysis.computeFFT(mockBuffer)
      
      expect(fftResult).toHaveLength(512) // Half of input size for real FFT
      expect(fftResult.every(val => typeof val === 'number')).toBe(true)
      expect(fftResult.every(val => !isNaN(val))).toBe(true)
    })

    it('should handle empty buffer gracefully', () => {
      const emptyBuffer = new Float32Array(0)
      const fftResult = audioAnalysis.computeFFT(emptyBuffer)
      
      expect(fftResult).toHaveLength(0)
    })

    it('should handle different buffer sizes', () => {
      const sizes = [256, 512, 1024, 2048]
      
      sizes.forEach(size => {
        const buffer = createMockAudioBuffer(size)
        const fftResult = audioAnalysis.computeFFT(buffer)
        expect(fftResult).toHaveLength(size / 2)
      })
    })
  })

  describe('Spectral Analysis', () => {
    it('should calculate spectral centroid correctly', () => {
      const mockBuffer = createMockAudioBuffer(1024)
      const centroid = audioAnalysis.calculateSpectralCentroid(mockBuffer)
      
      expect(typeof centroid).toBe('number')
      expect(centroid).toBeGreaterThan(0)
      expect(centroid).toBeLessThan(24000) // Should be within audio range
    })

    it('should calculate RMS correctly', () => {
      const mockBuffer = createMockAudioBuffer(1024)
      const rms = audioAnalysis.calculateRMS(mockBuffer)
      
      expect(typeof rms).toBe('number')
      expect(rms).toBeGreaterThanOrEqual(0)
      expect(rms).toBeLessThanOrEqual(1)
    })

    it('should calculate zero crossing rate', () => {
      const mockBuffer = createMockAudioBuffer(1024)
      const zcr = audioAnalysis.calculateZeroCrossingRate(mockBuffer)
      
      expect(typeof zcr).toBe('number')
      expect(zcr).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Tempo Detection', () => {
    it('should estimate tempo using autocorrelation', () => {
      const mockBuffer = createMockAudioBuffer(48000) // 1 second at 48kHz
      const tempo = audioAnalysis.estimateTempo(mockBuffer)
      
      expect(typeof tempo).toBe('number')
      expect(tempo).toBeGreaterThan(60) // Reasonable tempo range
      expect(tempo).toBeLessThan(200)
    })

    it('should handle short buffers for tempo detection', () => {
      const shortBuffer = createMockAudioBuffer(100)
      const tempo = audioAnalysis.estimateTempo(shortBuffer)
      
      expect(typeof tempo).toBe('number')
      expect(tempo).toBeGreaterThan(0)
    })
  })

  describe('Genre Classification', () => {
    it('should classify audio genre based on features', () => {
      const mockFeatures = {
        spectralCentroid: 2000,
        rms: 0.3,
        zeroCrossingRate: 0.1,
        tempo: 120,
        spectralRolloff: 8000,
        mfcc: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
      }
      
      const genre = audioAnalysis.classifyGenre(mockFeatures)
      
      expect(typeof genre).toBe('string')
      expect(['rock', 'jazz', 'classical', 'electronic', 'pop', 'hip-hop', 'unknown']).toContain(genre)
    })

    it('should return unknown for invalid features', () => {
      const invalidFeatures = {
        spectralCentroid: NaN,
        rms: -1,
        zeroCrossingRate: 2,
        tempo: 0,
        spectralRolloff: -100,
        mfcc: []
      }
      
      const genre = audioAnalysis.classifyGenre(invalidFeatures)
      expect(genre).toBe('unknown')
    })
  })

  describe('Quality Assessment', () => {
    it('should assess audio quality', () => {
      const mockBuffer = createMockAudioBuffer(1024)
      const quality = audioAnalysis.assessQuality(mockBuffer)
      
      expect(quality).toHaveProperty('snr')
      expect(quality).toHaveProperty('thd')
      expect(quality).toHaveProperty('dynamicRange')
      expect(quality).toHaveProperty('clipping')
      expect(quality).toHaveProperty('ebur128Compliant')
      
      expect(typeof quality.snr).toBe('number')
      expect(typeof quality.thd).toBe('number')
      expect(typeof quality.dynamicRange).toBe('number')
      expect(typeof quality.clipping).toBe('boolean')
      expect(typeof quality.ebur128Compliant).toBe('boolean')
    })

    it('should detect clipping in audio', () => {
      // Create buffer with clipping
      const clippedBuffer = new Float32Array(1024)
      clippedBuffer.fill(1.0) // Maximum amplitude
      
      const quality = audioAnalysis.assessQuality(clippedBuffer)
      expect(quality.clipping).toBe(true)
    })

    it('should detect clean audio without clipping', () => {
      const cleanBuffer = createMockAudioBuffer(1024)
      const quality = audioAnalysis.assessQuality(cleanBuffer)
      
      expect(quality.clipping).toBe(false)
    })
  })

  describe('Complete Analysis', () => {
    it('should perform comprehensive audio analysis', async () => {
      const mockBuffer = createMockAudioBuffer(48000)
      const blob = new Blob(['mock audio data'], { type: 'audio/webm' })
      
      const results = await audioAnalysis.analyzeAudio(blob, mockBuffer)
      
      expect(results).toHaveProperty('duration')
      expect(results).toHaveProperty('sampleRate')
      expect(results).toHaveProperty('channels')
      expect(results).toHaveProperty('spectralCentroid')
      expect(results).toHaveProperty('rms')
      expect(results).toHaveProperty('zeroCrossingRate')
      expect(results).toHaveProperty('tempo')
      expect(results).toHaveProperty('genre')
      expect(results).toHaveProperty('quality')
      expect(results).toHaveProperty('frequencySpectrum')
      expect(results).toHaveProperty('waveform')
      
      expect(typeof results.duration).toBe('number')
      expect(typeof results.sampleRate).toBe('number')
      expect(typeof results.channels).toBe('number')
      expect(Array.isArray(results.frequencySpectrum)).toBe(true)
      expect(Array.isArray(results.waveform)).toBe(true)
    })

    it('should handle analysis errors gracefully', async () => {
      const invalidBlob = new Blob([''], { type: 'text/plain' })
      const emptyBuffer = new Float32Array(0)
      
      const results = await audioAnalysis.analyzeAudio(invalidBlob, emptyBuffer)
      
      expect(results).toHaveProperty('duration')
      expect(results.duration).toBe(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle NaN values in audio data', () => {
      const nanBuffer = new Float32Array(1024)
      nanBuffer.fill(NaN)
      
      const rms = audioAnalysis.calculateRMS(nanBuffer)
      expect(rms).toBe(0) // Should handle NaN gracefully
    })

    it('should handle infinite values in audio data', () => {
      const infBuffer = new Float32Array(1024)
      infBuffer.fill(Infinity)
      
      const rms = audioAnalysis.calculateRMS(infBuffer)
      expect(isFinite(rms)).toBe(true)
    })

    it('should handle very small audio buffers', () => {
      const tinyBuffer = new Float32Array(1)
      tinyBuffer[0] = 0.5
      
      const rms = audioAnalysis.calculateRMS(tinyBuffer)
      expect(typeof rms).toBe('number')
      expect(isFinite(rms)).toBe(true)
    })
  })
})
