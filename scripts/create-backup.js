#!/usr/bin/env node

/**
 * Backup Script for Orpheus Engine
 * 
 * This script creates zip archives of important project directories
 * rather than keeping them as separate folders in the archives or backups directories.
 * 
 * Usage:
 *   node create-backup.js [folder-to-backup] [--dest=archives|backups]
 * 
 * Examples:
 *   node create-backup.js workstation --dest=archives
 *   node create-backup.js OEW-main
 *   node create-backup.js     (backs up all important folders)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const DEFAULT_BACKUP_DIR = 'archives';
const FOLDERS_TO_BACKUP = ['workstation', 'OEW-main'];
const DATE_FORMAT = { year: 'numeric', month: '2-digit', day: '2-digit' };

// Colors for terminal output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    bold: '\x1b[1m'
};

/**
 * Format date as YYYYMMDD
 */
function getDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

/**
 * Log message with color
 */
function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

/**
 * Create backup directory if it doesn't exist
 */
function ensureBackupDir(backupDir) {
    const fullPath = path.join(ROOT_DIR, backupDir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        log(`Created backup directory: ${backupDir}`, colors.blue);
    }
    return fullPath;
}

/**
 * Get list of submodule paths from .gitmodules file
 */
function getSubmodulePaths() {
    const gitmodulesPath = path.join(ROOT_DIR, '.gitmodules');
    const submodulePaths = [];
    
    if (fs.existsSync(gitmodulesPath)) {
        try {
            const content = fs.readFileSync(gitmodulesPath, 'utf8');
            const submoduleMatches = content.matchAll(/\[submodule "([^"]+)"\][^\[]*path = ([^\n]+)/g);
            
            for (const match of submoduleMatches) {
                const [, name, subPath] = match;
                const trimmedPath = subPath.trim();
                submodulePaths.push(trimmedPath);
                log(`Detected Git submodule: ${trimmedPath}`, colors.blue);
            }
        } catch (error) {
            log(`Warning: Could not parse .gitmodules file: ${error.message}`, colors.yellow);
        }
    }
    
    return submodulePaths;
}

/**
 * Create a zip archive of a directory
 */
function createZipArchive(sourceDir, destDir, zipName) {
    const sourcePath = path.join(ROOT_DIR, sourceDir);
    const destPath = path.join(ROOT_DIR, destDir, zipName);
    
    // Make sure source exists
    if (!fs.existsSync(sourcePath)) {
        log(`Source directory not found: ${sourceDir}`, colors.red);
        return false;
    }
    
    try {
        // Create zip archive
        log(`Creating backup of ${sourceDir}...`, colors.blue);
        
        // Get Git submodule paths to exclude them from backup
        const submodulePaths = getSubmodulePaths();
        const submoduleExclusions = submodulePaths
            .map(subPath => `-x "${subPath}/*"`)
            .join(' ');
        
        // Standard exclusions
        const standardExclusions = `-x "*/node_modules/*" -x "*/venv/*" -x "*/.git/*" -x "*/dist/*" -x "*/build/*" -x "*.zip" -x "*/ffmpeg/*"`;
        
        // Use zip command (macOS/Linux) with exclusions
        const cmd = `cd "${ROOT_DIR}" && zip -r "${destPath}" "${sourceDir}" ${standardExclusions} ${submoduleExclusions}`;
        
        log(`Excluding standard patterns: node_modules, venv, .git, dist, build, ffmpeg`, colors.blue);
        if (submodulePaths.length > 0) {
            log(`Excluding Git submodules: ${submodulePaths.join(', ')}`, colors.blue);
        }
        
        execSync(cmd, { stdio: 'inherit' });
        
        log(`✅ Backup created: ${zipName}`, colors.green);
        return true;
    } catch (error) {
        log(`❌ Failed to create backup of ${sourceDir}: ${error.message}`, colors.red);
        return false;
    }
}

/**
 * Clean up old backup folders by moving them to zip archives
 */
function cleanupOldBackups(backupDir) {
    const fullPath = path.join(ROOT_DIR, backupDir);
    
    // Check if directory exists
    if (!fs.existsSync(fullPath)) {
        log(`Directory does not exist: ${backupDir}`, colors.yellow);
        return;
    }
    
    const dateStr = getDateString();
    const items = fs.readdirSync(fullPath);
    
    // Find directories (not zip files)
    const dirs = items.filter(item => {
        const itemPath = path.join(fullPath, item);
        return fs.statSync(itemPath).isDirectory() && !item.startsWith('.');
    });
    
    if (dirs.length === 0) {
        log(`No old backup folders found in ${backupDir} directory.`, colors.blue);
        return;
    }
    
    log(`Found ${dirs.length} directories in ${backupDir} to convert to zip archives:`, colors.yellow);
    dirs.forEach(dir => console.log(`  - ${dir}`));
    
    // Archive each directory
    dirs.forEach(dir => {
        const zipName = `${dir}-migrated-${dateStr}.zip`;
        
        try {
            // Create zip archive
            log(`Converting ${dir} to zip archive...`, colors.blue);
            
            // Use the full paths for clarity and safety
            const dirFullPath = path.join(fullPath, dir);
            const zipFullPath = path.join(fullPath, zipName);
            
            // Get Git submodule paths to exclude them from backup
            const submodulePaths = getSubmodulePaths();
            const submoduleExclusions = submodulePaths
                .map(subPath => `-x "${subPath}/*"`)
                .join(' ');
            
            // Standard exclusions
            const standardExclusions = `-x "*/node_modules/*" -x "*/venv/*" -x "*/.git/*" -x "*/dist/*" -x "*/build/*" -x "*.zip" -x "*/ffmpeg/*"`;
            
            // Create the zip in the same directory as the folder
            const cmd = `cd "${ROOT_DIR}" && zip -r "${zipFullPath}" "${backupDir}/${dir}" ${standardExclusions} ${submoduleExclusions}`;
            execSync(cmd);
            
            // Remove the original directory
            const rmCmd = `rm -rf "${dirFullPath}"`;
            execSync(rmCmd);
            
            log(`✅ Converted ${dir} to ${zipName}`, colors.green);
        } catch (error) {
            log(`❌ Failed to convert ${dir}: ${error.message}`, colors.red);
        }
    });
}

/**
 * Main backup function
 */
function backup() {
    // Parse command line arguments
    const args = process.argv.slice(2);
    let folderToBackup = null;
    let backupDir = DEFAULT_BACKUP_DIR;
    
    // Process arguments
    args.forEach(arg => {
        if (arg.startsWith('--dest=')) {
            backupDir = arg.split('=')[1];
        } else if (!arg.startsWith('--')) {
            folderToBackup = arg;
        }
    });
    
    // Ensure backup directory exists
    ensureBackupDir(backupDir);
    
    // Get date string for file names
    const dateStr = getDateString();
    
    // Determine which folders to backup
    const foldersToProcess = folderToBackup ? [folderToBackup] : FOLDERS_TO_BACKUP;
    
    // Create backups
    let successCount = 0;
    foldersToProcess.forEach(folder => {
        const zipName = `${folder}-${dateStr}.zip`;
        if (createZipArchive(folder, backupDir, zipName)) {
            successCount++;
        }
    });
    
    // Clean up old backup folders
    cleanupOldBackups('archives');
    cleanupOldBackups('backups');
    
    // Summary
    log('\nBackup Summary:', colors.bold);
    log(`✅ Successfully backed up ${successCount} of ${foldersToProcess.length} folders`, 
        successCount === foldersToProcess.length ? colors.green : colors.yellow);
}

// Run the backup
backup();
