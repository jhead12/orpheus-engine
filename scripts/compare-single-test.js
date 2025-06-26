#!/usr/bin/env node

import { execa } from 'execa';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const oewMainDir = path.resolve(rootDir, 'workstation/frontend/OEW-main');

// Pick a specific test file that's showing false negatives
const testFile = 'src/screens/workstation/components/__tests__/TrackComponent.test.tsx';

async function runTests(cwd, cmd, args) {
    console.log(`\nRunning tests in ${cwd}`);
    console.log(`Command: ${cmd} ${args.join(' ')}\n`);
    
    try {
        const { stdout } = await execa(cmd, args, {
            cwd,
            env: {
                ...process.env,
                DEBUG: 'true',
                NODE_ENV: 'test',
                VITE_DEBUG_REACT: 'true'  // Enable React debug mode
            },
            stdio: 'inherit'
        });
        
        return { success: true, output: stdout };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function main() {
    console.log('============================================');
    console.log('Comparing Single Test File Execution');
    console.log('============================================\n');

    // Run from OEW-main directory (known working)
    console.log('Running test from OEW-main directory:');
    await runTests(oewMainDir, 'pnpm', ['vitest', 'run', testFile]);

    // Run from root with unified config
    console.log('\nRunning test from root directory with unified config:');
    await runTests(rootDir, 'pnpm', ['vitest', 'run', '--config', 'vitest.root.config.ts', testFile]);

    // Print module resolution paths
    console.log('\nModule resolution paths:');
    const checkModules = `
        const module = require('module');
        console.log('Module paths:', module._nodeModulePaths(process.cwd()));
    `;
    
    console.log('\nRoot project module paths:');
    await runTests(rootDir, 'node', ['-e', checkModules]);
    
    console.log('\nOEW-main module paths:');
    await runTests(oewMainDir, 'node', ['-e', checkModules]);
}

main().catch(error => {
    console.error('Error running tests:', error);
    process.exit(1);
});
