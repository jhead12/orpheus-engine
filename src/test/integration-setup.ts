// Integration test setup - handles frontend/backend communication testing
import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import { spawn, ChildProcess } from 'child_process'
import fetch from 'node-fetch'

// Global test state
global.testState = {
  backendProcess: null as ChildProcess | null,
  frontendProcess: null as ChildProcess | null,
  backendUrl: 'http://localhost:8000',
  frontendUrl: 'http://localhost:3000',
  isBackendReady: false,
  isFrontendReady: false
}

// Mock MLflow tracking for tests
global.mockMLflowTracking = {
  logs: [] as any[],
  experiments: new Map(),
  runs: new Map(),
  startRun: (experimentName: string, runName?: string) => {
    const runId = `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const run = {
      runId,
      experimentName,
      runName: runName || `test_run_${Date.now()}`,
      startTime: Date.now(),
      status: 'RUNNING',
      metrics: new Map(),
      params: new Map(),
      tags: new Map()
    }
    global.mockMLflowTracking.runs.set(runId, run)
    return runId
  },
  logMetric: (runId: string, key: string, value: number, step?: number) => {
    const run = global.mockMLflowTracking.runs.get(runId)
    if (run) {
      if (!run.metrics.has(key)) {
        run.metrics.set(key, [])
      }
      run.metrics.get(key).push({ value, step: step || 0, timestamp: Date.now() })
    }
  },
  logParam: (runId: string, key: string, value: string) => {
    const run = global.mockMLflowTracking.runs.get(runId)
    if (run) {
      run.params.set(key, value)
    }
  },
  endRun: (runId: string, status = 'FINISHED') => {
    const run = global.mockMLflowTracking.runs.get(runId)
    if (run) {
      run.status = status
      run.endTime = Date.now()
    }
  }
}

// Utility function to wait for service to be ready
async function waitForService(url: string, timeout = 30000): Promise<boolean> {
  const startTime = Date.now()
  
  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(`${url}/health`, { 
        method: 'GET',
        timeout: 5000 
      })
      if (response.ok) return true
    } catch (error) {
      // Service not ready yet
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  return false
}

// Start backend service for integration tests
async function startBackend(): Promise<ChildProcess | null> {
  return new Promise((resolve) => {
    const backend = spawn('python', ['-m', 'uvicorn', 'workstation.backend.main:app', '--host', '0.0.0.0', '--port', '8000'], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { 
        ...process.env, 
        PYTHONPATH: process.cwd(),
        MLFLOW_TRACKING_URI: 'file://./test-results/mlruns',
        TEST_MODE: '1'
      }
    })

    backend.stdout?.on('data', (data) => {
      const output = data.toString()
      console.log(`Backend: ${output}`)
      if (output.includes('Uvicorn running')) {
        global.testState.isBackendReady = true
      }
    })

    backend.stderr?.on('data', (data) => {
      console.error(`Backend Error: ${data}`)
    })

    backend.on('error', (error) => {
      console.error('Failed to start backend:', error)
      resolve(null)
    })

    setTimeout(() => resolve(backend), 2000) // Give it time to start
  })
}

// Start frontend service for integration tests
async function startFrontend(): Promise<ChildProcess | null> {
  return new Promise((resolve) => {
    const frontend = spawn('npm', ['run', 'dev:local'], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { 
        ...process.env,
        NODE_ENV: 'test',
        VITE_API_URL: global.testState.backendUrl,
        VITE_ENABLE_AUDIO_WORKLET: 'false', // Disable audio in tests
        TEST_MODE: '1'
      }
    })

    frontend.stdout?.on('data', (data) => {
      const output = data.toString()
      console.log(`Frontend: ${output}`)
      if (output.includes('Local:') && output.includes('3000')) {
        global.testState.isFrontendReady = true
      }
    })

    frontend.stderr?.on('data', (data) => {
      console.error(`Frontend Error: ${data}`)
    })

    frontend.on('error', (error) => {
      console.error('Failed to start frontend:', error)
      resolve(null)
    })

    setTimeout(() => resolve(frontend), 3000) // Give it time to start
  })
}

beforeAll(async () => {
  console.log('🚀 Starting integration test environment...')
  
  // Start backend
  global.testState.backendProcess = await startBackend()
  if (global.testState.backendProcess) {
    console.log('⏳ Waiting for backend to be ready...')
    global.testState.isBackendReady = await waitForService(global.testState.backendUrl)
    if (global.testState.isBackendReady) {
      console.log('✅ Backend is ready')
    } else {
      console.log('❌ Backend failed to start')
    }
  }

  // Start frontend
  global.testState.frontendProcess = await startFrontend()
  if (global.testState.frontendProcess) {
    console.log('⏳ Waiting for frontend to be ready...')
    global.testState.isFrontendReady = await waitForService(global.testState.frontendUrl)
    if (global.testState.isFrontendReady) {
      console.log('✅ Frontend is ready')
    } else {
      console.log('❌ Frontend failed to start')
    }
  }

  // Wait a bit more for full initialization
  await new Promise(resolve => setTimeout(resolve, 2000))
}, 60000)

afterAll(async () => {
  console.log('🛑 Shutting down integration test environment...')
  
  if (global.testState.backendProcess) {
    global.testState.backendProcess.kill('SIGTERM')
    // Wait for graceful shutdown
    await new Promise(resolve => setTimeout(resolve, 2000))
    if (!global.testState.backendProcess.killed) {
      global.testState.backendProcess.kill('SIGKILL')
    }
  }

  if (global.testState.frontendProcess) {
    global.testState.frontendProcess.kill('SIGTERM')
    await new Promise(resolve => setTimeout(resolve, 2000))
    if (!global.testState.frontendProcess.killed) {
      global.testState.frontendProcess.kill('SIGKILL')
    }
  }

  console.log('✅ Integration test environment shut down')
})

beforeEach(() => {
  // Reset mock MLflow state for each test
  global.mockMLflowTracking.logs = []
  global.mockMLflowTracking.experiments.clear()
  global.mockMLflowTracking.runs.clear()
})

afterEach(() => {
  // Cleanup any test-specific state
})

export {}
