# Orpheus Engine Hybrid Architecture Guide

## Overview
This document outlines the approach for building a hybrid web component architecture that works seamlessly in both Electron desktop and web browser environments, with Python backend integration.

## Current State Analysis

### Project Structure
- **Frontend**: React/TypeScript with Vite build system located in `/workstation/frontend/`
- **OEW-main**: Advanced React components in `/workstation/frontend/OEW-main/`
- **Desktop**: Electron wrapper for native desktop functionality
- **Browser**: Pure web deployment with Web Audio API
- **Backend**: Python services in `/workstation/backend/` for audio processing and monitoring

### Existing Components (React-based)

#### Main Frontend Components (`/workstation/frontend/src/`)
- **Workstation** - Main workstation container
- **PaneResize** - Resizable panel system
- **PluginMarketplace** - Plugin marketplace interface
- **DynamicComponent** - Dynamic component loading
- **Placeholders** - Header, Mixer placeholder components

#### OEW-main Advanced Components (`/workstation/frontend/OEW-main/src/screens/workstation/components/`)
- **ClipComponent** - Advanced audio clip management
- **TrackComponent** - Individual track management with automation
- **Lane** - Track lanes with drag/drop functionality
- **Header** - Main navigation and transport controls
- **FXComponent** - Audio effects processing
- **TimelineRulerGrid** - Timeline visualization
- **AutomationLaneTrack** - Parameter automation
- **Waveform** - Audio visualization (referenced)
- **ZoomControls** - Timeline navigation
- **AudioAnalysisPanel** - AI-powered analysis

#### Widget Components (`/workstation/frontend/OEW-main/src/components/widgets/`)
- **Tooltip** - Advanced tooltip system
- **PaneResize** - Enhanced resizable panels

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
  static isElectron(): boolean {
    return typeof window !== 'undefined' && window.electronAPI !== undefined
  }
  
  static isBrowser(): boolean {
    return !this.isElectron()
  }
  
  static getCapabilities(): PlatformCapabilities
  static getBridge(): ElectronBridge | WebBridge
}
```

### 3. Communication Bridges

#### Electron Bridge
```typescript
class ElectronBridge {
  // Direct IPC communication with main process
  sendToMain(channel: string, data: any): void {
    window.electronAPI?.send(channel, data)
  }
  
  onFromMain(channel: string, callback: Function): void {
    window.electronAPI?.on(channel, callback)
  }
  
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
  async callPython(method: string, params: any): Promise<any> {
    const response = await fetch('/api/' + method, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    })
    return response.json()
  }
  
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

#### Phase 2: Essential Components (from main frontend)
Convert basic components first:
1. **Header** - Main navigation placeholder → full transport controls
2. **Workstation** - Main container component
3. **PaneResize** - Resizable panel system
4. **DynamicComponent** - Component loading system
5. **PluginMarketplace** - Plugin interface

#### Phase 3: Advanced Components (from OEW-main)
Convert specialized OEW-main components:
1. **ClipComponent** - Advanced audio clip management
2. **TrackComponent** - Individual track management
3. **Lane** - Track lanes with automation
4. **FXComponent** - Audio effects
5. **TimelineRulerGrid** - Timeline visualization

#### Phase 4: Widget System (from OEW-main widgets)
Complete the widget ecosystem:
1. **Tooltip** - Advanced tooltip system
2. **Enhanced PaneResize** - Advanced resizable panels
3. **AutomationLaneTrack** - Parameter automation
4. **ZoomControls** - Timeline navigation
5. **AudioAnalysisPanel** - AI-powered analysis

## Implementation Guidelines

### Component Structure Template

```typescript
// Example: Hybrid Clip Component (based on existing ClipComponent)
class OrpheusClip extends OrpheusComponentBase {
  private clipState: ClipState
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
      <div class="clip-container">
        ${this.renderClipContent()}
        ${this.renderAutomationLanes()}
      </div>
    `
  }
  
  handleElectronEvents() {
    // Electron-specific functionality
    this.bridge.onFromMain('clip-updated', this.handleClipUpdate)
  }
  
  handleBrowserEvents() {
    // Browser-specific functionality
    window.addEventListener('clip-updated', this.handleClipUpdate)
  }
  
  // Python backend integration
  async analyzeClip(): Promise<ClipAnalysis> {
    return this.pythonBridge?.call('analyze_clip', {
      clipData: this.clipState,
      settings: this.getAnalysisSettings()
    })
  }
}

customElements.define('orpheus-clip', OrpheusClip)
```

### Python Backend Integration

#### Web Component → Python Communication
```python
# Python backend service (workstation/backend/)
class OrpheusAudioService:
    def analyze_clip(self, clip_data, settings):
        """AI-powered clip analysis"""
        return {
            'tempo': self.detect_tempo(clip_data),
            'key': self.detect_key(clip_data),
            'audio_features': self.extract_features(clip_data),
            'suggestions': self.generate_suggestions(clip_data, settings)
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
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
  ],
  base: "./",
  root: "./workstation/frontend",
  build: {
    lib: {
      entry: 'src/components/hybrid/index.ts',
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
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "./workstation/frontend/src") },
      { find: "@orpheus/utils", replacement: path.resolve(__dirname, "./workstation/frontend/src/services/utils") },
      { find: "@orpheus/components", replacement: path.resolve(__dirname, "./workstation/frontend/src/components") },
      { find: "@orpheus/hybrid", replacement: path.resolve(__dirname, "./workstation/frontend/src/components/hybrid") },
      { find: "@oew-main/components", replacement: path.resolve(__dirname, "./workstation/frontend/OEW-main/src/components") },
      { find: "@oew-main/widgets", replacement: path.resolve(__dirname, "./workstation/frontend/OEW-main/src/components/widgets") },
      { find: "@oew-main/workstation", replacement: path.resolve(__dirname, "./workstation/frontend/OEW-main/src/screens/workstation") }
    ]
  },
  define: {
    __ELECTRON__: process.env.ELECTRON_MODE === 'true',
    __BROWSER__: process.env.BROWSER_MODE === 'true'
  },
  server: {
    port: parseInt(process.env.VITE_PORT || '5174'),
    strictPort: false,
    proxy: {
      '/api': {
        target: process.env.API_URL || 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

### Component Bundle Strategy
1. **Core Bundle**: Essential components from `/workstation/frontend/src/components/`
2. **Advanced Bundle**: OEW-main components from `/workstation/frontend/OEW-main/src/`
3. **Electron Bundle**: Desktop-specific enhancements
4. **Browser Bundle**: Web-optimized components
5. **Python Bundle**: Backend integration modules from `/workstation/backend/`

## Testing Strategy

### Cross-Platform Testing (using existing Vitest setup)
```typescript
// Test suite for hybrid components
describe('OrpheusClip', () => {
  beforeEach(() => {
    // Mock both Electron and browser environments
    mockElectronEnvironment()
    mockBrowserEnvironment()
  })
  
  it('should work in Electron mode', async () => {
    setPlatform('electron')
    const clip = new OrpheusClip()
    expect(clip.isElectron).toBe(true)
    // Test Electron-specific functionality
  })
  
  it('should work in browser mode', async () => {
    setPlatform('browser')
    const clip = new OrpheusClip()
    expect(clip.isElectron).toBe(false)
    // Test browser-specific functionality
  })
})
```

## Migration Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Create base classes in `/workstation/frontend/src/components/hybrid/`
- [ ] Implement platform detection
- [ ] Set up communication bridges
- [ ] Create component registry system

### Phase 2: Core Components (Week 3-4)
- [ ] Convert Workstation container component
- [ ] Convert PaneResize component (merge main + OEW-main versions)
- [ ] Convert Header component (upgrade placeholder to full)
- [ ] Implement Python integration layer

### Phase 3: Advanced Components (Week 5-6)
- [ ] Convert ClipComponent from OEW-main
- [ ] Convert TrackComponent from OEW-main
- [ ] Convert Lane component
- [ ] Add real-time audio processing

### Phase 4: Widget System (Week 7-8)
- [ ] Convert Tooltip widget
- [ ] Convert FXComponent
- [ ] Convert TimelineRulerGrid
- [ ] Add AI-powered features

### Phase 5: Integration & Testing (Week 9-10)
- [ ] Complete component ecosystem
- [ ] Cross-platform testing with existing Vitest setup
- [ ] Performance benchmarking
- [ ] Documentation and examples

## Development Commands (updated for current structure)

```bash
# Development
npm run dev:hybrid          # Start hybrid development mode
npm run dev:vite           # Current Vite development
npm run dev:local          # Local development on port 3000

# Building
npm run build:hybrid        # Build hybrid components
npm run build              # Current build process
npm run preview            # Preview built application

# Testing
npm run test:hybrid         # Test all platforms
npm run test               # Current test suite
npm run test:visual        # Visual regression tests
npm run test:ui            # Test UI with Vitest UI
```

## Key Benefits

1. **Universal Compatibility**: Same codebase works in Electron and browser
2. **Python Integration**: Seamless backend communication via existing Flask API
3. **Performance**: Web components are lightweight and fast
4. **Modularity**: Each component is self-contained and reusable
5. **Future-Proof**: Standards-based approach ensures longevity
6. **Incremental Migration**: Can migrate components one by one
7. **Existing Asset Leverage**: Reuse advanced OEW-main components

## AI Agent Continuation Points

When an AI agent continues this architecture:

1. **Start with** creating the base classes in `/workstation/frontend/src/components/hybrid/`
2. **Leverage existing** OEW-main components as reference implementations
3. **Implement** platform detection and bridges
4. **Convert** one component at a time, starting with simpler ones
5. **Test** each component in both environments before proceeding
6. **Document** any platform-specific gotchas or limitations
7. **Optimize** for performance after basic functionality works

## Files to Create/Modify

### New Files Needed:
- `/workstation/frontend/src/components/hybrid/OrpheusComponentBase.ts`
- `/workstation/frontend/src/components/hybrid/PlatformDetector.ts`
- `/workstation/frontend/src/components/hybrid/bridges/ElectronBridge.ts`
- `/workstation/frontend/src/components/hybrid/bridges/WebBridge.ts`
- `/workstation/frontend/src/components/hybrid/registry/ComponentRegistry.ts`
- `/vite.hybrid.config.ts`

### Existing Files to Modify:
- `/package.json` - Add hybrid build scripts (in root)
- `/workstation/frontend/src/main.tsx` - Add component registry initialization
- `/workstation/frontend/src/App.tsx` - Add hybrid component loading
- `/workstation/frontend/vite.config.ts` - Extend for hybrid mode

### Reference Files for Migration:
- `/workstation/frontend/OEW-main/src/screens/workstation/components/ClipComponent.tsx` - Advanced clip management
- `/workstation/frontend/OEW-main/src/screens/workstation/components/TrackComponent.tsx` - Track management
- `/workstation/frontend/OEW-main/src/components/widgets/Tooltip.tsx` - Widget system
- `/workstation/frontend/OEW-main/src/components/PaneResize.tsx` - Enhanced panels

This architecture provides a clear path forward for creating a truly hybrid DAW that leverages the existing codebase structure, advanced OEW-main components, and Python backend integration while maintaining compatibility across desktop and web platforms.
