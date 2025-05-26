const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function installDependencies() {
    console.log('🚀 Installing all dependencies...\n');

    // Install root dependencies
    console.log('📦 Installing root dependencies...');
    execSync('npm install', { stdio: 'inherit' });

    // Get all workspace directories
    const workspaces = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'))
        .workspaces
        .reduce((acc, ws) => {
            if (ws.endsWith('/*')) {
                const dir = ws.slice(0, -2);
                const subdirs = fs.readdirSync(path.join(__dirname, '..', dir))
                    .map(subdir => path.join(dir, subdir))
                    .filter(subdir => fs.existsSync(path.join(__dirname, '..', subdir, 'package.json')));
                return [...acc, ...subdirs];
            }
            return [...acc, ws];
        }, []);

    // Install workspace dependencies
    workspaces.forEach(workspace => {
        const wsPath = path.join(__dirname, '..', workspace);
        console.log(`\n📦 Installing dependencies for ${workspace}...`);
        execSync('npm install', { cwd: wsPath, stdio: 'inherit' });

        // Check for Python requirements.txt
        const requirementsPath = path.join(wsPath, 'requirements.txt');
        const agenticRagRequirementsPath = path.join(wsPath, 'agentic_rag', 'requirements.txt');
        
        if (fs.existsSync(requirementsPath)) {
            console.log(`\n🐍 Installing Python dependencies for ${workspace}...`);
            execSync('python3 -m pip install -r requirements.txt', { cwd: wsPath, stdio: 'inherit' });
        }
        
        if (fs.existsSync(agenticRagRequirementsPath)) {
            console.log(`\n🐍 Installing Python dependencies for ${workspace}/agentic_rag...`);
            execSync('python3 -m pip install -r agentic_rag/requirements.txt', { cwd: wsPath, stdio: 'inherit' });
        }
    });

    console.log('\n✅ All dependencies installed successfully!');
}

try {
    installDependencies();
} catch (error) {
    console.error('❌ Error installing dependencies:', error);
    process.exit(1);
}
