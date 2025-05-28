const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const MAX_RETRIES = 3;
const PROBLEMATIC_PACKAGES = ['7zip-bin'];

function cleanNodeModules(dir) {
  if (fs.existsSync(path.join(dir, 'node_modules'))) {
    console.log(`Cleaning node_modules in ${dir}...`);
    // Clean problematic packages first
    PROBLEMATIC_PACKAGES.forEach(pkg => {
      const pkgPath = path.join(dir, 'node_modules', pkg);
      if (fs.existsSync(pkgPath)) {
        execSync(`rm -rf "${pkgPath}"`, { stdio: 'inherit' });
      }
    });
    // Clean temp directories
    execSync(`find ${path.join(dir, 'node_modules')} -name "*.7zip-bin-*" -type d -exec rm -rf {} +`, { stdio: 'inherit' });
  }
}

function installDependencies(dir, attempt = 1) {
  try {
    console.log(`Installing dependencies in ${dir} (attempt ${attempt}/${MAX_RETRIES})...`);
    cleanNodeModules(dir);
    execSync('npm install --legacy-peer-deps --no-audit', { cwd: dir, stdio: 'inherit' });
  } catch (error) {
    if (attempt < MAX_RETRIES && (error.message.includes('ENOTEMPTY') || error.status === 217)) {
      console.log(`Retry ${attempt + 1}/${MAX_RETRIES}...`);
      return installDependencies(dir, attempt + 1);
    }
    throw error;
  }
}

const directories = [
  '.',
  'OEW-main',
  'orpheus-engine-workstation/frontend',
  'orpheus-engine-workstation/backend'
];

directories.forEach(dir => {
  try {
    installDependencies(dir);
  } catch (error) {
    console.error(`Failed to install dependencies in ${dir}:`, error);
    process.exit(1);
  }
});
