#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const oewMainDir = path.resolve(rootDir, 'workstation/frontend/OEW-main');

console.log('Checking test environments:\n');

// Check Node version
console.log('Node version:', process.version);
console.log('Node executable:', process.execPath);

// Check pnpm version
try {
    const pnpmVersion = execSync('pnpm --version', { encoding: 'utf8' }).trim();
    console.log('pnpm version:', pnpmVersion);
} catch (error) {
    console.error('Error getting pnpm version:', error.message);
}

// Check package versions in both locations
function getPackageVersion(pkgPath, pkg) {
    try {
        const version = require(path.join(pkgPath, 'node_modules', pkg, 'package.json')).version;
        return version;
    } catch (error) {
        return 'not found';
    }
}

const packages = ['react', 'react-dom', 'vitest', '@testing-library/react'];

console.log('\nRoot directory package versions:');
packages.forEach(pkg => {
    console.log(`${pkg}: ${getPackageVersion(rootDir, pkg)}`);
});

console.log('\nOEW-main directory package versions:');
packages.forEach(pkg => {
    console.log(`${pkg}: ${getPackageVersion(oewMainDir, pkg)}`);
});
