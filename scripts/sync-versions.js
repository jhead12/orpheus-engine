const fs = require('fs');
const path = require('path');

// Read the root package.json
const rootPackage = require('../package.json');
const rootVersion = rootPackage.version;

console.log(`Syncing all packages to version ${rootVersion}`);

// Define workspaces to sync
const workspaces = ['orpheus-engine-workstation/frontend', 'orpheus-engine-workstation/backend'];

// Update version in each workspace
workspaces.forEach(workspace => {
    const packagePath = path.join(__dirname, '..', workspace, 'package.json');
    
    if (fs.existsSync(packagePath)) {
        console.log(`Updating ${workspace}/package.json...`);
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        packageJson.version = rootVersion;
        fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
        console.log(`✅ Updated ${workspace}/package.json to version ${rootVersion}`);
    } else {
        console.log(`⚠️ Package not found: ${packagePath}`);
    }
});

// Also update the workstation root package.json
const workstationPath = path.join(__dirname, '..', 'orpheus-engine-workstation', 'package.json');
if (fs.existsSync(workstationPath)) {
    console.log('Updating orpheus-engine-workstation/package.json...');
    const workstationPackage = JSON.parse(fs.readFileSync(workstationPath, 'utf8'));
    workstationPackage.version = rootVersion;
    fs.writeFileSync(workstationPath, JSON.stringify(workstationPackage, null, 2) + '\n');
    console.log(`✅ Updated orpheus-engine-workstation/package.json to version ${rootVersion}`);
} else {
    console.log('⚠️ Workstation package.json not found');
}

console.log('✨ Version sync complete!');
