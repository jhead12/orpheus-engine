/**
 * Processing Monitor for Audio Workstation Components
 * Handles CPU-intensive audio processing, rendering, and DOM updates
 */

export interface ProcessingState {
  isProcessing: boolean;
  type: 'audio' | 'rendering' | 'dom' | 'file' | 'computation';
  operation: string;
  startTime: number;
  estimatedDuration?: number;
}

export interface ProcessingMonitorOptions {
  maxWaitTime?: number;
  checkInterval?: number;
  audioBufferThreshold?: number;
  renderFrameThreshold?: number;
  cpuThreshold?: number;
  memoryThreshold?: number;
}

class ProcessingMonitor {
  private activeProcesses = new Map<string, ProcessingState>();
  private audioContext: AudioContext | null = null;
  private performanceObserver: PerformanceObserver | null = null;
  private frameRequestId: number | null = null;
  private cpuUsageHistory: number[] = [];
  private lastRenderTime = 0;
  private renderFrameCount = 0;

  constructor(private options: ProcessingMonitorOptions = {}) {
    this.options = {
      maxWaitTime: 15000,
      checkInterval: 100,
      audioBufferThreshold: 0.1, // 100ms of audio buffering
      renderFrameThreshold: 16.67, // 60fps threshold
      cpuThreshold: 80, // 80% CPU usage
      memoryThreshold: 100 * 1024 * 1024, // 100MB memory usage
      ...options
    };

    this.setupAudioMonitoring();
    this.setupPerformanceMonitoring();
    this.setupRenderMonitoring();
  }

  /**
   * Register a new processing operation
   */
  startProcessing(id: string, type: ProcessingState['type'], operation: string, estimatedDuration?: number): void {
    console.log(`🔄 Starting ${type} processing: ${operation} (${id})`);
    
    this.activeProcesses.set(id, {
      isProcessing: true,
      type,
      operation,
      startTime: performance.now(),
      estimatedDuration
    });

    // Emit custom event for listeners
    window.dispatchEvent(new CustomEvent('processing:start', {
      detail: { id, type, operation }
    }));
  }

  /**
   * Mark a processing operation as complete
   */
  finishProcessing(id: string): void {
    const process = this.activeProcesses.get(id);
    if (process) {
      const duration = performance.now() - process.startTime;
      console.log(`✅ Finished ${process.type} processing: ${process.operation} (${duration.toFixed(2)}ms)`);
      
      this.activeProcesses.delete(id);
      
      // Emit custom event for listeners
      window.dispatchEvent(new CustomEvent('processing:complete', {
        detail: { id, type: process.type, operation: process.operation, duration }
      }));
    }
  }

  /**
   * Check if any processing is currently active
   */
  isProcessing(): boolean {
    return this.activeProcesses.size > 0;
  }

  /**
   * Get all active processes
   */
  getActiveProcesses(): ProcessingState[] {
    return Array.from(this.activeProcesses.values());
  }

  /**
   * Wait for all processing to complete
   */
  async waitForProcessingComplete(customTimeout?: number): Promise<void> {
    const timeout = customTimeout || this.options.maxWaitTime!;
    const startTime = performance.now();
    
    console.log(`⏳ Waiting for processing to complete (timeout: ${timeout}ms)...`);

    return new Promise((resolve, reject) => {
      const checkComplete = () => {
        const elapsed = performance.now() - startTime;
        
        if (elapsed > timeout) {
          const activeOps = this.getActiveProcesses().map(p => `${p.type}:${p.operation}`);
          reject(new Error(`Processing timeout after ${timeout}ms. Active: ${activeOps.join(', ')}`));
          return;
        }

        if (this.isStable()) {
          console.log(`✅ All processing complete (${elapsed.toFixed(2)}ms)`);
          resolve();
          return;
        }

        setTimeout(checkComplete, this.options.checkInterval);
      };

      checkComplete();
    });
  }

  /**
   * Check if the system is stable (no processing, low CPU, stable rendering)
   */
  private isStable(): boolean {
    return (
      !this.isProcessing() &&
      this.isAudioStable() &&
      this.isRenderingStable() &&
      this.isCpuStable()
    );
  }

  /**
   * Setup audio context monitoring
   */
  private setupAudioMonitoring(): void {
    try {
      // Check if AudioContext is available (browser environment)
      if (typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined') {
        this.audioContext = new (AudioContext || (window as any).webkitAudioContext)();
        
        // Monitor audio context state changes
        this.audioContext.addEventListener('statechange', () => {
          if (this.audioContext?.state === 'running') {
            this.startProcessing('audio-context', 'audio', 'Audio context running');
          } else if (this.audioContext?.state === 'suspended' || this.audioContext?.state === 'closed') {
            this.finishProcessing('audio-context');
          }
        });
      }
    } catch (error) {
      console.warn('AudioContext not available for monitoring:', error);
    }
  }

  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    try {
      if (typeof PerformanceObserver !== 'undefined') {
        this.performanceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          
          entries.forEach((entry) => {
            // Monitor long tasks that might indicate heavy processing
            if (entry.entryType === 'longtask' && entry.duration > 50) {
              this.startProcessing(
                `longtask-${entry.startTime}`,
                'computation',
                `Long task: ${entry.duration.toFixed(2)}ms`,
                entry.duration
              );
              
              // Auto-finish after the task duration
              setTimeout(() => {
                this.finishProcessing(`longtask-${entry.startTime}`);
              }, entry.duration);
            }
            
            // Monitor navigation and resource loading
            if (entry.entryType === 'navigation' || entry.entryType === 'resource') {
              if (entry.duration > 100) {
                this.startProcessing(
                  `${entry.entryType}-${entry.startTime}`,
                  'file',
                  `${entry.entryType}: ${entry.name || 'unknown'}`,
                  entry.duration
                );
                
                setTimeout(() => {
                  this.finishProcessing(`${entry.entryType}-${entry.startTime}`);
                }, 10);
              }
            }
          });
        });

        // Start observing different types of performance entries
        try {
          this.performanceObserver.observe({ entryTypes: ['longtask'] });
        } catch (e) {
          console.warn('longtask observation not supported');
        }
        
        try {
          this.performanceObserver.observe({ entryTypes: ['navigation'] });
        } catch (e) {
          console.warn('navigation observation not supported');
        }
      }
    } catch (error) {
      console.warn('PerformanceObserver not available:', error);
    }
  }

  /**
   * Setup render frame monitoring
   */
  private setupRenderMonitoring(): void {
    const monitorFrame = () => {
      const now = performance.now();
      
      if (this.lastRenderTime > 0) {
        const frameDuration = now - this.lastRenderTime;
        
        // If frame takes longer than threshold, consider it heavy rendering
        if (frameDuration > this.options.renderFrameThreshold!) {
          this.startProcessing(
            `render-frame-${now}`,
            'rendering',
            `Heavy render frame: ${frameDuration.toFixed(2)}ms`,
            frameDuration
          );
          
          setTimeout(() => {
            this.finishProcessing(`render-frame-${now}`);
          }, 10);
        }
      }
      
      this.lastRenderTime = now;
      this.renderFrameCount++;
      
      this.frameRequestId = requestAnimationFrame(monitorFrame);
    };

    if (typeof requestAnimationFrame !== 'undefined') {
      this.frameRequestId = requestAnimationFrame(monitorFrame);
    }
  }

  /**
   * Check if audio processing is stable
   */
  private isAudioStable(): boolean {
    if (!this.audioContext) return true;
    
    try {
      // Check audio context state
      if (this.audioContext.state === 'running') {
        // Check if there's significant audio processing happening
        const currentTime = this.audioContext.currentTime;
        const baseLatency = this.audioContext.baseLatency || 0;
        const outputLatency = (this.audioContext as any).outputLatency || 0;
        
        // If latency is building up, audio is still processing
        return (baseLatency + outputLatency) < this.options.audioBufferThreshold!;
      }
      
      return this.audioContext.state !== 'running';
    } catch (error) {
      return true; // Assume stable if we can't check
    }
  }

  /**
   * Check if rendering is stable
   */
  private isRenderingStable(): boolean {
    // Check if there are pending RAF callbacks or heavy frames
    const recentFrames = 10;
    const hasHeavyFrames = this.renderFrameCount < recentFrames;
    
    // Also check for pending DOM mutations
    const hasPendingMutations = document.readyState !== 'complete';
    
    return !hasHeavyFrames && !hasPendingMutations;
  }

  /**
   * Check if CPU usage is stable
   */
  private isCpuStable(): boolean {
    // This is a simplified check - in a real implementation,
    // you might use Web Workers or other methods to monitor CPU
    return this.cpuUsageHistory.length === 0 || 
           this.cpuUsageHistory.every(usage => usage < this.options.cpuThreshold!);
  }

  /**
   * Monitor DOM mutations that might indicate ongoing processing
   */
  observeElement(element: HTMLElement): () => void {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          this.startProcessing(
            `dom-mutation-${Date.now()}`,
            'dom',
            'DOM mutation detected'
          );
          
          // Auto-finish after a short delay
          setTimeout(() => {
            this.finishProcessing(`dom-mutation-${Date.now()}`);
          }, 50);
        }
      });
    });

    observer.observe(element, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeOldValue: true
    });

    return () => observer.disconnect();
  }

  /**
   * Wait for element to be stable (no changes for a period)
   */
  async waitForElementStable(element: HTMLElement, stabilityDuration = 500): Promise<void> {
    return new Promise((resolve) => {
      let lastChangeTime = performance.now();
      
      const observer = new MutationObserver(() => {
        lastChangeTime = performance.now();
      });

      observer.observe(element, {
        childList: true,
        subtree: true,
        attributes: true
      });

      const checkStability = () => {
        const timeSinceLastChange = performance.now() - lastChangeTime;
        
        if (timeSinceLastChange >= stabilityDuration) {
          observer.disconnect();
          resolve();
        } else {
          setTimeout(checkStability, 50);
        }
      };

      checkStability();
    });
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
    
    if (this.frameRequestId) {
      cancelAnimationFrame(this.frameRequestId);
    }
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    
    this.activeProcesses.clear();
  }
}

// Global monitor instance
let globalMonitor: ProcessingMonitor | null = null;

/**
 * Get or create the global processing monitor
 */
export function getProcessingMonitor(options?: ProcessingMonitorOptions): ProcessingMonitor {
  if (!globalMonitor) {
    globalMonitor = new ProcessingMonitor(options);
  }
  return globalMonitor;
}

/**
 * Wait for all processing to complete
 */
export async function waitForProcessingComplete(timeout?: number): Promise<void> {
  const monitor = getProcessingMonitor();
  return monitor.waitForProcessingComplete(timeout);
}

/**
 * Wait for element to be stable
 */
export async function waitForElementStable(element: HTMLElement, duration?: number): Promise<void> {
  const monitor = getProcessingMonitor();
  return monitor.waitForElementStable(element, duration);
}

/**
 * Higher-level helper for visual tests with audio components
 */
export async function waitForAudioComponentReady(element: HTMLElement, options?: {
  timeout?: number;
  stabilityDuration?: number;
  includeAudioProcessing?: boolean;
}): Promise<void> {
  const {
    timeout = 15000,
    stabilityDuration = 1000,
    includeAudioProcessing = true
  } = options || {};

  const monitor = getProcessingMonitor();
  
  console.log('🎵 Waiting for audio component to be ready...');
  
  // Wait for initial processing to complete
  if (includeAudioProcessing) {
    await monitor.waitForProcessingComplete(timeout);
  }
  
  // Wait for DOM to stabilize
  await monitor.waitForElementStable(element, stabilityDuration);
  
  // Additional wait for audio-specific processing
  if (includeAudioProcessing) {
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log('✅ Audio component ready for testing');
}

export { ProcessingMonitor };
