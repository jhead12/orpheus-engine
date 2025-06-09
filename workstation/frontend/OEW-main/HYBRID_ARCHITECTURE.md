# Orpheus Engine Hybrid Architecture Guide

## Overview
This document outlines the approach for building a hybrid web component architecture that works seamlessly in both Electron desktop and web browser environments, with Python backend integration.

## Current State Analysis

### Project Structure
- **Frontend**: React/TypeScript with Vite build system
- **Desktop**: Electron wrapper for native desktop functionality
- **Browser**: Pure web deployment with Web Audio API
- **Backend**: Python services for audio processing and AI features

### Existing Components (React-based)
Located in `/src/screens/workstation/components/`:
- AudioClipComponent
- AutomationLaneComponent
- AutomationLaneTrack
- AutomationNodeComponent
- ClipComponent
- FXComponent
- Header
- Lane
- Metronome
- Mixer
- RegionComponent
- TimelineRulerGrid
- TrackComponent
- TrackVolumeSlider
- Waveform
- ZoomControls
- AudioAnalysisPanel

## Hybrid Architecture Design

### 1. Web Component Base Classes

Create a foundation for hybrid components that work in both environments:

```typescript
// Base class for all Orpheus components
abstract class OrpheusComponentBase extends HTMLElement {
  protected isElectron: boolean
  protected pythonBridge: PythonBridge | null
  protected audioContext: AudioContext | null
  
  constructor() {
    super()
    this.isElectron = this.detectElectron()
    this.pythonBridge = this.initializePythonBridge()
  }
  
  abstract render(): void
  abstract handleElectronEvents(): void
  abstract handleBrowserEvents(): void
}
```

### 2. Platform Detection Layer

```typescript
// Platform detection and capability management
class PlatformDetector {
  static isElectron(): boolean
  static isBrowser(): boolean
  static getCapabilities(): PlatformCapabilities
  static getBridge(): ElectronBridge | WebBridge
}
```

### 3. Communication Bridges

#### Electron Bridge
```typescript
class ElectronBridge {
  // Direct IPC communication with main process
  sendToMain(channel: string, data: any): void
  onFromMain(channel: string, callback: Function): void
  
  // Python backend communication through Electron
  callPython(method: string, params: any): Promise<any>
  
  // File system access
  openFile(filters?: FileFilter[]): Promise<string[]>
  saveFile(data: any, path?: string): Promise<string>
}
```

#### Web Bridge
```typescript
class WebBridge {
  // HTTP/WebSocket communication with Python backend
  callPython(method: string, params: any): Promise<any>
  
  // File API access
  openFile(accept?: string): Promise<File[]>
  saveFile(data: any, filename: string): void
  
  // IndexedDB for local storage
  storeData(key: string, data: any): Promise<void>
  getData(key: string): Promise<any>
}
```

### 4. Component Migration Strategy

Transform each React component into a hybrid web component:

#### Phase 1: Core Infrastructure
1. **Create base classes** (`OrpheusComponentBase`, `PlatformDetector`)
2. **Implement communication bridges** (`ElectronBridge`, `WebBridge`)
3. **Set up component registry** for dynamic loading
4. **Create Python integration layer**

#### Phase 2: Essential Components
Convert high-priority components:
1. **Header** - Main navigation and controls
2. **Mixer** - Audio mixing interface
3. **TrackComponent** - Individual track management
4. **Waveform** - Audio visualization
5. **Metronome** - Timing and tempo

#### Phase 3: Advanced Components
Convert specialized components:
1. **FXComponent** - Audio effects
2. **AutomationLaneComponent** - Parameter automation
3. **AudioAnalysisPanel** - AI-powered analysis
4. **ZoomControls** - Timeline navigation
5. **AudioClipComponent** - Audio clip management

#### Phase 4: Integration Components
Complete the ecosystem:
1. **TimelineRulerGrid** - Timeline visualization
2. **RegionComponent** - Selection and editing
3. **AutomationNodeComponent** - Automation points
4. **Lane** - Track lanes
5. **TrackVolumeSlider** - Volume controls

## Implementation Guidelines

### Component Structure Template

```typescript
// Example: Hybrid Mixer Component
class OrpheusMixer extends OrpheusComponentBase {
  private mixerState: MixerState
  private audioNodes: AudioNode[]
  
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.setupAudioGraph()
  }
  
  connectedCallback() {
    this.render()
    this.setupEventListeners()
    this.isElectron ? this.handleElectronEvents() : this.handleBrowserEvents()
  }
  
  render() {
    this.shadowRoot!.innerHTML = `
      <style>${this.getStyles()}</style>
      <div class="mixer-container">
        ${this.renderChannels()}
        ${this.renderMasterSection()}
      </div>
    `
  }
  
  handleElectronEvents() {
    // Electron-specific functionality
    this.bridge.onFromMain('audio-device-changed', this.handleDeviceChange)
  }
  
  handleBrowserEvents() {
    // Browser-specific functionality
    navigator.mediaDevices.addEventListener('devicechange', this.handleDeviceChange)
  }
  
  // Python backend integration
  async analyzeMix(): Promise<MixAnalysis> {
    return this.pythonBridge?.call('analyze_mix', {
      tracks: this.mixerState.tracks,
      settings: this.mixerState.settings
    })
  }
}

customElements.define('orpheus-mixer', OrpheusMixer)
```

### Python Backend Integration

#### Web Component → Python Communication
```python
# Python backend service
class OrpheusAudioService:
    def analyze_mix(self, tracks, settings):
        """AI-powered mix analysis"""
        return {
            'balance_score': self.calculate_balance(tracks),
            'frequency_analysis': self.analyze_frequency_spectrum(tracks),
            'suggestions': self.generate_mix_suggestions(tracks, settings)
        }
    
    def process_audio_effect(self, audio_data, effect_type, parameters):
        """Real-time audio processing"""
        return self.apply_effect(audio_data, effect_type, parameters)
```

#### Component Registration System
```typescript
class ComponentRegistry {
  private components: Map<string, CustomElementConstructor> = new Map()
  
  register(name: string, component: CustomElementConstructor) {
    this.components.set(name, component)
    customElements.define(name, component)
  }
  
  async loadFromPython(componentName: string): Promise<void> {
    const config = await this.pythonBridge.call('get_component_config', componentName)
    // Dynamically create and register component based on Python configuration
  }
}
```

## Build System Configuration

### Vite Configuration for Hybrid Mode
```typescript
// vite.hybrid.config.ts
export default defineConfig({
  build: {
    lib: {
      entry: 'src/components/index.ts',
      formats: ['es', 'umd'],
      name: 'OrpheusComponents'
    },
    rollupOptions: {
      external: ['react', 'react-dom'], // Exclude React for pure web components
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  },
  define: {
    __ELECTRON__: process.env.ELECTRON_MODE === 'true',
    __BROWSER__: process.env.BROWSER_MODE === 'true'
  }
})
```

### Component Bundle Strategy
1. **Core Bundle**: Essential components for both platforms
2. **Electron Bundle**: Desktop-specific enhancements
3. **Browser Bundle**: Web-optimized components
4. **Python Bundle**: Backend integration modules

## Testing Strategy

### Cross-Platform Testing
```typescript
// Test suite for hybrid components
describe('OrpheusMixer', () => {
  beforeEach(() => {
    // Mock both Electron and browser environments
    mockElectronEnvironment()
    mockBrowserEnvironment()
  })
  
  it('should work in Electron mode', async () => {
    setPlatform('electron')
    const mixer = new OrpheusMixer()
    expect(mixer.isElectron).toBe(true)
    // Test Electron-specific functionality
  })
  
  it('should work in browser mode', async () => {
    setPlatform('browser')
    const mixer = new OrpheusMixer()
    expect(mixer.isElectron).toBe(false)
    // Test browser-specific functionality
  })
})
```

## Migration Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Create base classes and interfaces
- [ ] Implement platform detection
- [ ] Set up communication bridges
- [ ] Create component registry system

### Phase 2: Core Components (Week 3-4)
- [ ] Convert Header component
- [ ] Convert Mixer component
- [ ] Convert TrackComponent
- [ ] Implement Python integration layer

### Phase 3: Audio Components (Week 5-6)
- [ ] Convert Waveform component
- [ ] Convert Metronome component
- [ ] Convert FXComponent
- [ ] Add real-time audio processing

### Phase 4: Advanced Features (Week 7-8)
- [ ] Convert automation components
- [ ] Add AI-powered features
- [ ] Implement advanced audio analysis
- [ ] Performance optimization

### Phase 5: Integration & Testing (Week 9-10)
- [ ] Complete component ecosystem
- [ ] Cross-platform testing
- [ ] Performance benchmarking
- [ ] Documentation and examples

## Development Commands

```bash
# Development
npm run dev:hybrid          # Start hybrid development mode
npm run dev:electron        # Electron-specific development
npm run dev:browser         # Browser-specific development

# Building
npm run build:hybrid        # Build hybrid components
npm run build:electron      # Build Electron version
npm run build:browser       # Build browser version

# Testing
npm run test:hybrid         # Test all platforms
npm run test:electron       # Test Electron compatibility
npm run test:browser        # Test browser compatibility
```

## Key Benefits

1. **Universal Compatibility**: Same codebase works in Electron and browser
2. **Python Integration**: Seamless backend communication for AI features
3. **Performance**: Web components are lightweight and fast
4. **Modularity**: Each component is self-contained and reusable
5. **Future-Proof**: Standards-based approach ensures longevity
6. **Incremental Migration**: Can migrate components one by one

## AI Agent Continuation Points

When an AI agent continues this architecture:

1. **Start with** creating the base classes in `/src/components/hybrid/`
2. **Implement** platform detection and bridges
3. **Convert** one component at a time, starting with Header
4. **Test** each component in both environments before proceeding
5. **Document** any platform-specific gotchas or limitations
6. **Optimize** for performance after basic functionality works

## Files to Create/Modify

### New Files Needed:
- `/src/components/hybrid/OrpheusComponentBase.ts`
- `/src/components/hybrid/PlatformDetector.ts`
- `/src/components/hybrid/bridges/ElectronBridge.ts`
- `/src/components/hybrid/bridges/WebBridge.ts`
- `/src/components/hybrid/registry/ComponentRegistry.ts`
- `/vite.hybrid.config.ts`

### Existing Files to Modify:
- `/package.json` - Add hybrid build scripts
- `/src/main.tsx` - Add component registry initialization
- `/src/main.browser.tsx` - Add browser-specific component loading

This architecture provides a clear path forward for creating a truly hybrid DAW that leverages the best of both desktop and web technologies while maintaining seamless Python backend integration.
