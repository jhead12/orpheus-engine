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
                // Use root version instead of incrementing
                packageJson.version = rootVersion;
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

// Log completion
console.log('✨ Version sync complete!');
