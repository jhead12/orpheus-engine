const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function upgradePip() {
  console.log('🔄 Upgrading pip to latest version...');
  try {
    execSync('python -m pip install --upgrade pip', { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.warn('⚠️ Failed to upgrade pip:', error.message);
    return false;
  }
}

function installViaConda() {
  console.log('🔄 Trying to install tokenizers via conda...');
  try {
    // Check if conda is available
    execSync('which conda', { stdio: 'pipe' });
    
    // Install via conda which has pre-built packages
    execSync('conda install -y -c conda-forge tokenizers=0.13.3', { stdio: 'inherit' });
    console.log('✅ Successfully installed tokenizers via conda!');
    return true;
  } catch (error) {
    console.log('⚠️ Conda not available or install failed:', error.message);
    return false;
  }
}

function installPipWheel() {
  console.log('🔄 Trying to install tokenizers via pip wheel...');
  try {
    // Direct install pre-built wheel for Python 3.12 compatibility
    execSync('pip install --only-binary=:all: tokenizers==0.19.1', { stdio: 'inherit' });
    console.log('✅ Successfully installed tokenizers wheel!');
    return true;
  } catch (error) {
    console.log('⚠️ Failed to install tokenizers wheel:', error.message);
    return false;
  }
}

function installAlternativePackage() {
  console.log('🔄 Installing compatible transformers and tokenizers versions...');
  try {
    // Install compatible versions that work with Python 3.12
    execSync('pip install --only-binary=:all: transformers==4.40.0 tokenizers==0.19.1', { stdio: 'inherit' });
    
    // Create a compatibility shim file
    const shimDir = path.join(process.cwd(), 'orpheus-engine-workstation', 'backend', 'agentic_rag');
    const shimPath = path.join(shimDir, 'tokenizers_compat.py');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(shimDir)) {
      fs.mkdirSync(shimDir, { recursive: true });
    }
    
    // Write compatibility shim that redirects tokenizers imports to transformers
    const shimContent = `
# Compatibility shim for tokenizers
import warnings
warnings.warn("Using transformers tokenizers as a fallback for the tokenizers package")

try:
    # Try to import from real tokenizers first
    from tokenizers import *
except ImportError:
    # Fall back to transformers tokenizers
    from transformers.tokenization_utils_base import *
    from transformers.models.auto.tokenization_auto import *
    # Add any additional required imports/compatibility functions here
`;

    fs.writeFileSync(shimPath, shimContent);
    console.log(`✅ Created tokenizers compatibility shim at ${shimPath}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to install compatible packages:', error.message);
    return false;
  }
}

function downgradeToStableDependencies() {
  console.log('🔄 Installing known-compatible versions of dependencies...');
  try {
    // Install specific versions known to work together without Rust
    execSync('pip install -U pip && pip install sentence-transformers==2.0.0 transformers==4.24.0 torch==1.13.1 --no-deps', { 
      stdio: 'inherit' 
    });
    
    // Then install the rest of dependencies
    execSync('pip install huggingface-hub==0.11.0', { stdio: 'inherit' });
    
    return true;
  } catch (error) {
    console.error('❌ Failed to install compatible dependencies:', error.message);
    return false;
  }
}

function installPreBuiltBinaries() {
  console.log('🔄 Downloading pre-built binary from GitHub releases...');
  try {
    // Create temp directory for download
    const tempDir = path.join(require('os').tmpdir(), 'tokenizers-binary');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Download pre-built wheel that matches our environment
    const pythonVersion = execSync('python -c "import sys; print(f\\"cp{sys.version_info.major}{sys.version_info.minor}\\")"').toString().trim();
    const platform = process.platform === 'darwin' ? 'macosx_10_15_x86_64' : 'manylinux_2_17_x86_64';
    
    const wheelName = `tokenizers-0.13.2-${pythonVersion}-${pythonVersion}-${platform}.whl`;
    const wheelUrl = `https://github.com/huggingface/tokenizers/releases/download/v0.13.2/${wheelName}`;
    
    console.log(`🔄 Downloading wheel: ${wheelUrl}`);
    
    const wheelPath = path.join(tempDir, wheelName);
    execSync(`curl -L -o "${wheelPath}" "${wheelUrl}"`, { stdio: 'inherit' });
    
    // Install the downloaded wheel
    execSync(`pip install "${wheelPath}"`, { stdio: 'inherit' });
    
    console.log('✅ Successfully installed pre-built binary!');
    return true;
  } catch (error) {
    console.error('❌ Failed to install pre-built binary:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting tokenizers alternative installation...');
  
  // Upgrade pip first
  upgradePip();
  
  // Try multiple approaches in order
  if (await installPipWheel()) {
    console.log('✅ Successfully installed tokenizers via pip wheel!');
  } else if (await installViaConda()) {
    console.log('✅ Successfully installed tokenizers via conda!');
  } else if (await installPreBuiltBinaries()) {
    console.log('✅ Successfully installed tokenizers from pre-built binary!');
  } else if (await downgradeToStableDependencies()) {
    console.log('✅ Successfully installed older compatible versions!');
  } else if (await installAlternativePackage()) {
    console.log('✅ Created compatibility shim using transformers package!');
  } else {
    console.error('❌ All attempts to install tokenizers or alternatives failed');
    process.exit(1);
  }
  
  console.log('🎉 Tokenizers setup completed');
}

main().catch(error => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});
