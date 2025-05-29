#!/usr/bin/env node

/**
 * Script to prepare a new release
 * This script will:
 * 1. Update all user submodules
 * 2. Update version numbers
 * 3. Update CHANGELOG.md
 * 4. Create a release branch
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

const ROOT_DIR = path.resolve(__dirname, '..');

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

async function promptForVersion() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question('Enter the new version number (e.g., 1.0.11): ', (version) => {
            rl.close();
            resolve(version.trim());
        });
    });
}

async function updateChangelog(version) {
    const changelogPath = path.join(ROOT_DIR, 'CHANGELOG.md');
    const date = new Date().toISOString().split('T')[0];
    const newEntry = `\n## [${version}] - ${date}\n\n### Changed\n- Updated user submodules to latest versions\n\n`;
    
    let content = fs.readFileSync(changelogPath, 'utf8');
    const insertPoint = content.indexOf('\n## [');
    
    if (insertPoint === -1) {
        content = content + newEntry;
    } else {
        content = content.slice(0, insertPoint) + newEntry + content.slice(insertPoint);
    }
    
    fs.writeFileSync(changelogPath, content);
}

async function main() {
    try {
        // Get the version number
        const version = await promptForVersion();
        if (!version.match(/^\d+\.\d+\.\d+$/)) {
            console.error('Invalid version format. Please use semver (e.g., 1.0.0)');
            process.exit(1);
        }
        
        // Update version in package.json
        console.log('\nUpdating version number...');
        execCommand(`npm version ${version} --no-git-tag-version`);
        
        // Update CHANGELOG.md
        console.log('Updating CHANGELOG...');
        await updateChangelog(version);
        
        // Create and switch to release branch
        const branchName = `release/v${version}`;
        console.log(`\nCreating release branch: ${branchName}`);
        execCommand(`git checkout -b ${branchName}`);
        
        // Stage and commit changes
        console.log('Committing changes...');
        execCommand('git add .');
        execCommand(`git commit -m "chore: Prepare release v${version}"`);
        
        // Push branch
        console.log('Pushing release branch...');
        execCommand(`git push origin ${branchName}`);
        
        console.log(`\n✅ Release v${version} prepared successfully!`);
        console.log(`\nNext steps:`);
        console.log(`1. Create a pull request from ${branchName} to main`);
        console.log(`2. Review the changes`);
        console.log(`3. Merge the pull request to trigger the release`);
        
    } catch (error) {
        console.error('Error preparing release:', error);
        process.exit(1);
    }
}

// Run the script
main();
