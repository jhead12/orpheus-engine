// filepath: /Volumes/PRO-BLADE/Github/orpheus-engine/scripts/sync-versions.js
const fs = require('fs');
const path = require('path');

// Read the root package.json
const rootPackage = require('../package.json');
const rootVersion = rootPackage.version;

console.log(`Syncing all packages to version ${rootVersion}`);

// Helper to increment patch version
function incrementPatch(version) {
  const parts = version.split('.').map(Number);
  parts[2] += 1;
  return parts.join('.');
}

// Define workspaces to sync
const workspaces = [
    'workstation/frontend',
    'workstation/backend',
    'workstation'
];

// Update version in each workspace
workspaces.forEach(workspace => {
    const packagePath = path.join(__dirname, '..', workspace, 'package.json');
    
    try {
        if (fs.existsSync(packagePath)) {
            console.log(`Updating ${workspace}/package.json...`);
            const packageContent = fs.readFileSync(packagePath, 'utf8');
            
            try {
                const packageJson = JSON.parse(packageContent);
                // Increment patch version based on current version
                packageJson.version = incrementPatch(packageJson.version || '0.0.0');
                fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
                console.log(`✅ Updated ${workspace}/package.json to version ${packageJson.version}`);
            } catch (parseError) {
                console.error(`❌ Error parsing ${workspace}/package.json:`, parseError.message);
                console.log('File content:', packageContent);
            }
        } else {
            console.log(`⚠️ Package not found: ${packagePath}`);
        }
    } catch (error) {
        console.error(`❌ Error processing ${workspace}/package.json:`, error.message);
    }
});

// Also update the workstation root package.json
try {
    const workstationPath = path.join(__dirname, '..', 'orpheus-engine-workstation', 'package.json');
    if (fs.existsSync(workstationPath)) {
        console.log('Updating orpheus-engine-workstation/package.json...');
        const packageContent = fs.readFileSync(workstationPath, 'utf8');
        
        try {
            const workstationPackage = JSON.parse(packageContent);
            // Increment patch version based on current version
            workstationPackage.version = incrementPatch(workstationPackage.version || '0.0.0');
            fs.writeFileSync(workstationPath, JSON.stringify(workstationPackage, null, 2) + '\n');
            console.log(`✅ Updated orpheus-engine-workstation/package.json to version ${workstationPackage.version}`);
        } catch (parseError) {
            console.error(`❌ Error parsing orpheus-engine-workstation/package.json:`, parseError.message);
            console.log('File content:', packageContent);
        }
    } else {
        console.log('⚠️ Workstation package.json not found');
    }
} catch (error) {
    console.error(`❌ Error processing orpheus-engine-workstation/package.json:`, error.message);
}

console.log('✨ Version sync complete!');
