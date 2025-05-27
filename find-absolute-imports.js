const fs = require('fs');
const path = require('path');

// Directory to search in
const frontendDir = path.join(__dirname, 'orpheus-engine-workstation', 'frontend', 'src');
const absolutePathToFind = '/workspaces/orpheus-engine/OEW-main';

// Function to search files recursively
function searchFiles(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      searchFiles(filePath); // Recursive search in subdirectories
    } else if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx'))) {
      // Read file content
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check if the file contains absolute import paths
      if (content.includes(absolutePathToFind)) {
        console.log(`Found absolute import in: ${filePath}`);
      }
    }
  });
}

// Start searching
console.log('Searching for files with absolute imports...');
searchFiles(frontendDir);
```
