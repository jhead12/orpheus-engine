const fs = require('fs');
const path = require('path');

// Directory to search in
const frontendDir = path.join(__dirname, 'orpheus-engine-workstation', 'frontend', 'src');
const absolutePathToFind = '/workspaces/orpheus-engine/OEW-main';
const replaceWith = '@orpheus-engine/oew-main';

// Function to update files recursively
function updateFiles(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      updateFiles(filePath); // Recursive search in subdirectories
    } else if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx'))) {
      // Read file content
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Check if the file contains absolute import paths
      if (content.includes(absolutePathToFind)) {
        // Replace absolute paths with aliases
        const newContent = content.replace(new RegExp(absolutePathToFind, 'g'), replaceWith);
        
        // Write updated content back to file
        fs.writeFileSync(filePath, newContent);
        console.log(`Updated imports in: ${filePath}`);
      }
    }
  });
}

// Start updating
console.log('Updating files with absolute imports...');
updateFiles(frontendDir);
console.log('Update complete!');
