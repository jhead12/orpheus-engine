/**
 * Windows-compatible script for setting up Electron symlinks
 * This script replaces the functionality in setup-electron-symlinks.sh
 * for Windows environments
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the absolute path to the project root
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Function to create directory if it doesn't exist
function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
    console.log(`Created directory: ${directory}`);
  }
}

// Function to check if running on Windows
function isWindows() {
  return process.platform === 'win32';
}

// Function to create symlink with Windows compatibility
function createSymlink(target, linkPath) {
  const targetRelative = path.relative(path.dirname(linkPath), target);
  
  try {
    // Remove existing file or directory if it exists
    if (fs.existsSync(linkPath)) {
      const stats = fs.lstatSync(linkPath);
      if (stats.isSymbolicLink()) {
        fs.unlinkSync(linkPath);
      } else if (stats.isDirectory()) {
        fs.rmSync(linkPath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(linkPath);
      }
    }

    // Create directory structure if needed
    ensureDirectoryExists(path.dirname(linkPath));
    
    if (isWindows()) {
      // Windows requires admin privileges for symlinks, so we'll use junction points or file copies
      if (fs.statSync(target).isDirectory()) {
        // Use mklink /J for directory junctions (doesn't require admin)
        execSync(`mklink /J "${linkPath}" "${target}"`, { shell: 'cmd.exe' });
      } else {
        // For files, just create a copy
        fs.copyFileSync(target, linkPath);
        console.log(`Created copy: ${linkPath} -> ${target}`);
      }
    } else {
      // For non-Windows, use standard symlinks
      fs.symlinkSync(targetRelative, linkPath);
      console.log(`Created symlink: ${linkPath} -> ${targetRelative}`);
    }
  } catch (error) {
    console.error(`Error creating link ${linkPath}:`, error.message);
  }
}

console.log("Setting up Electron environment...");

// Create src/electron directory
ensureDirectoryExists(path.join(PROJECT_ROOT, 'src', 'electron'));

// Set up src/electron/index.ts
const electronIndexSource = path.join(PROJECT_ROOT, 'electron', 'index.ts');
const electronIndexDest = path.join(PROJECT_ROOT, 'src', 'electron', 'index.ts');
createSymlink(electronIndexSource, electronIndexDest);

// Make sure the electron build directory exists
ensureDirectoryExists(path.join(PROJECT_ROOT, 'build', 'electron'));

// Create symlink/junction for electron build output
const electronSourceDir = path.join(PROJECT_ROOT, 'electron');
const electronBuildDir = path.join(PROJECT_ROOT, 'build', 'electron');
createSymlink(electronSourceDir, electronBuildDir);

// Ensure the symlink is included in TypeScript compilation
const gitkeepFile = path.join(PROJECT_ROOT, 'src', 'electron', '.gitkeep');
fs.writeFileSync(gitkeepFile, '');
console.log(`Created file: ${gitkeepFile}`);

console.log("Electron setup complete!");
