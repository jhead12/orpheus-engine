import { vi } from 'vitest'

/**
 * Mock audio buffer data for testing
 */
export function createMockAudioBuffer(length: number = 1024): Float32Array {
  const buffer = new Float32Array(length)
  // Generate a simple sine wave for testing
  for (let i = 0; i < length; i++) {
    buffer[i] = Math.sin(2 * Math.PI * 440 * i / 48000) * 0.5
  }
  return buffer
}

/**
 * Mock audio blob for testing
 */
export function createMockAudioBlob(): Blob {
  return new Blob(['mock audio data'], { type: 'audio/webm' })
}

/**
 * Mock canvas context for visualization tests
 */
export function createMockCanvasContext() {
  return {
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    strokeRect: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    arc: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 100 })),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    createLinearGradient: vi.fn(() => ({
      addColorStop: vi.fn()
    })),
    getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
    putImageData: vi.fn(),
    canvas: {
      width: 800,
      height: 400
    },
    fillStyle: '#000000',
    strokeStyle: '#000000',
    lineWidth: 1,
    font: '12px Arial',
    textAlign: 'start',
    textBaseline: 'alphabetic'
  }
}

/**
 * Mock MLflow response data
 */
export const mockMLflowData = {
  experiment: {
    experiment_id: '1',
    name: 'audio-analysis-test',
    lifecycle_stage: 'active'
  },
  run: {
    info: {
      run_id: 'test-run-123',
      experiment_id: '1',
      status: 'FINISHED',
      start_time: Date.now(),
      end_time: Date.now() + 5000
    },
    data: {
      metrics: {},
      params: {},
      tags: {}
    }
  }
}

/**
 * Wait for a specified amount of time
 */
export function wait(ms: number = 100): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Mock performance for audio processing tests
 */
export function mockPerformance() {
  global.performance = {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByName: vi.fn(() => []),
    getEntriesByType: vi.fn(() => []),
    clearMarks: vi.fn(),
    clearMeasures: vi.fn()
  } as any
}
