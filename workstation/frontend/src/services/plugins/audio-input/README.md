# Audio Input Plugin System

The Orpheus Engine Audio Input Plugin System provides a flexible, extensible architecture for supporting various audio input devices and interfaces. This system enables seamless integration of wireless devices (like nRF), professional audio interfaces (USB, MADI), and other specialized audio input hardware.

## Architecture Overview

The plugin system follows a modular architecture where each type of audio input device is implemented as a separate plugin that adheres to a common interface. This allows for:

- **Extensibility**: Easy addition of new audio input devices
- **Flexibility**: Different configuration options per device type
- **Consistency**: Unified API across all audio input types
- **Maintainability**: Isolated plugin implementations

## Core Components

### 1. Plugin Interface (`AudioInputPlugin`)

All audio input plugins implement the `AudioInputPlugin` interface, which provides:

```typescript
interface AudioInputPlugin {
  metadata: AudioInputPluginMetadata;
  initialize(config: AudioInputConfiguration, context: AudioInputPluginContext): Promise<void>;
  discoverDevices(): Promise<AudioInputDevice[]>;
  connect(deviceId: string, config: AudioInputConfiguration): Promise<AudioInputResult>;
  disconnect(): Promise<void>;
  startStream(): Promise<AudioInputResult>;
  stopStream(): Promise<void>;
  canHandle(deviceType: string, protocol?: string): boolean;
  getStreamInfo(): AudioInputStream | null;
  updateConfiguration(config: Partial<AudioInputConfiguration>): Promise<void>;
}
```

### 2. Plugin Manager (`AudioInputPluginManager`)

The plugin manager handles:
- Plugin registration and discovery
- Device enumeration across all plugins
- Connection management
- Stream lifecycle management
- Event broadcasting

### 3. Built-in Plugins

#### nRF Audio Input Plugin (`NRFAudioInputPlugin`)
- **Purpose**: Supports Nordic nRF-based wireless audio devices
- **Protocols**: nRF24L01, nRF52, BLE, proprietary RF
- **Features**: Ultra-low latency, battery monitoring, signal strength tracking
- **Range**: Up to 100m wireless range
- **Channels**: Up to 8 channels
- **Latency**: 5ms minimum

#### USB Audio Interface Plugin (`USBAudioInputPlugin`)
- **Purpose**: Professional and consumer USB audio interfaces
- **Supported Devices**: Focusrite, PreSonus, Behringer, RME, MOTU, etc.
- **Features**: Multi-channel support, phantom power, low-latency monitoring
- **Channels**: Up to 32 channels
- **Latency**: 2ms minimum

#### MADI Audio Plugin (`MADIAudioInputPlugin`)
- **Purpose**: Professional multichannel digital audio (MADI)
- **Protocols**: MADI optical, MADI coaxial, AES67, Dante
- **Features**: 64-channel support, word clock sync, broadcast-grade quality
- **Channels**: Up to 64 channels
- **Latency**: 1ms minimum

## Usage Examples

### Basic Device Discovery and Connection

```typescript
import { audioInputPluginManager } from './services/plugins/audio-input';

// Initialize the plugin system
await audioInputPluginManager.loadPlugins();

// Discover all available audio devices
const devices = await audioInputPluginManager.discoverAllDevices();

// Connect to a device
const config = {
  sampleRate: 48000,
  bitDepth: 24,
  bufferSize: 512,
  channels: [
    { index: 0, name: 'Left', enabled: true, gain: 0 },
    { index: 1, name: 'Right', enabled: true, gain: 0 },
  ],
  monitoring: { enabled: true, volume: 0.5, latency: 10 },
  processing: { gainControl: false, noiseGate: false, compression: false, eq: false },
};

const result = await audioInputPluginManager.connectToDevice(deviceId, config);
if (result.success) {
  console.log('Connected to device:', result.device);
}

// Start audio stream
const streamResult = await audioInputPluginManager.startStream();
if (streamResult.success) {
  console.log('Audio stream started:', streamResult.stream);
}
```

### Using the React Component

```tsx
import AudioInputDeviceSelector from './components/AudioInputDeviceSelector';

function MyAudioApp() {
  const handleDeviceSelected = (device) => {
    console.log('Selected device:', device);
  };

  const handleStreamStarted = (stream) => {
    console.log('Stream started:', stream);
    // Use the stream for recording, analysis, etc.
  };

  return (
    <AudioInputDeviceSelector
      onDeviceSelected={handleDeviceSelected}
      onStreamStarted={handleStreamStarted}
      onStreamStopped={() => console.log('Stream stopped')}
      onError={(error) => console.error('Audio error:', error)}
    />
  );
}
```

## Creating Custom Plugins

To create a custom audio input plugin:

1. **Implement the AudioInputPlugin interface**:

```typescript
import { AudioInputPlugin, AudioInputPluginMetadata } from './types';

export class MyCustomAudioPlugin implements AudioInputPlugin {
  metadata: AudioInputPluginMetadata = {
    id: 'my-custom-audio',
    name: 'My Custom Audio Device',
    version: '1.0.0',
    category: 'specialty',
    supportedDeviceTypes: ['custom-type'],
    supportedProtocols: ['custom-protocol'],
    tags: ['custom', 'specialty'],
    author: 'Your Name',
    description: 'Custom audio input plugin',
  };

  async initialize(config, context) {
    // Initialize your plugin
  }

  async discoverDevices() {
    // Return available devices
    return [];
  }

  // Implement other required methods...
}
```

2. **Register the plugin**:

```typescript
import { audioInputPluginManager } from './AudioInputPluginManager';
import MyCustomAudioPlugin from './MyCustomAudioPlugin';

// Register the plugin
audioInputPluginManager.registry.register(new MyCustomAudioPlugin());
```

## Device Types and Capabilities

### Supported Device Types
- `nrf`: Nordic nRF-based wireless devices
- `usb`: USB audio interfaces
- `madi`: MADI multichannel interfaces
- `bluetooth`: Bluetooth audio devices
- `network`: Network-based audio (AES67, Dante)
- `thunderbolt`: Thunderbolt audio interfaces
- `pci`: PCI/PCIe audio cards

### Audio Capabilities
- **Sample Rates**: 44.1kHz - 192kHz
- **Bit Depths**: 16, 24, 32-bit
- **Channels**: 1-64 channels (device dependent)
- **Latency**: 1-20ms (device/plugin dependent)
- **Features**: Phantom power, direct monitoring, gain control, etc.

## Configuration Options

### AudioInputConfiguration
```typescript
interface AudioInputConfiguration {
  sampleRate: number;           // 44100, 48000, 96000, 192000
  bitDepth: number;            // 16, 24, 32
  bufferSize: number;          // 64, 128, 256, 512, 1024, 2048
  channels: AudioChannelConfiguration[];
  monitoring: {
    enabled: boolean;
    volume: number;            // 0.0 - 1.0
    latency: number;           // milliseconds
  };
  processing: {
    gainControl: boolean;
    noiseGate: boolean;
    compression: boolean;
    eq: boolean;
  };
}
```

## Event System

The plugin manager emits events for monitoring audio input status:

```typescript
// Listen for events
audioInputPluginManager.on('device-connected', (device) => {
  console.log('Device connected:', device.name);
});

audioInputPluginManager.on('stream-started', (stream) => {
  console.log('Stream started with', stream.channels, 'channels');
});

audioInputPluginManager.on('error', (error) => {
  console.error('Audio input error:', error);
});
```

## Integration with Orpheus Engine

The audio input system integrates seamlessly with the Orpheus Engine Editor:

1. **Audio Input Panel**: Available in the Editor UI for device selection and configuration
2. **Real-time Recording**: Direct integration with the timeline for recording audio
3. **Analysis Integration**: Audio streams can be analyzed in real-time
4. **Plugin Architecture**: Extends the existing Orpheus plugin system

## Browser Compatibility

The audio input system uses modern Web APIs:

- **Web Audio API**: For audio processing and routing
- **MediaDevices API**: For device enumeration and access
- **WebUSB**: For USB device communication (nRF dongles)
- **Web Bluetooth**: For BLE nRF devices
- **WebSerial**: For serial nRF connections

### Browser Support
- Chrome 89+
- Firefox 84+
- Safari 14+
- Edge 89+

## Performance Considerations

- **Low Latency**: Optimized for professional audio applications
- **Efficient Processing**: Minimal CPU overhead for audio streaming
- **Memory Management**: Proper cleanup of audio resources
- **Error Handling**: Robust error recovery and fallback mechanisms

## Future Extensions

The plugin architecture supports future enhancements:

- **Network Audio**: Dante, AES67, AVB support
- **Mobile Audio**: iOS/Android audio interface support
- **Cloud Audio**: Remote audio streaming capabilities
- **AI Processing**: Real-time audio enhancement and noise reduction

## Security Considerations

- **Device Permissions**: Proper handling of audio device permissions
- **Data Privacy**: Local audio processing by default
- **Secure Connections**: Encrypted communication for network audio
- **Resource Limits**: Protection against audio resource exhaustion

---

This audio input plugin system provides Orpheus Engine with professional-grade audio input capabilities while maintaining the flexibility to support new and emerging audio technologies.
