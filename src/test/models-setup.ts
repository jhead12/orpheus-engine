// Models test setup - handles AI/ML model testing
import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import { spawn, ChildProcess } from 'child_process'
import path from 'path'

// Global model test state
global.modelTestState = {
  pythonEnv: null as ChildProcess | null,
  modelCache: new Map(),
  testModels: {
    audioAnalysis: {
      loaded: false,
      path: './workstation/model/audio_analysis_model.pkl',
      type: 'sklearn'
    },
    sentimentAnalysis: {
      loaded: false,
      path: './workstation/model/sentiment_model.pkl', 
      type: 'sklearn'
    }
  }
}

// Mock model interfaces for testing
global.mockModels = {
  audioAnalysis: {
    predict: async (audioData: ArrayBuffer | number[]) => {
      // Mock audio analysis prediction
      return {
        tempo: 120 + Math.random() * 60,
        key: ['C', 'D', 'E', 'F', 'G', 'A', 'B'][Math.floor(Math.random() * 7)],
        energy: Math.random(),
        valence: Math.random(),
        features: {
          spectral_centroid: Math.random() * 4000,
          spectral_rolloff: Math.random() * 8000,
          zero_crossing_rate: Math.random() * 0.3,
          mfcc: Array.from({ length: 13 }, () => Math.random() * 100 - 50)
        },
        confidence: 0.8 + Math.random() * 0.2
      }
    },
    
    analyzeTrack: async (trackData: any) => {
      return {
        trackId: trackData.id,
        analysis: await global.mockModels.audioAnalysis.predict(trackData.audioData || []),
        timestamp: Date.now(),
        processingTime: 100 + Math.random() * 500
      }
    }
  },

  sentimentAnalysis: {
    analyze: async (text: string) => {
      // Mock sentiment analysis
      const sentiments = ['positive', 'negative', 'neutral']
      return {
        sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
        confidence: 0.7 + Math.random() * 0.3,
        scores: {
          positive: Math.random(),
          negative: Math.random(),
          neutral: Math.random()
        }
      }
    }
  },

  // Mock MLflow model serving
  mlflowModel: {
    predict: async (data: any) => {
      return {
        predictions: Array.isArray(data) ? data.map(() => Math.random()) : [Math.random()],
        model_version: '1.0.0',
        timestamp: new Date().toISOString()
      }
    },
    
    getModelInfo: () => ({
      name: 'test-model',
      version: '1.0.0',
      stage: 'Production',
      description: 'Test model for integration testing'
    })
  }
}

// Mock Python model execution
async function executePythonModel(scriptPath: string, inputData: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const python = spawn('python', [scriptPath], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        PYTHONPATH: process.cwd(),
        TEST_MODE: '1'
      }
    })

    let output = ''
    let error = ''

    python.stdout.on('data', (data) => {
      output += data.toString()
    })

    python.stderr.on('data', (data) => {
      error += data.toString()
    })

    python.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output)
          resolve(result)
        } catch (e) {
          resolve({ output, rawOutput: true })
        }
      } else {
        reject(new Error(`Python script failed with code ${code}: ${error}`))
      }
    })

    // Send input data to Python script
    if (inputData) {
      python.stdin.write(JSON.stringify(inputData))
    }
    python.stdin.end()
  })
}

beforeAll(async () => {
  console.log('🤖 Setting up model test environment...')
  
  // Check if Python environment is available
  try {
    const result = await executePythonModel('./python/audio_analysis.py', { test: true })
    console.log('✅ Python environment ready')
    global.modelTestState.pythonEnv = true
  } catch (error) {
    console.warn('⚠️  Python environment not available, using mocks:', error.message)
    global.modelTestState.pythonEnv = false
  }

  // Initialize model cache
  global.modelTestState.modelCache.set('audioAnalysis', global.mockModels.audioAnalysis)
  global.modelTestState.modelCache.set('sentimentAnalysis', global.mockModels.sentimentAnalysis)
  global.modelTestState.modelCache.set('mlflowModel', global.mockModels.mlflowModel)

  console.log('✅ Model test environment ready')
})

afterAll(async () => {
  console.log('🛑 Cleaning up model test environment...')
  
  // Clear model cache
  global.modelTestState.modelCache.clear()
  
  console.log('✅ Model test environment cleaned up')
})

beforeEach(() => {
  // Reset model state for each test
  Object.keys(global.modelTestState.testModels).forEach(key => {
    global.modelTestState.testModels[key].loaded = false
  })
})

afterEach(() => {
  // Cleanup after each model test
})

// Export utilities for model tests
global.modelTestUtils = {
  loadModel: async (modelName: string) => {
    const model = global.modelTestState.modelCache.get(modelName)
    if (model) {
      global.modelTestState.testModels[modelName] = {
        ...global.modelTestState.testModels[modelName],
        loaded: true
      }
      return model
    }
    throw new Error(`Model ${modelName} not found`)
  },

  generateTestAudioData: (length = 1024) => {
    return Array.from({ length }, () => Math.random() * 2 - 1)
  },

  generateTestTrackData: () => ({
    id: `test-track-${Date.now()}`,
    name: 'Test Track',
    audioData: global.modelTestUtils.generateTestAudioData(),
    sampleRate: 44100,
    duration: 30
  }),

  executePythonModel
}

export {}
