"""
Orpheus Engine Web Demo Magic Commands for Jupyter Notebooks
Provides intera    @line_magic 
    def orpheus_platform(self, line):
        """Display platform capabilities"""
        if not self.demo_initialized:
            return HTML("<p style='color: red;'>Run %orpheus_init first</p>")
        
        capabilities = self._get_platform_capabilities()
        caps_json = json.dumps(capabilities, indent=2)
        
        return HTML(f"""
        <div id="platform-info" style="margin: 20px 0;">
            <h3>Orpheus Engine Platform Capabilities</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
                <div>
                    <h4 style="color: #4ecdc4; margin-bottom: 10px;">Backend Integration</h4>
                    <div id="backend-status"></div>
                    <button onclick="testBackendConnection()" 
                            style="background: #4ecdc4; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-top: 10px;">
                        Test Backend Connection
                    </button>
                </div>
                <div>
                    <h4 style="color: #4ecdc4; margin-bottom: 10px;">Platform Capabilities</h4>
                    <div id="capabilities-output"></div>
                    <button onclick="testPlatformCapabilities()" 
                            style="background: #45b7aa; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-top: 10px;">
                        Refresh Capabilities
                    </button>
                </div>
            </div>
            <details style="margin-top: 20px;">
                <summary style="cursor: pointer; color: #888;">Raw Capabilities Data</summary>
                <pre style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 4px; overflow: auto; font-size: 0.8rem;">{caps_json}</pre>
            </details>
        </div>
        <script>
            window.orpheusApiEndpoint = '{self.api_endpoint}';
            window.orpheusCapabilities = {json.dumps(capabilities)};
            window.testPlatformCapabilities();
            window.testBackendConnection();
        </script>
        """)ts and platform capability testing
Integrates with Orpheus Engine PlatformService for real backend capabilities
"""

import json
import os
import requests
from pathlib import Path
from typing import Dict, Any, List, Optional
from IPython.display import HTML, Javascript, display
from IPython.core.magic import Magics, magics_class, line_magic, cell_magic


@magics_class
class OrpheusWebDemo(Magics):
    """IPython magic commands for Orpheus Engine web demo"""
    
    def __init__(self, shell=None):
        super().__init__(shell)
        self.demo_initialized = False
        self.component_registry = {}
        self.api_endpoint = self._detect_api_endpoint()
        self.platform_capabilities = None
        
    def _detect_api_endpoint(self) -> str:
        """Detect the Orpheus Engine API endpoint"""
        # Check environment variables first
        api_endpoint = os.getenv('VITE_API_ENDPOINT') or os.getenv('ORPHEUS_API_ENDPOINT')
        if api_endpoint:
            return api_endpoint
            
        # Default development endpoint
        return 'http://localhost:5001'
    
    def _get_platform_capabilities(self) -> Dict[str, Any]:
        """Get platform capabilities from Orpheus Engine backend"""
        if self.platform_capabilities is not None:
            return self.platform_capabilities
            
        try:
            # Try to get capabilities from the backend API
            response = requests.get(f"{self.api_endpoint}/api/platform/capabilities", timeout=2)
            if response.status_code == 200:
                self.platform_capabilities = response.json()
                return self.platform_capabilities
        except requests.RequestException:
            pass
            
        # Fallback to client-side detection
        self.platform_capabilities = {
            'platform': 'jupyter',
            'canAccessFiles': True,
            'canAnalyzeAudio': True,
            'canExportAudio': True,
            'hasNativeMenus': False,
            'supportsNotifications': False,
            'hasWebAudioSupport': True,
            'hasLocalStorageSupport': True,
            'supportsMIDI': False,
            'isElectron': False,
            'isBrowser': True,
            'isPython': True,
            'environment': 'jupyter'
        }
        return self.platform_capabilities
        
    @line_magic
    def orpheus_init(self, line):
        """Initialize the Orpheus web demo environment"""
        if self.demo_initialized:
            return HTML("<p style='color: orange;'>Orpheus demo already initialized</p>")
            
        # Load the demo scripts and styles
        demo_html = self._generate_demo_html()
        self.demo_initialized = True
        
        return HTML(demo_html)
    
    @line_magic 
    def orpheus_platform(self, line):
        """Display platform capabilities"""
        if not self.demo_initialized:
            return HTML("<p style='color: red;'>Run %orpheus_init first</p>")
            
        return HTML("""
        <div id="platform-info" style="margin: 20px 0;">
            <h3>Platform Capabilities</h3>
            <div id="capabilities-output"></div>
            <button onclick="testPlatformCapabilities()" 
                    style="background: #4ecdc4; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                Test Platform Capabilities
            </button>
        </div>
        <script>
            window.testPlatformCapabilities();
        </script>
        """)
    
    @cell_magic
    def orpheus_component(self, line, cell):
        """Render a specific Orpheus component with custom props"""
        component_name = line.strip()
        
        try:
            props = json.loads(cell) if cell.strip() else {}
        except json.JSONDecodeError:
            return HTML(f"<p style='color: red;'>Invalid JSON in component props</p>")
        
        component_html = self._render_component(component_name, props)
        return HTML(component_html)
    
    @line_magic
    def orpheus_timeline(self, line):
        """Show interactive timeline component"""
        return HTML(self._render_timeline())
    
    @line_magic
    def orpheus_mixer(self, line):
        """Show interactive mixer component"""
        return HTML(self._render_mixer())
    
    @line_magic
    def orpheus_widgets(self, line):
        """Show widget showcase"""
        return HTML(self._render_widgets())
    
    @line_magic
    def orpheus_backend(self, line):
        """Test backend connectivity and services"""
        return HTML(self._test_backend_connectivity())
    
    @line_magic
    def orpheus_audio(self, line):
        """Initialize audio processing demo"""
        return HTML(self._render_audio_demo())
    
    @line_magic
    def orpheus_export(self, line):
        """Export current session state"""
        return self._export_session_state()
    
    @cell_magic
    def orpheus_script(self, line, cell):
        """Execute JavaScript in the Orpheus demo context"""
        script_id = f"orpheus-script-{id(cell)}"
        return HTML(f"""
        <div id="{script_id}-output" style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 4px; margin: 10px 0; font-family: monospace; color: #4ecdc4;"></div>
        <script>
            try {{
                const output = document.getElementById('{script_id}-output');
                const result = (function() {{
                    {cell}
                }})();
                output.textContent = 'Script executed successfully. Result: ' + (result || 'undefined');
            }} catch(e) {{
                document.getElementById('{script_id}-output').innerHTML = '<span style="color: #ff6b6b;">Error: ' + e.message + '</span>';
            }}
        </script>
        """)
    
    def _generate_demo_html(self) -> str:
        """Generate the main demo HTML with embedded React components"""
        return f"""
        <div id="orpheus-demo-root" style="width: 100%; min-height: 400px; background: linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%); border-radius: 12px; padding: 20px; color: white; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="background: linear-gradient(45deg, #ff6b6b, #4ecdc4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin: 0; font-size: 2.5rem;">
                    Orpheus Engine Demo
                </h1>
                <p style="color: #888; margin: 10px 0;">Interactive DAW Components in Jupyter</p>
            </div>
            
            <div id="demo-content"></div>
        </div>
        
        {self._get_demo_scripts()}
        """
    
    def _get_demo_scripts(self) -> str:
        """Generate JavaScript for the demo functionality"""
        return """
        <script>
            // Platform detection and capability testing
            window.OrpheusDemo = {
                platform: 'jupyter',
                capabilities: {},
                
                detectPlatform() {
                    const isJupyter = typeof Jupyter !== 'undefined';
                    const isBrowser = typeof window !== 'undefined';
                    const hasAudioContext = typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined';
                    const hasNotifications = typeof Notification !== 'undefined';
                    const hasLocalStorage = (() => {
                        try {
                            localStorage.setItem('test', 'test');
                            localStorage.removeItem('test');
                            return true;
                        } catch(e) {
                            return false;
                        }
                    })();
                    
                    this.capabilities = {
                        isJupyter,
                        isBrowser,
                        canAnalyzeAudio: hasAudioContext,
                        supportsNotifications: hasNotifications,
                        hasLocalStorage,
                        canAccessFiles: isBrowser && ('showOpenFilePicker' in window || true), // File API fallback
                        canExportAudio: isBrowser,
                        hasNativeMenus: false,
                        supportsMIDI: typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator
                    };
                    
                    return this.capabilities;
                },
                
                renderCapabilities() {
                    const caps = this.detectPlatform();
                    const capsList = Object.entries(caps).map(([key, value]) => 
                        `<div style="display: flex; justify-content: space-between; padding: 8px 12px; background: rgba(${value ? '78, 205, 196' : '255, 107, 107'}, 0.2); margin: 4px 0; border-radius: 6px;">
                            <span style="text-transform: capitalize;">${key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                            <span style="color: ${value ? '#4ecdc4' : '#ff6b6b'}; font-weight: bold;">${value ? '✓' : '✗'}</span>
                         </div>`
                    ).join('');
                    
                    const output = document.getElementById('capabilities-output');
                    if (output) {
                        output.innerHTML = capsList;
                    }
                },
                
                createKnob(containerId, options = {}) {
                    const container = document.getElementById(containerId);
                    if (!container) return;
                    
                    const { min = 0, max = 1, value = 0.5, size = 60, label = 'Knob' } = options;
                    
                    container.innerHTML = `
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
                            <div style="font-size: 0.9rem; color: #ccc;">${label}</div>
                            <div style="position: relative; width: ${size}px; height: ${size}px;">
                                <svg width="${size}" height="${size}" style="transform: rotate(-140deg);">
                                    <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 4}" 
                                            fill="none" stroke="#333" stroke-width="3"/>
                                    <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 4}" 
                                            fill="none" stroke="#4ecdc4" stroke-width="3"
                                            stroke-dasharray="${2 * Math.PI * (size/2 - 4)}"
                                            stroke-dashoffset="${2 * Math.PI * (size/2 - 4) * (1 - (value - min) / (max - min))}"
                                            stroke-linecap="round"/>
                                </svg>
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                                           font-size: 0.8rem; color: white; font-weight: bold;">
                                    ${Math.round((value * 100))}
                                </div>
                            </div>
                            <input type="range" min="${min}" max="${max}" value="${value}" step="0.01"
                                   style="width: ${size}px;" 
                                   oninput="OrpheusDemo.updateKnob('${containerId}', this.value, ${min}, ${max})">
                        </div>
                    `;
                },
                
                updateKnob(containerId, value, min, max) {
                    const container = document.getElementById(containerId);
                    const circle = container.querySelector('circle:last-child');
                    const display = container.querySelector('div:last-child');
                    
                    const percentage = (value - min) / (max - min);
                    const circumference = 2 * Math.PI * (30 - 4); // Assuming 60px diameter
                    
                    circle.style.strokeDashoffset = circumference * (1 - percentage);
                    display.textContent = Math.round(value * 100);
                },
                
                createMeter(containerId, options = {}) {
                    const container = document.getElementById(containerId);
                    if (!container) return;
                    
                    const { height = 100, width = 20, label = 'Level' } = options;
                    
                    container.innerHTML = `
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
                            <div style="font-size: 0.9rem; color: #ccc;">${label}</div>
                            <div style="width: ${width}px; height: ${height}px; background: #333; border-radius: 4px; position: relative; overflow: hidden;">
                                <div id="${containerId}-level" style="position: absolute; bottom: 0; width: 100%; background: linear-gradient(to top, #4ecdc4, #ff6b6b); height: 0%; transition: height 0.1s;"></div>
                            </div>
                        </div>
                    `;
                    
                    // Simulate audio levels
                    setInterval(() => {
                        const level = Math.random() * 80 + 10; // 10-90%
                        const levelBar = document.getElementById(`${containerId}-level`);
                        if (levelBar) {
                            levelBar.style.height = level + '%';
                        }
                    }, 100);
                },
                
                createTimeline(containerId) {
                    const container = document.getElementById(containerId);
                    if (!container) return;
                    
                    container.innerHTML = `
                        <div style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 16px; margin: 10px 0;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                                <h3 style="margin: 0; color: #4ecdc4;">Timeline</h3>
                                <div style="display: flex; gap: 10px; align-items: center;">
                                    <button onclick="OrpheusDemo.togglePlayback()" id="play-btn" 
                                            style="width: 40px; height: 40px; border-radius: 50%; background: #4ecdc4; border: none; color: #1e1e1e; font-size: 1.2rem; cursor: pointer;">
                                        ▶️
                                    </button>
                                    <span id="time-display" style="font-family: monospace; background: rgba(0,0,0,0.5); padding: 6px 12px; border-radius: 4px;">
                                        00:00
                                    </span>
                                </div>
                            </div>
                            
                            <div style="position: relative; height: 120px; background: #2a2a2a; border-radius: 6px; overflow: hidden;">
                                <div id="playhead" style="position: absolute; top: 0; width: 2px; height: 100%; background: #ff6b6b; z-index: 10; left: 0;"></div>
                                
                                <!-- Track 1 -->
                                <div style="height: 40px; border-bottom: 1px solid #444; position: relative; background: linear-gradient(90deg, #4ecdc4 0%, #4ecdc4 30%, transparent 30%);">
                                    <span style="position: absolute; left: 8px; top: 50%; transform: translateY(-50%); font-size: 0.8rem; color: white;">
                                        Kick Drum
                                    </span>
                                </div>
                                
                                <!-- Track 2 -->
                                <div style="height: 40px; border-bottom: 1px solid #444; position: relative; background: linear-gradient(90deg, transparent 0%, transparent 20%, #ff6b6b 20%, #ff6b6b 60%, transparent 60%);">
                                    <span style="position: absolute; left: 8px; top: 50%; transform: translateY(-50%); font-size: 0.8rem; color: white;">
                                        Bass Synth
                                    </span>
                                </div>
                                
                                <!-- Track 3 -->
                                <div style="height: 40px; position: relative; background: linear-gradient(90deg, transparent 0%, transparent 40%, #45b7aa 40%, #45b7aa 80%, transparent 80%);">
                                    <span style="position: absolute; left: 8px; top: 50%; transform: translateY(-50%); font-size: 0.8rem; color: white;">
                                        Lead Vocal
                                    </span>
                                </div>
                            </div>
                        </div>
                    `;
                },
                
                togglePlayback() {
                    const btn = document.getElementById('play-btn');
                    const playhead = document.getElementById('playhead');
                    const timeDisplay = document.getElementById('time-display');
                    
                    if (this.isPlaying) {
                        this.isPlaying = false;
                        btn.innerHTML = '▶️';
                        clearInterval(this.playbackInterval);
                    } else {
                        this.isPlaying = true;
                        btn.innerHTML = '⏸️';
                        
                        let time = 0;
                        this.playbackInterval = setInterval(() => {
                            time += 0.1;
                            const minutes = Math.floor(time / 60);
                            const seconds = (time % 60).toFixed(1).padStart(4, '0');
                            timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds}`;
                            
                            playhead.style.left = (time / 16 * 100) + '%'; // 16 second loop
                            
                            if (time >= 16) time = 0; // Loop
                        }, 100);
                    }
                },
                
                isPlaying: false,
                playbackInterval: null
            };
            
            // Initialize platform detection
            window.testPlatformCapabilities = () => OrpheusDemo.renderCapabilities();
        </script>
        """
    
    def _render_component(self, component_name: str, props: Dict[str, Any]) -> str:
        """Render a specific component with props"""
        component_id = f"orpheus-{component_name.lower()}-{id(props)}"
        
        if component_name.lower() == 'knob':
            return f"""
            <div id="{component_id}"></div>
            <script>
                OrpheusDemo.createKnob('{component_id}', {json.dumps(props)});
            </script>
            """
        elif component_name.lower() == 'meter':
            return f"""
            <div id="{component_id}"></div>
            <script>
                OrpheusDemo.createMeter('{component_id}', {json.dumps(props)});
            </script>
            """
        else:
            return f"<p style='color: orange;'>Component '{component_name}' not yet implemented</p>"
    
    def _render_timeline(self) -> str:
        """Render the timeline component"""
        timeline_id = f"timeline-{id(self)}"
        return f"""
        <div id="{timeline_id}"></div>
        <script>
            OrpheusDemo.createTimeline('{timeline_id}');
        </script>
        """
    
    def _render_mixer(self) -> str:
        """Render the mixer component"""
        return """
        <div style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 16px; margin: 10px 0;">
            <h3 style="margin: 0 0 16px 0; color: #4ecdc4;">Mixer</h3>
            <div style="display: flex; gap: 16px; justify-content: center;">
                <div id="mixer-knob-1"></div>
                <div id="mixer-knob-2"></div>
                <div id="mixer-knob-3"></div>
                <div id="mixer-meter-1"></div>
            </div>
        </div>
        <script>
            OrpheusDemo.createKnob('mixer-knob-1', {label: 'Track 1', value: 0.8});
            OrpheusDemo.createKnob('mixer-knob-2', {label: 'Track 2', value: 0.7});
            OrpheusDemo.createKnob('mixer-knob-3', {label: 'Master', value: 0.9});
            OrpheusDemo.createMeter('mixer-meter-1', {label: 'Output'});
        </script>
        """
    
    def _render_widgets(self) -> str:
        """Render the widgets showcase"""
        return """
        <div style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 16px; margin: 10px 0;">
            <h3 style="margin: 0 0 16px 0; color: #4ecdc4;">Widget Showcase</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 20px; place-items: center;">
                <div id="widget-knob-1"></div>
                <div id="widget-knob-2"></div>
                <div id="widget-meter-1"></div>
                <div id="widget-meter-2"></div>
            </div>
        </div>
        <script>
            OrpheusDemo.createKnob('widget-knob-1', {label: 'Volume', value: 0.75, size: 80});
            OrpheusDemo.createKnob('widget-knob-2', {label: 'Filter', value: 0.3, size: 80});
            OrpheusDemo.createMeter('widget-meter-1', {label: 'L', height: 120});
            OrpheusDemo.createMeter('widget-meter-2', {label: 'R', height: 120});
        </script>
        """


# Register the magic commands
def load_ipython_extension(ipython):
    """Load the Orpheus web demo extension"""
    magics = OrpheusWebDemo(ipython)
    ipython.register_magic_function(magics.orpheus_init, 'line', 'orpheus_init')
    ipython.register_magic_function(magics.orpheus_platform, 'line', 'orpheus_platform')
    ipython.register_magic_function(magics.orpheus_timeline, 'line', 'orpheus_timeline')
    ipython.register_magic_function(magics.orpheus_mixer, 'line', 'orpheus_mixer')
    ipython.register_magic_function(magics.orpheus_widgets, 'line', 'orpheus_widgets')
    ipython.register_magic_function(magics.orpheus_component, 'cell', 'orpheus_component')


# Standalone functions for direct use
def create_orpheus_demo():
    """Create a standalone Orpheus demo widget"""
    demo = OrpheusWebDemo()
    return demo._generate_demo_html()


def test_platform_capabilities():
    """Test and display platform capabilities"""
    from IPython.display import HTML
    
    return HTML("""
    <div style="background: #1e1e1e; color: white; padding: 20px; border-radius: 8px; font-family: monospace;">
        <h3 style="color: #4ecdc4; margin-top: 0;">Platform Capability Test</h3>
        <div id="capability-test-results"></div>
        <script>
            const capabilities = {
                'Audio Context': typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined',
                'File API': typeof File !== 'undefined',
                'Local Storage': (() => {
                    try { localStorage.setItem('test', 'test'); localStorage.removeItem('test'); return true; } 
                    catch(e) { return false; }
                })(),
                'Notifications': typeof Notification !== 'undefined',
                'MIDI Access': typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator,
                'Web Workers': typeof Worker !== 'undefined',
                'Canvas': typeof HTMLCanvasElement !== 'undefined',
                'WebGL': (() => {
                    try {
                        const canvas = document.createElement('canvas');
                        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
                    } catch(e) { return false; }
                })()
            };
            
            const results = Object.entries(capabilities).map(([name, supported]) => 
                `<div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #333;">
                    <span>${name}</span>
                    <span style="color: ${supported ? '#4ecdc4' : '#ff6b6b'}; font-weight: bold;">
                        ${supported ? '✓ Supported' : '✗ Not Available'}
                    </span>
                 </div>`
            ).join('');
            
            document.getElementById('capability-test-results').innerHTML = results;
        </script>
    </div>
    """)
