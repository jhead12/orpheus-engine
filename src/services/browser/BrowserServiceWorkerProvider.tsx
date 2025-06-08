import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface ServiceWorkerContextType {
  isSupported: boolean
  isRegistered: boolean
  isUpdateAvailable: boolean
  registration: ServiceWorkerRegistration | null
  updateApp: () => void
  registerServiceWorker: () => Promise<void>
}

const ServiceWorkerContext = createContext<ServiceWorkerContextType | null>(null)

interface BrowserServiceWorkerProviderProps {
  children: ReactNode
}

export const BrowserServiceWorkerProvider: React.FC<BrowserServiceWorkerProviderProps> = ({ children }) => {
  const [isSupported, setIsSupported] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    setIsSupported('serviceWorker' in navigator)
  }, [])

  const registerServiceWorker = async (): Promise<void> => {
    if (!isSupported) {
      console.log('Service Workers not supported')
      return
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      })

      setRegistration(registration)
      setIsRegistered(true)

      console.log('🔧 Service Worker registered:', registration)

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setIsUpdateAvailable(true)
              console.log('🔄 App update available')
            }
          })
        }
      })

      // Handle controlled by service worker
      if (registration.waiting) {
        setIsUpdateAvailable(true)
      }

    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  }

  const updateApp = (): void => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }

  // Auto-register service worker in production
  useEffect(() => {
    if (isSupported && import.meta.env.PROD) {
      registerServiceWorker()
    }
  }, [isSupported])

  const contextValue: ServiceWorkerContextType = {
    isSupported,
    isRegistered,
    isUpdateAvailable,
    registration,
    updateApp,
    registerServiceWorker
  }

  return (
    <ServiceWorkerContext.Provider value={contextValue}>
      {children}
    </ServiceWorkerContext.Provider>
  )
}

export const useServiceWorker = (): ServiceWorkerContextType => {
  const context = useContext(ServiceWorkerContext)
  if (!context) {
    throw new Error('useServiceWorker must be used within a BrowserServiceWorkerProvider')
  }
  return context
}
