#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function logHeader(message) {
    console.log('\n' + '='.repeat(50));
    log(`${colors.bold}${message}`, colors.cyan);
    console.log('='.repeat(50));
}

async function fixPythonDependencies() {
    logHeader('Fixing Python Dependencies');

    try {
        // Create a comprehensive requirements file with compatible versions
        const compatibleRequirements = `
# Core dependencies with version constraints
pydantic>=2.9.2,<2.12.0
opentelemetry-api>=1.28.0
python-socketio>=5.11.3,<5.13.0

# Protobuf compatibility fix
protobuf>=3.19.5,<5.0.0,!=3.20.0,!=3.20.1,!=4.21.0,!=4.21.1,!=4.21.2,!=4.21.3,!=4.21.4,!=4.21.5

# MCP dependencies
mcp>=1.0.0

# Google AI dependencies with compatible protobuf
google-ai-generativelanguage>=0.6.6

# Audio processing
librosa>=0.10.0
soundfile>=0.12.0
numpy>=1.24.0,<2.0.0

# Database and vector store
chromadb>=0.4.0
sqlalchemy>=1.4.0

# Web framework
fastapi>=0.100.0
uvicorn>=0.23.0

# Network and connectivity
aiohttp>=3.8.0
websockets>=11.0.0

# Utilities
python-dotenv>=1.0.0
pyyaml>=6.0.0
requests>=2.31.0

# Development tools
pytest>=7.4.0
black>=23.0.0
flake8>=6.0.0
`.trim();

        // Write the compatible requirements file
        const compatiblePath = path.join(process.cwd(), 'requirements_compatible.txt');
        fs.writeFileSync(compatiblePath, compatibleRequirements);
        log(`✅ Created compatible requirements file: ${compatiblePath}`, colors.green);

        // Uninstall conflicting packages
        logHeader('Removing Conflicting Packages');
        const conflictingPackages = [
            'pydantic-ai-slim',
            'open-webui'
        ];

        for (const pkg of conflictingPackages) {
            try {
                execSync(`python3 -m pip uninstall ${pkg} -y`, { stdio: 'pipe' });
                log(`✅ Removed: ${pkg}`, colors.green);
            } catch (error) {
                log(`ℹ️  Package not installed: ${pkg}`, colors.blue);
            }
        }

        // Install compatible versions
        logHeader('Installing Compatible Versions');
        
        try {
            log('Installing from compatible requirements...', colors.blue);
            execSync(`python3 -m pip install -r ${compatiblePath}`, { 
                stdio: 'inherit',
                cwd: process.cwd()
            });
            log('✅ Successfully installed compatible packages', colors.green);
        } catch (error) {
            log(`❌ Failed to install packages: ${error.message}`, colors.red);
            throw error;
        }

        // Verify installation
        logHeader('Verifying Installation');
        
        try {
            const checkResult = execSync('python3 -m pip check', { 
                encoding: 'utf8',
                stdio: 'pipe'
            });
            log('✅ No dependency conflicts detected', colors.green);
        } catch (error) {
            const output = error.stdout || error.stderr || '';
            if (output.trim()) {
                log('⚠️  Remaining conflicts:', colors.yellow);
                console.log(output);
            } else {
                log('✅ Dependency check passed', colors.green);
            }
        }

        // Test MCP import
        try {
            execSync('python3 -c "import mcp; print(\\"MCP package is available\\")"', {
                stdio: 'inherit'
            });
            log('✅ MCP package is working correctly', colors.green);
        } catch (error) {
            log('❌ MCP package import failed', colors.red);
            log('Installing MCP package...', colors.blue);
            try {
                execSync('python3 -m pip install mcp', { stdio: 'inherit' });
                log('✅ MCP package installed successfully', colors.green);
            } catch (mcpError) {
                log(`❌ Failed to install MCP: ${mcpError.message}`, colors.red);
            }
        }

        logHeader('Dependency Fix Complete');
        log('Python dependencies have been updated to compatible versions', colors.green);
        log('You can now run: npm run system-check to verify everything is working', colors.blue);

    } catch (error) {
        log(`❌ Failed to fix dependencies: ${error.message}`, colors.red);
        process.exit(1);
    }
}

if (require.main === module) {
    fixPythonDependencies();
}
