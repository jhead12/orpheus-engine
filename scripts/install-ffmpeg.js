#!/usr/bin/env node

/**
 * Script to install FFmpeg
 * This script detects the operating system and provides instructions for installing FFmpeg
 */

import { execSync } from 'child_process';
const { platform } = process;

// ANSI color codes for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function runCommand(command, silent = false) {
  try {
    if (!silent) {
      log(`Running: ${command}`, colors.blue);
    }
    execSync(command, { stdio: silent ? 'ignore' : 'inherit' });
    return true;
  } catch (error) {
    if (!silent) {
      log(`Error running command: ${command}`, colors.red);
      log(error.message, colors.red);
    }
    return false;
  }
}

function checkFfmpeg() {
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    log('✅ FFmpeg is already installed and available in PATH', colors.green);
    return true;
  } catch (error) {
    log('❌ FFmpeg is not installed or not in PATH', colors.yellow);
    return false;
  }
}

function installFfmpegMac() {
  log('\n📦 Installing FFmpeg on macOS...', colors.bold);
  
  // Check if Homebrew is installed
  try {
    execSync('brew --version', { stdio: 'ignore' });
  } catch (error) {
    log('Homebrew is not installed. Installing Homebrew first...', colors.yellow);
    log('This may require your password', colors.yellow);
    const installHomebrew = '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"';
    if (!runCommand(installHomebrew)) {
      log('Failed to install Homebrew. Please install it manually from https://brew.sh', colors.red);
      return false;
    }
  }
  
  // Install FFmpeg using Homebrew
  if (runCommand('brew install ffmpeg')) {
    log('✅ FFmpeg installed successfully!', colors.green);
    return true;
  } else {
    log('❌ Failed to install FFmpeg with Homebrew', colors.red);
    log('Please try installing it manually with: brew install ffmpeg', colors.yellow);
    return false;
  }
}

function installFfmpegLinux() {
  log('\n📦 Installing FFmpeg on Linux...', colors.bold);
  
  // Detect package manager and install
  const packageManagers = [
    { check: 'apt -v', install: 'sudo apt update && sudo apt install -y ffmpeg' },
    { check: 'dnf --version', install: 'sudo dnf install -y ffmpeg' },
    { check: 'yum --version', install: 'sudo yum install -y epel-release && sudo yum install -y ffmpeg' },
    { check: 'pacman --version', install: 'sudo pacman -S --noconfirm ffmpeg' }
  ];
  
  for (const pm of packageManagers) {
    if (runCommand(pm.check, true)) {
      log(`Detected package manager. Installing FFmpeg...`, colors.blue);
      if (runCommand(pm.install)) {
        log('✅ FFmpeg installed successfully!', colors.green);
        return true;
      } else {
        log('❌ Failed to install FFmpeg automatically', colors.red);
        break;
      }
    }
  }
  
  log('Please install FFmpeg manually using your system package manager:', colors.yellow);
  log('  • Debian/Ubuntu: sudo apt install ffmpeg', colors.yellow);
  log('  • Fedora: sudo dnf install ffmpeg', colors.yellow);
  log('  • CentOS/RHEL: sudo yum install epel-release && sudo yum install ffmpeg', colors.yellow);
  log('  • Arch: sudo pacman -S ffmpeg', colors.yellow);
  return false;
}

function instructWindowsInstall() {
  log('\n📦 Installing FFmpeg on Windows...', colors.bold);
  log('FFmpeg needs to be installed manually on Windows:', colors.yellow);
  log('1. Download FFmpeg from https://ffmpeg.org/download.html or https://github.com/BtbN/FFmpeg-Builds/releases', colors.yellow);
  log('2. Extract the ZIP file to a location of your choice (e.g., C:\\FFmpeg)', colors.yellow);
  log('3. Add the FFmpeg bin directory to your PATH environment variable:', colors.yellow);
  log('   • Right-click on "This PC" and select "Properties"', colors.yellow);
  log('   • Click on "Advanced system settings"', colors.yellow);
  log('   • Click on "Environment Variables"', colors.yellow);
  log('   • Under "System Variables", find the "Path" variable, select it, and click "Edit"', colors.yellow);
  log('   • Click "New" and add the path to the bin folder (e.g., C:\\FFmpeg\\bin)', colors.yellow);
  log('   • Click "OK" on all dialogs', colors.yellow);
  log('4. Open a new Command Prompt and type "ffmpeg -version" to verify installation', colors.yellow);
  
  // For Windows, we could also support automatic installation via chocolatey
  try {
    execSync('choco --version', { stdio: 'ignore' });
    log('\nAlternatively, if you have Chocolatey installed, you can run:', colors.blue);
    log('choco install ffmpeg', colors.blue);
  } catch (error) {
    // Chocolatey not installed, skip alternative method
  }
}

// Main function
function main() {
  log('\n🔍 Checking for FFmpeg installation...', colors.bold);
  
  if (checkFfmpeg()) {
    return;
  }
  
  switch (platform) {
    case 'darwin':
      installFfmpegMac();
      break;
    case 'linux':
      installFfmpegLinux();
      break;
    case 'win32':
      instructWindowsInstall();
      break;
    default:
      log(`❌ Unsupported platform: ${platform}`, colors.red);
      log('Please install FFmpeg manually from https://ffmpeg.org/download.html', colors.yellow);
  }
  
  log('\n✨ After installation, restart your terminal and run:', colors.bold);
  log('npm run system-check', colors.blue);
  log('This will verify that FFmpeg is properly installed and available.', colors.reset);
}

// Run the script
main();
