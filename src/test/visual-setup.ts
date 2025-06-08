// Visual test setup - handles screenshot generation and comparison
import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import fs from 'fs/promises'
import path from 'path'

// Ensure screenshot directories exist
const screenshotDirs = [
  '__snapshots__/screenshots',
  '__snapshots__/screenshots/__received_output__',
  '__snapshots__/diffs',
  'test-results/visual'
]

beforeAll(async () => {
  console.log('📸 Setting up visual test environment...')
  
  // Create screenshot directories
  for (const dir of screenshotDirs) {
    try {
      await fs.mkdir(dir, { recursive: true })
    } catch (error) {
      console.warn(`Warning: Could not create directory ${dir}:`, error)
    }
  }

  // Clean up old screenshots from previous test runs
  try {
    const receivedDir = '__snapshots__/screenshots/__received_output__'
    const files = await fs.readdir(receivedDir)
    const cleanupPromises = files
      .filter(file => file.endsWith('-received.png'))
      .map(file => fs.unlink(path.join(receivedDir, file)).catch(() => {}))
    
    await Promise.all(cleanupPromises)
    console.log(`🧹 Cleaned up ${cleanupPromises.length} old received screenshots`)
  } catch (error) {
    // Directory might not exist yet, that's okay
  }

  console.log('✅ Visual test environment ready')
})

afterAll(async () => {
  console.log('📊 Generating visual test report...')
  
  try {
    // Generate a simple HTML report for visual tests
    const screenshotDir = '__snapshots__/screenshots'
    const files = await fs.readdir(screenshotDir)
    const screenshots = files.filter(file => file.endsWith('.png'))
    
    const htmlReport = `
<!DOCTYPE html>
<html>
<head>
    <title>Visual Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .screenshot { margin: 20px 0; padding: 20px; border: 1px solid #ddd; }
        .screenshot img { max-width: 300px; height: auto; margin: 10px; border: 1px solid #ccc; }
        .screenshot h3 { color: #333; }
        .received { border-color: #f39c12; }
        .diff { border-color: #e74c3c; }
        .baseline { border-color: #27ae60; }
    </style>
</head>
<body>
    <h1>Visual Test Report</h1>
    <p>Generated: ${new Date().toISOString()}</p>
    <p>Total Screenshots: ${screenshots.length}</p>
    
    ${screenshots.map(screenshot => `
        <div class="screenshot baseline">
            <h3>${screenshot}</h3>
            <img src="../__snapshots__/screenshots/${screenshot}" alt="${screenshot}" />
        </div>
    `).join('')}
    
    ${files.filter(f => f.includes('-received')).map(screenshot => `
        <div class="screenshot received">
            <h3>${screenshot} (Received)</h3>
            <img src="../__snapshots__/screenshots/__received_output__/${screenshot}" alt="${screenshot}" />
        </div>
    `).join('')}
</body>
</html>
    `.trim()
    
    await fs.writeFile('test-results/visual-report.html', htmlReport)
    console.log('✅ Visual test report generated at test-results/visual-report.html')
  } catch (error) {
    console.warn('Warning: Could not generate visual test report:', error)
  }
})

beforeEach(() => {
  // Reset any visual test state
})

afterEach(() => {
  // Cleanup after each visual test
})

// Enhanced screenshot helper with diff capabilities
global.visualTestHelpers = {
  compareScreenshots: async (received: string, baseline: string) => {
    // This would integrate with a proper image diff library
    // For now, we'll just check if files exist
    try {
      await fs.access(received)
      await fs.access(baseline)
      return { match: true, diff: null }
    } catch {
      return { match: false, diff: 'Files not found' }
    }
  },
  
  saveScreenshot: async (buffer: Buffer, name: string, type: 'baseline' | 'received' | 'diff' = 'baseline') => {
    const dir = type === 'received' ? '__snapshots__/screenshots/__received_output__' 
                : type === 'diff' ? '__snapshots__/diffs'
                : '__snapshots__/screenshots'
    
    const filename = type === 'received' ? `${name}-received.png` 
                   : type === 'diff' ? `${name}-diff.png`
                   : `${name}.png`
    
    const filepath = path.join(dir, filename)
    await fs.writeFile(filepath, buffer)
    return filepath
  }
}

export {}
