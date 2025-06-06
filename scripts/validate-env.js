#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const requiredEnvVars = {
  VITE_PORT: { type: 'number', default: '5174' },
  VITE_HOST: { type: 'boolean', default: 'true' },
  API_URL: { type: 'url', default: 'http://localhost:5001' },
  VITE_AUDIO_SAMPLE_RATE: { type: 'number', default: '44100' },
  VITE_AUDIO_BUFFER_SIZE: { type: 'number', default: '4096' },
  VITE_AUDIO_LATENCY_HINT: { type: 'string', default: 'interactive' },
  VITE_AUDIO_PROCESSING_URL: { type: 'url', default: 'http://localhost:7008' },
  VITE_MONITOR_API_URL: { type: 'url', default: 'http://localhost:8000' }
};

function validateEnv() {
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  // Check if .env exists
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found');
    if (fs.existsSync(envExamplePath)) {
      console.log('ℹ️  You can copy .env.example to .env as a starting point');
    }
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = Object.fromEntries(
    envContent
      .split('\n')
      .filter(line => line && !line.startsWith('#'))
      .map(line => line.split('='))
  );

  let hasErrors = false;

  // Validate each required variable
  Object.entries(requiredEnvVars).forEach(([key, config]) => {
    const value = envVars[key];
    
    if (!value) {
      console.warn(`⚠️  Missing ${key}, using default: ${config.default}`);
      return;
    }

    switch (config.type) {
      case 'number':
        if (isNaN(Number(value))) {
          console.error(`❌ ${key} must be a number`);
          hasErrors = true;
        }
        break;
      case 'boolean':
        if (!['true', 'false'].includes(value.toLowerCase())) {
          console.error(`❌ ${key} must be true or false`);
          hasErrors = true;
        }
        break;
      case 'url':
        try {
          new URL(value);
        } catch {
          console.error(`❌ ${key} must be a valid URL`);
          hasErrors = true;
        }
        break;
    }
  });

  if (hasErrors) {
    process.exit(1);
  }

  console.log('✅ Environment configuration is valid');
}

validateEnv();
