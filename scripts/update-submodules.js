#!/usr/bin/env node

/**
 * Script to update all submodules, with special handling for current user's repositories
 * This script will:
 * 1. Detect submodules owned by the current GitHub user
 * 2. Fetch latest changes for all submodules
 * 3. Update user's submodules to latest main branch
 * 4. Commit the updates if there are changes
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');

// Get current GitHub username from git config
function getCurrentGitUser() {
    try {
        const gitUser = execSync('git config --get user.name', { encoding: 'utf8' }).trim();
        const gitEmail = execSync('git config --get user.email', { encoding: 'utf8' }).trim();
        return { name: gitUser, email: gitEmail };
    } catch (error) {
        console.error('Error getting git user:', error.message);
        return null;
    }
}

// Parse .gitmodules to find repositories owned by current user
function getUserSubmodules() {
    try {
        const gitmodulesPath = path.join(ROOT_DIR, 'workstation', '.gitmodules');
        const gitmodules = fs.readFileSync(gitmodulesPath, 'utf8');
        const user = getCurrentGitUser();
        
        if (!user) {
            console.error('Could not determine current git user');
            return [];
        }

        // Extract submodule URLs and check for user's repositories
        const userSubmodules = [];
        const submoduleMatches = gitmodules.matchAll(/\[submodule "([^"]+)"\][^\[]*url = ([^\n]+)/g);
        
        for (const match of submoduleMatches) {
            const [, name, url] = match;
            // Check if URL contains username (both https and git formats)
            if (url.includes(`github.com/${user.name}/`) || 
                url.includes(`git@github.com:${user.name}/`)) {
                userSubmodules.push(name);
            }
        }
        
        console.log(`Found ${userSubmodules.length} submodules owned by ${user.name}`);
        return userSubmodules;
    } catch (error) {
        console.error('Error parsing .gitmodules:', error.message);
        return [];
    }
}

function execCommand(command, options = {}) {
    try {
        return execSync(command, {
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'pipe'],
            ...options
        });
    } catch (error) {
        console.error(`Error executing command: ${command}`);
        console.error(error.message);
        return null;
    }
}

function updateSubmodule(submodulePath) {
    console.log(`\nUpdating submodule: ${submodulePath}`);
    
    // Change to submodule directory
    process.chdir(path.join(ROOT_DIR, 'workstation', submodulePath));
    
    // Fetch latest changes
    console.log('Fetching latest changes...');
    execCommand('git fetch origin');
    
    // Checkout main branch
    console.log('Checking out main branch...');
    execCommand('git checkout main');
    
    // Pull latest changes
    console.log('Pulling latest changes...');
    execCommand('git pull origin main');
    
    // Get latest commit hash
    const latestCommit = execCommand('git rev-parse HEAD').trim();
    console.log(`Latest commit: ${latestCommit}`);
    
    return latestCommit;
}

function main() {
    // Store original directory
    const originalDir = process.cwd();
    
    try {
        // Change to root directory
        process.chdir(ROOT_DIR);
        
        // Initialize and update all submodules first
        console.log('Initializing all submodules...');
        execCommand('git submodule update --init --recursive');
        
        // Get current user's submodules
        const userSubmodules = getUserSubmodules();
        
        // Update user's submodules
        for (const submodule of userSubmodules) {
            const newCommit = updateSubmodule(submodule);
            if (newCommit) {
                // Update parent repository to use new commit
                process.chdir(ROOT_DIR);
                execCommand(`git add workstation/${submodule}`);
            }
        }
        
        // Check if there are changes to commit
        process.chdir(ROOT_DIR);
        const status = execCommand('git status --porcelain');
        const user = getCurrentGitUser();
        
        if (status && status.length > 0) {
            console.log('\nCommitting submodule updates...');
            execCommand(`git commit -m "Update ${user.name}'s submodules to latest versions"`);
            console.log('Submodule updates committed successfully');
        } else {
            console.log('\nNo submodule updates to commit');
        }
        
    } catch (error) {
        console.error('Error updating submodules:', error);
        process.exit(1);
    } finally {
        // Restore original directory
        process.chdir(originalDir);
    }
}

// Run the script
main();
