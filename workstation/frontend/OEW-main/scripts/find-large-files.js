import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Size thresholds in bytes (50MB)
const SIZE_THRESHOLD = 50 * 1024 * 1024;

async function findLargeFiles(dir, ignoredPatterns = []) {
    const largeFiles = [];
    
    async function scan(currentDir) {
        const files = await fs.readdir(currentDir);
        
        for (const file of files) {
            const fullPath = path.join(currentDir, file);
            
            // Skip ignored paths
            if (ignoredPatterns.some(pattern => fullPath.includes(pattern))) {
                continue;
            }
            
            try {
                const stats = await fs.stat(fullPath);
                
                if (stats.isDirectory()) {
                    await scan(fullPath);
                } else if (stats.size > SIZE_THRESHOLD) {
                    largeFiles.push({
                        path: fullPath,
                        size: (stats.size / 1024 / 1024).toFixed(2) + ' MB'
                    });
                }
            } catch (error) {
                console.error(`Error scanning ${fullPath}: ${error.message}`);
            }
        }
    }
    
    await scan(dir);
    return largeFiles.sort((a, b) => parseFloat(b.size) - parseFloat(a.size));
}

// Read .gitignore patterns
const gitignorePath = path.join(__dirname, '..', '.gitignore');
const gitignore = (await fs.readFile(gitignorePath, 'utf8'))
    .split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => line.trim());

// Run the scan
const repoRoot = path.join(__dirname, '..');
try {
    const largeFiles = await findLargeFiles(repoRoot, gitignore);
    console.log('Large files found (>50MB):');
    console.table(largeFiles);
} catch (error) {
    console.error('Error:', error);
}
