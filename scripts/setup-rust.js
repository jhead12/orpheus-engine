const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

function checkRustInstalled() {
  try {
    const rustcVersion = execSync('rustc --version', { stdio: 'pipe' }).toString();
    console.log('Rust is already installed:', rustcVersion.trim());
    return true;
  } catch (error) {
    console.log('Rust is not installed or not in PATH');
    return false;
  }
}

function updateEnvironmentPath() {
  const homeDir = os.homedir();
  const cargoPath = path.join(homeDir, '.cargo', 'bin');
  
  console.log(`Adding ${cargoPath} to PATH...`);
  
  // Update the current process environment
  process.env.PATH = `${cargoPath}:${process.env.PATH}`;
  
  // Read cargo env file to extract other environment variables
  try {
    const cargoEnvPath = path.join(homeDir, '.cargo', 'env');
    if (fs.existsSync(cargoEnvPath)) {
      const envFileContent = fs.readFileSync(cargoEnvPath, 'utf8');
      
      // Parse environment variables from the file
      const envVarRegex = /export\s+([A-Za-z0-9_]+)=["']?([^"'\r\n]+)["']?/g;
      let match;
      
      while ((match = envVarRegex.exec(envFileContent)) !== null) {
        const [, key, value] = match;
        const resolvedValue = value.replace('$HOME', homeDir);
        process.env[key] = resolvedValue;
        console.log(`Set ${key}=${resolvedValue}`);
      }
    }
  } catch (error) {
    console.warn('Could not read cargo env file:', error.message);
  }
  
  // Verify that the cargo executable is now in the PATH
  try {
    const cargoVersion = execSync('cargo --version', { stdio: 'pipe' }).toString();
    console.log('Cargo is now available:', cargoVersion.trim());
    return true;
  } catch (error) {
    console.error('Failed to verify cargo installation:', error.message);
    return false;
  }
}

function installRust() {
  console.log('Installing Rust via rustup...');
  try {
    // Use rustup to install Rust (non-interactive mode)
    execSync('curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y', { 
      stdio: 'inherit',
      shell: true 
    });
    
    console.log('Setting up Rust environment...');
    
    // Update PATH to include Cargo bin directory
    if (!updateEnvironmentPath()) {
      console.error('Failed to update PATH environment. Rust tools might not be available in this session.');
      console.log('You may need to manually run: export PATH="$HOME/.cargo/bin:$PATH"');
    }

    console.log('Rust installation complete!');
    return true;
  } catch (error) {
    console.error('Failed to install Rust:', error.message);
    return false;
  }
}

function main() {
  console.log('Checking for Rust installation...');
  let isInstalled = checkRustInstalled();
  
  if (!isInstalled) {
    console.log('Rust is required for building certain Python packages.');
    const success = installRust();
    if (!success) {
      console.error('Please install Rust manually. Visit https://rustup.rs for instructions.');
      process.exit(1);
    }
    
    // Re-check to confirm installation worked
    isInstalled = checkRustInstalled();
    if (!isInstalled) {
      console.error('Rust installation verification failed.');
      console.error('Please manually execute: export PATH="$HOME/.cargo/bin:$PATH"');
      console.error('Then try again.');
      process.exit(1);
    }
  }
  
  console.log('Rust setup complete.');
}

main();
