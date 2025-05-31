const path = require('path');
const fs = require('fs');

function findModuleBin(moduleName) {
    const rootDir = process.cwd();
    const possibilities = [
        path.join(rootDir, 'node_modules', '.bin', moduleName),
        path.join(rootDir, 'node_modules', moduleName, 'bin', moduleName),
        path.join(rootDir, 'workstation/frontend', 'node_modules', '.bin', moduleName),
    ];

    for (const binPath of possibilities) {
        if (fs.existsSync(binPath)) {
            return binPath;
        }
    }
    throw new Error(`Could not find ${moduleName} binary`);
}

if (require.main === module) {
    try {
        console.log(findModuleBin(process.argv[2]));
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}
