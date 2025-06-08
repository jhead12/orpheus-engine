// Browser-specific service for handling file operations without Electron
export class BrowserFileService {
  static async openFile(accept: string = '*/*'): Promise<File | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = accept
      input.style.display = 'none'
      
      input.onchange = (e) => {
        const target = e.target as HTMLInputElement
        const file = target.files?.[0] || null
        document.body.removeChild(input)
        resolve(file)
      }
      
      input.oncancel = () => {
        document.body.removeChild(input)
        resolve(null)
      }
      
      document.body.appendChild(input)
      input.click()
    })
  }

  static async openAudioFile(): Promise<File | null> {
    return this.openFile('audio/*,.mp3,.wav,.flac,.ogg,.m4a,.aiff')
  }

  static async openProjectFile(): Promise<File | null> {
    return this.openFile('.json,.orpheus')
  }

  static async saveFile(content: string, filename: string, mimeType: string = 'application/json') {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.style.display = 'none'
    
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    
    URL.revokeObjectURL(url)
  }

  static async readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(reader.error)
      reader.readAsText(file)
    })
  }

  static async readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as ArrayBuffer)
      reader.onerror = () => reject(reader.error)
      reader.readAsArrayBuffer(file)
    })
  }

  static async readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })
  }
}

// Browser storage service using IndexedDB
export class BrowserStorageService {
  private dbName = 'OrpheusEngine'
  private version = 1
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Create object stores
        if (!db.objectStoreNames.contains('projects')) {
          db.createObjectStore('projects', { keyPath: 'id' })
        }
        
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' })
        }
        
        if (!db.objectStoreNames.contains('audioFiles')) {
          db.createObjectStore('audioFiles', { keyPath: 'id' })
        }
      }
    })
  }

  async saveProject(project: any): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['projects'], 'readwrite')
      const store = transaction.objectStore('projects')
      const request = store.put(project)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async loadProject(id: string): Promise<any> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['projects'], 'readonly')
      const store = transaction.objectStore('projects')
      const request = store.get(id)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async getAllProjects(): Promise<any[]> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['projects'], 'readonly')
      const store = transaction.objectStore('projects')
      const request = store.getAll()
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async deleteProject(id: string): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['projects'], 'readwrite')
      const store = transaction.objectStore('projects')
      const request = store.delete(id)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async saveSetting(key: string, value: any): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['settings'], 'readwrite')
      const store = transaction.objectStore('settings')
      const request = store.put({ key, value })
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getSetting(key: string): Promise<any> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['settings'], 'readonly')
      const store = transaction.objectStore('settings')
      const request = store.get(key)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result?.value)
    })
  }
}

// Browser-specific platform utilities
export class BrowserPlatformService {
  static isBrowser(): boolean {
    return typeof window !== 'undefined' && !window.process?.versions?.electron
  }

  static isElectron(): boolean {
    return typeof window !== 'undefined' && !!window.process?.versions?.electron
  }

  static getOS(): string {
    const platform = navigator.platform.toLowerCase()
    if (platform.includes('mac')) return 'mac'
    if (platform.includes('win')) return 'windows'
    if (platform.includes('linux')) return 'linux'
    return 'unknown'
  }

  static getBrowser(): string {
    const userAgent = navigator.userAgent.toLowerCase()
    if (userAgent.includes('chrome')) return 'chrome'
    if (userAgent.includes('firefox')) return 'firefox'
    if (userAgent.includes('safari')) return 'safari'
    if (userAgent.includes('edge')) return 'edge'
    return 'unknown'
  }

  static supportsAudioWorklet(): boolean {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    return !!(AudioContext?.prototype?.audioWorklet)
  }

  static supportsWebMIDI(): boolean {
    return !!navigator.requestMIDIAccess
  }

  static supportsFileSystemAccess(): boolean {
    return !!window.showOpenFilePicker
  }

  static getCapabilities() {
    return {
      platform: this.getOS(),
      browser: this.getBrowser(),
      audioWorklet: this.supportsAudioWorklet(),
      webMIDI: this.supportsWebMIDI(),
      fileSystemAccess: this.supportsFileSystemAccess(),
      webAudio: !!(window.AudioContext || window.webkitAudioContext),
      indexedDB: !!window.indexedDB,
      serviceWorker: 'serviceWorker' in navigator,
      webGL: !!document.createElement('canvas').getContext('webgl')
    }
  }
}
