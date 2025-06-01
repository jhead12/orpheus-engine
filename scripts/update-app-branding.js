/**
 * This script allows easily changing the app name and icon for Orpheus Engine
 * Usage: node scripts/update-app-branding.js --name "New App Name" --icon "path/to/icon.png"
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
let appName = null;
let iconPath = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--name' && i + 1 < args.length) {
    appName = args[i + 1];
    i++;
  } else if (args[i] === '--icon' && i + 1 < args.length) {
    iconPath = args[i + 1];
    i++;
  }
}

// Validate arguments
if (!appName && !iconPath) {
  console.log('Usage: node update-app-branding.js --name "App Name" --icon "path/to/icon.png"');
  console.log('Both parameters are optional, but at least one must be provided.');
  process.exit(1);
}

// Update app name if provided
if (appName) {
  console.log(`Updating app name to: ${appName}`);
  
  // Update package.json
  const packageJsonPath = path.join(__dirname, '../package.json');
  const packageJson = require(packageJsonPath);
  packageJson.productName = appName;
  packageJson.build.productName = appName;
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('Updated package.json');
  
  // Update main.ts
  const mainTsPath = path.join(__dirname, '../electron/main.ts');
  let mainTs = fs.readFileSync(mainTsPath, 'utf8');
  
  // Replace app name in app.name assignment
  mainTs = mainTs.replace(/app\.name\s*=\s*['"].*?['"];/g, `app.name = '${appName}';`);
  
  // Replace title in BrowserWindow options
  mainTs = mainTs.replace(/title:\s*['"].*?['"],/g, `title: '${appName}',`);
  
  fs.writeFileSync(mainTsPath, mainTs);
  console.log('Updated main.ts');
  
  // Update startup-window.ts
  const startupWindowPath = path.join(__dirname, '../electron/startup-window.ts');
  let startupWindow = fs.readFileSync(startupWindowPath, 'utf8');
  
  // Replace title in startup window
  startupWindow = startupWindow.replace(/title:\s*['"].*?['"],/g, `title: '${appName} - Startup',`);
  
  fs.writeFileSync(startupWindowPath, startupWindow);
  console.log('Updated startup-window.ts');
}

// Copy icon if provided
if (iconPath) {
  console.log(`Updating app icon from: ${iconPath}`);
  
  // Check if source icon exists
  if (!fs.existsSync(iconPath)) {
    console.error(`Icon file not found: ${iconPath}`);
    process.exit(1);
  }
  
  // Copy the icon to assets/icons
  const targetIconPath = path.join(__dirname, '../assets/icons/icon.png');
  const iconsDir = path.dirname(targetIconPath);
  
  // Create icons directory if it doesn't exist
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }
  
  // Copy the icon
  fs.copyFileSync(iconPath, targetIconPath);
  console.log('Copied icon to assets/icons/icon.png');
  
  // Generate icons for different platforms
  try {
    execSync('npm run generate-icons', { stdio: 'inherit' });
    console.log('Generated icons for all platforms');
  } catch (error) {
    console.error('Failed to generate icons:', error);
  }
}

console.log('App branding update complete!');
console.log('Changes will take effect after rebuild. Run: npm run build:electron');
