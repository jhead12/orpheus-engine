import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface BrowserAudioContextType {
  audioContext: AudioContext | null
  isSupported: boolean
  isInitialized: boolean
  sampleRate: number
  initializeAudio: () => Promise<void>
  createGainNode: () => GainNode | null
  createOscillator: () => OscillatorNode | null
  createAnalyser: () => AnalyserNode | null
}

const BrowserAudioContext = createContext<BrowserAudioContextType | null>(null)

interface BrowserAudioProviderProps {
  children: ReactNode
  audioContext?: AudioContext | null
}

export const BrowserAudioProvider: React.FC<BrowserAudioProviderProps> = ({ 
  children, 
  audioContext: externalAudioContext 
}) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(externalAudioContext || null)
  const [isSupported, setIsSupported] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Check browser support
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    setIsSupported(!!AudioContextClass)
    
    if (externalAudioContext) {
      setAudioContext(externalAudioContext)
      setIsInitialized(externalAudioContext.state === 'running')
    }
  }, [externalAudioContext])

  const initializeAudio = async (): Promise<void> => {
    if (!isSupported) {
      throw new Error('Web Audio API not supported in this browser')
    }

    if (!audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      const newContext = new AudioContextClass({
        sampleRate: 44100,
        latencyHint: 'interactive'
      })
      
      setAudioContext(newContext)
      
      // Resume if suspended (browser autoplay policy)
      if (newContext.state === 'suspended') {
        await newContext.resume()
      }
      
      setIsInitialized(newContext.state === 'running')
      console.log('🎵 Browser Audio Context initialized:', newContext.state)
    } else if (audioContext.state === 'suspended') {
      await audioContext.resume()
      setIsInitialized(audioContext.state === 'running')
    }
  }

  const createGainNode = (): GainNode | null => {
    if (!audioContext || !isInitialized) return null
    return audioContext.createGain()
  }

  const createOscillator = (): OscillatorNode | null => {
    if (!audioContext || !isInitialized) return null
    return audioContext.createOscillator()
  }

  const createAnalyser = (): AnalyserNode | null => {
    if (!audioContext || !isInitialized) return null
    return audioContext.createAnalyser()
  }

  const contextValue: BrowserAudioContextType = {
    audioContext,
    isSupported,
    isInitialized,
    sampleRate: audioContext?.sampleRate || 44100,
    initializeAudio,
    createGainNode,
    createOscillator,
    createAnalyser
  }

  return (
    <BrowserAudioContext.Provider value={contextValue}>
      {children}
    </BrowserAudioContext.Provider>
  )
}

export const useBrowserAudio = (): BrowserAudioContextType => {
  const context = useContext(BrowserAudioContext)
  if (!context) {
    throw new Error('useBrowserAudio must be used within a BrowserAudioProvider')
  }
  return context
}

// Hook for audio initialization with user gesture
export const useAudioInitialization = () => {
  const { initializeAudio, isInitialized, isSupported } = useBrowserAudio()
  const [hasUserGesture, setHasUserGesture] = useState(false)

  useEffect(() => {
    const handleUserGesture = async () => {
      if (!hasUserGesture && isSupported) {
        try {
          await initializeAudio()
          setHasUserGesture(true)
          console.log('🎵 Audio initialized via user gesture')
        } catch (error) {
          console.error('Failed to initialize audio:', error)
        }
      }
    }

    // Add multiple event listeners for different user gestures
    const events = ['click', 'keydown', 'touchstart', 'touchend']
    events.forEach(event => {
      document.addEventListener(event, handleUserGesture, { once: true })
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserGesture)
      })
    }
  }, [initializeAudio, hasUserGesture, isSupported])

  return {
    isInitialized: isInitialized && hasUserGesture,
    requiresUserGesture: !hasUserGesture && isSupported,
    initializeAudio
  }
}
