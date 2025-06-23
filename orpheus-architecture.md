# Orpheus Engine Workstation Architecture

```mermaid
flowchart TD
    subgraph Electron["Electron App"]
        ElectronMain["Main Process"]
        ElectronPreload["Preload Script"]
        MenuBuilder["Menu Builder"]
        ContextMenu["Context Menu"]
        AudioAnalysis["Audio Analysis\n(FFmpeg integration)"]
        
        ElectronMain --> MenuBuilder
        ElectronMain --> ContextMenu
        ElectronMain --> AudioAnalysis
        ElectronMain --> ElectronPreload
    end
    
    subgraph ReactApp["React Application"]
        Main["Main Component"]
        
        subgraph Contexts["State Management"]
            WorkstationCtx["WorkstationContext\n(Main State Manager)"]
            MixerCtx["MixerContext\n(Audio Routing & FX)"]
            PreferencesCtx["PreferencesContext"]
            ClipboardCtx["ClipboardContext"]
            AICtx["AIContext"]
            AnalysisCtx["AnalysisContext"]
        end
        
        subgraph DAWComponents["DAW Components"]
            Workstation["Workstation Screen"]
            
            subgraph Interface["Main Interface"]
                Header["Header Controls"]
                Timeline["Timeline & Ruler"]
                Tracks["Track Management"]
                Mixer["Audio Mixer"]
                SidePanel["Side Panel"]
                ZoomControls["Zoom Controls"]
            end
            
            subgraph TrackComponents["Track Components"]
                TrackComp["Track Component"]
                ClipComp["Clip Component"]
                AudioClipComp["Audio Clip"]
                WaveformComp["Waveform Display"]
                VolumeSlider["Volume Control"]
                AutomationLane["Automation Lane"]
                AutomationNode["Automation Node"]
            end
            
            subgraph MixerComponents["Mixer Components"]
                MixerUI["Mixer Interface"]
                FXChain["Effects Chain"]
                FXComponent["FX Component"]
                TrackControls["Track Controls"]
            end
        end
        
        subgraph AudioProcessing["Audio Processing"]
            AudioEngine["Web Audio API Engine"]
            AudioAnalyzer["Audio Analysis"]
            AudioEffects["Audio Effects"]
            Metronome["Metronome"]
        end
    end
    
    %% Connections
    ElectronPreload <--> WorkstationCtx
    Main --> Contexts
    Contexts --> DAWComponents
    WorkstationCtx --> AudioProcessing
    MixerCtx --> AudioProcessing
    Interface --> TrackComponents
    Interface --> MixerComponents
    AudioProcessing --> MixerComponents
    AudioAnalysis <--> AnalysisCtx
    
    %% Data Flow
    AudioClipComp --> WaveformComp
    TrackComp --> ClipComp
    TrackComp --> AutomationLane
    AutomationLane --> AutomationNode
    
    %% User actions
    User((User)) --> Interface
    User --> TrackComponents
    User --> MixerComponents
    AudioOutput(("Audio Output")) <-- "Audio Signal" --- AudioProcessing
    AudioInput(("Audio Input")) -- "Recording" --> AudioProcessing
```

## Key Functionality

1. **Audio Production**
   - Multi-track audio recording and playback
   - Audio clip management and editing
   - Waveform visualization and manipulation
   - Automation for volume, pan, and effects

2. **Mixing Capabilities**
   - Professional mixer interface
   - Audio effects chain
   - Volume, pan, mute, and solo controls
   - Master track output

3. **Timeline Management**
   - Timeline ruler with measure markings
   - Track-based arrangement view
   - Clip positioning and editing
   - Zoom and navigation controls

4. **Audio Analysis**
   - Waveform visualization
   - Frequency and loudness analysis
   - Beat/tempo detection
   - Audio metadata handling

5. **Desktop Integration**
   - Native desktop app experience via Electron
   - File system access for audio files
   - Menu and context menu functionality
   - Audio device integration

6. **Additional Features**
   - AI-assisted workflows
   - Project management
   - Metronome and timing tools
   - Automation capabilities for parameters
