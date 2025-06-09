import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserAudioProvider } from './services/audio/BrowserAudioProvider'
import { BrowserServiceWorkerProvider } from './services/browser/BrowserServiceWorkerProvider'

// Browser-specific initialization
console.log('🌐 Initializing Orpheus Engine in Browser Mode')

// Check for required browser APIs
const checkBrowserAPIs = () => {
  const requiredAPIs = {
    AudioContext: !!(window.AudioContext || window.webkitAudioContext),
    WebAudio: 'createGain' in ((window.AudioContext || window.webkitAudioContext)?.prototype || {}),
    FileAPI: !!(window.File && window.FileReader),
    IndexedDB: !!window.indexedDB,
    Workers: !!window.Worker
  }
  
  const missingAPIs = Object.entries(requiredAPIs)
    .filter(([_, supported]) => !supported)
    .map(([api, _]) => api)
  
  if (missingAPIs.length > 0) {
    console.warn('⚠️ Missing browser APIs:', missingAPIs)
    // Show user-friendly message about browser compatibility
  }
  
  return requiredAPIs
}

// Initialize browser environment
const browserAPIs = checkBrowserAPIs()

// Browser-specific error handling
window.addEventListener('error', (event) => {
  console.error('🚨 Browser Error:', event.error)
  // Could send to error reporting service
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled Promise Rejection:', event.reason)
  event.preventDefault()
})

// Audio context initialization with user gesture handling
let audioContext: AudioContext | null = null
const initializeAudioContext = async () => {
  if (!audioContext && (window.AudioContext || window.webkitAudioContext)) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
    
    // Resume audio context if suspended (browser autoplay policy)
    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }
    
    console.log('🎵 Audio Context initialized:', audioContext.state)
  }
  return audioContext
}

// User gesture handler for audio initialization
const handleUserGesture = async () => {
  await initializeAudioContext()
  document.removeEventListener('click', handleUserGesture)
  document.removeEventListener('keydown', handleUserGesture)
  document.removeEventListener('touchstart', handleUserGesture)
}

// Add event listeners for user gesture
document.addEventListener('click', handleUserGesture)
document.addEventListener('keydown', handleUserGesture)
document.addEventListener('touchstart', handleUserGesture)

// Browser-specific app wrapper
const BrowserApp = () => {
  return (
    <BrowserServiceWorkerProvider>
      <BrowserAudioProvider audioContext={audioContext}>
        <App />
      </BrowserAudioProvider>
    </BrowserServiceWorkerProvider>
  )
}

// Mount the application
const root = ReactDOM.createRoot(document.getElementById('root')!)

// Development mode with React StrictMode
if (import.meta.env.DEV) {
  root.render(
    <React.StrictMode>
      <BrowserApp />
    </React.StrictMode>
  )
} else {
  // Production mode without StrictMode for better performance
  root.render(<BrowserApp />)
}

// Browser-specific feature detection and polyfills
if (!window.ORPHEUS_BROWSER_ENV) {
  window.ORPHEUS_BROWSER_ENV = {
    compatibility: browserAPIs,
    features: {
      electronIPC: false,
      nativeFileSystem: !!window.showOpenFilePicker,
      webMIDI: !!navigator.requestMIDIAccess,
      audioWorklet: !!(audioContext?.audioWorklet)
    },
    platform: {
      isBrowser: true,
      isElectron: false,
      userAgent: navigator.userAgent,
      vendor: navigator.vendor
    }
  }
}

// Expose global methods for browser debugging
if (import.meta.env.DEV) {
  (window as any).orpheus = {
    audioContext,
    browserAPIs,
    restart: () => window.location.reload(),
    debug: {
      audioContext: () => audioContext,
      performance: () => performance.getEntriesByType('navigation')[0]
    }
  }
}
