#!/usr/bin/env node

import { execa } from 'execa';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const oewMainDir = path.resolve(rootDir, 'workstation/frontend/OEW-main');

async function runTests(cwd, cmd, args) {
    console.log(`\nRunning tests in ${cwd}`);
    console.log(`Command: ${cmd} ${args.join(' ')}\n`);
    
    try {
        const { stdout } = await execa(cmd, args, {
            cwd,
            env: {
                ...process.env,
                DEBUG: 'true',
                NODE_ENV: 'test'
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
    console.log('Debugging Unified Test Environment');
    console.log('============================================\n');

    // First run from OEW-main directory (known working)
    console.log('Testing from OEW-main directory:');
    await runTests(oewMainDir, 'pnpm', ['vitest', 'run']);

    // Then run from root with unified config
    console.log('\nTesting from root directory with unified config:');
    await runTests(rootDir, 'pnpm', ['vitest', 'run', '--config', 'vitest.root.config.ts']);

    // Compare React versions
    console.log('\nChecking React versions:');
    const checkReact = `
        const react = require('react');
        console.log('React version:', react.version);
        console.log('React instance:', react);
    `;
    
    console.log('\nRoot project React:');
    await runTests(rootDir, 'node', ['-e', checkReact]);
    
    console.log('\nOEW-main React:');
    await runTests(oewMainDir, 'node', ['-e', checkReact]);
}

main().catch(error => {
    console.error('Error running tests:', error);
    process.exit(1);
});
