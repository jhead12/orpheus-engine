import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock MediaDevices first, before any other setup
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: () => [{ 
        stop: vi.fn(),
        kind: 'audio',
        label: 'Default - Microphone',
        enabled: true,
        muted: false,
        readyState: 'live'
      }],
      getAudioTracks: () => [{ 
        stop: vi.fn(),
        kind: 'audio',
        label: 'Default - Microphone',
        enabled: true,
        muted: false,
        readyState: 'live'
      }],
      getVideoTracks: () => [],
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      clone: vi.fn(),
      id: 'mock-stream-id'
    }),
    enumerateDevices: vi.fn().mockResolvedValue([
      { deviceId: 'default', groupId: 'group1', kind: 'audioinput', label: 'Default - Microphone' }
    ]),
    getDisplayMedia: vi.fn(),
    getSupportedConstraints: vi.fn().mockReturnValue({
      audio: true,
      video: true,
      echoCancellation: true,
      noiseSuppression: true
    })
  }
})

// Mock Web Audio API - Create comprehensive mocks before any imports
const mockAudioBuffer = {
  duration: 5.0,
  sampleRate: 44100,
  numberOfChannels: 2,
  length: 220500,
  getChannelData: vi.fn().mockReturnValue(new Float32Array(220500).fill(0.1)),
  copyFromChannel: vi.fn(),
  copyToChannel: vi.fn()
}

const mockAnalyserNode = {
  fftSize: 2048,
  frequencyBinCount: 1024,
  minDecibels: -100,
  maxDecibels: -30,
  smoothingTimeConstant: 0.8,
  getByteFrequencyData: vi.fn(),
  getByteTimeDomainData: vi.fn(),
  getFloatFrequencyData: vi.fn(),
  getFloatTimeDomainData: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn()
}

const mockGainNode = {
  gain: { 
    value: 1,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn()
  },
  connect: vi.fn(),
  disconnect: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn()
}

const mockMediaStreamAudioSourceNode = {
  mediaStream: null,
  connect: vi.fn(),
  disconnect: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn()
}

const mockAudioContext = {
  state: 'running',
  sampleRate: 44100,
  currentTime: 0,
  destination: { connect: vi.fn(), disconnect: vi.fn() },
  listener: { 
    positionX: { value: 0 },
    positionY: { value: 0 },
    positionZ: { value: 0 },
    forwardX: { value: 0 },
    forwardY: { value: 0 },
    forwardZ: { value: -1 },
    upX: { value: 0 },
    upY: { value: 1 },
    upZ: { value: 0 }
  },
  createAnalyser: vi.fn().mockReturnValue(mockAnalyserNode),
  createGain: vi.fn().mockReturnValue(mockGainNode),
  createMediaStreamSource: vi.fn().mockReturnValue(mockMediaStreamAudioSourceNode),
  createScriptProcessor: vi.fn().mockReturnValue({
    connect: vi.fn(),
    disconnect: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    onaudioprocess: null
  }),
  decodeAudioData: vi.fn().mockResolvedValue(mockAudioBuffer),
  suspend: vi.fn().mockResolvedValue(undefined),
  resume: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn()
}

// Set up AudioContext mock globally
Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: vi.fn().mockImplementation(() => mockAudioContext)
})

Object.defineProperty(window, 'webkitAudioContext', {
  writable: true,
  value: vi.fn().mockImplementation(() => mockAudioContext)
})

// Mock MediaRecorder
const mockMediaRecorder = vi.fn().mockImplementation((stream, options) => ({
  state: 'inactive',
  stream,
  mimeType: options?.mimeType || 'audio/webm',
  videoBitsPerSecond: 0,
  audioBitsPerSecond: 128000,
  start: vi.fn().mockImplementation(function() { this.state = 'recording' }),
  stop: vi.fn().mockImplementation(function() { this.state = 'inactive' }),
  pause: vi.fn().mockImplementation(function() { this.state = 'paused' }),
  resume: vi.fn().mockImplementation(function() { this.state = 'recording' }),
  requestData: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
  ondataavailable: null,
  onstart: null,
  onstop: null,
  onpause: null,
  onresume: null,
  onerror: null
}))

mockMediaRecorder.isTypeSupported = vi.fn().mockReturnValue(true)

Object.defineProperty(window, 'MediaRecorder', {
  writable: true,
  value: mockMediaRecorder
})

// Mock Canvas API
const mockCanvasContext = {
  fillStyle: '#000000',
  strokeStyle: '#000000',
  lineWidth: 1,
  font: '10px sans-serif',
  textAlign: 'start',
  textBaseline: 'alphabetic',
  globalAlpha: 1,
  globalCompositeOperation: 'source-over',
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  closePath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  quadraticCurveTo: vi.fn(),
  bezierCurveTo: vi.fn(),
  arc: vi.fn(),
  arcTo: vi.fn(),
  rect: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  clip: vi.fn(),
  fillText: vi.fn(),
  strokeText: vi.fn(),
  measureText: vi.fn().mockReturnValue({ width: 100 }),
  drawImage: vi.fn(),
  createImageData: vi.fn(),
  getImageData: vi.fn().mockReturnValue({
    data: new Uint8ClampedArray(4),
    width: 1,
    height: 1
  }),
  putImageData: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  translate: vi.fn(),
  transform: vi.fn(),
  setTransform: vi.fn(),
  resetTransform: vi.fn(),
  createLinearGradient: vi.fn().mockReturnValue({
    addColorStop: vi.fn()
  }),
  createRadialGradient: vi.fn().mockReturnValue({
    addColorStop: vi.fn()
  }),
  createPattern: vi.fn(),
  isPointInPath: vi.fn().mockReturnValue(false),
  isPointInStroke: vi.fn().mockReturnValue(false)
}

HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation((contextType) => {
  if (contextType === '2d') {
    return mockCanvasContext
  }
  return null
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation((callback) => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock fetch for MLflow API calls
global.fetch = vi.fn()

// Mock URL.createObjectURL and URL.revokeObjectURL
Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: vi.fn().mockReturnValue('blob:mock-url')
})

Object.defineProperty(URL, 'revokeObjectURL', {
  writable: true,
  value: vi.fn()
})

// Mock performance.now for timing operations
Object.defineProperty(performance, 'now', {
  writable: true,
  value: vi.fn().mockReturnValue(Date.now())
})

// Export mock objects for use in tests
export {
  mockAudioContext,
  mockAudioBuffer,
  mockAnalyserNode,
  mockGainNode,
  mockMediaStreamAudioSourceNode,
  mockMediaRecorder,
  mockCanvasContext
}
