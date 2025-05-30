const fs = require('fs');
const path = require('path');

/**
 * Creates required directories if they don't exist
 */
function createFolderStructure() {
  console.log('Creating required folder structure...');
  
  const requiredDirs = [
    'workstation',
    'workstation/backend',
    'workstation/frontend',
    'workstation/omi',
    'workstation/omi/sdks',
    'workstation/omi/sdks/react-native',
    'workstation/omi/sdks/react-native/src',
    'workstation/sonobus'
  ];
  
  for (const dir of requiredDirs) {
    const dirPath = path.join(process.cwd(), dir);
    
    if (!fs.existsSync(dirPath)) {
      console.log(`Creating directory: ${dir}`);
      fs.mkdirSync(dirPath, { recursive: true });
    } else {
      console.log(`Directory already exists: ${dir}`);
    }
  }
  
  // Create backend requirements.txt file
  const backendRequirementsPath = path.join(process.cwd(), 'workstation/backend/requirements.txt');
  if (!fs.existsSync(backendRequirementsPath)) {
    console.log('Creating backend requirements.txt file');
    const requirementsContent = `# Core dependencies
Flask==2.0.1
Flask-Cors==3.0.10
numpy==1.21.0
pandas==1.3.0
requests==2.26.0
python-dotenv==0.19.0

# Audio processing
librosa==0.8.1
soundfile==0.10.3.post1
pydub==0.25.1

# Vector database and embeddings
chromadb==0.4.6
sentence-transformers==2.2.2

# ML and AI
torch==2.0.1
transformers==4.30.2
openai-whisper==20231117
ffmpeg-python==0.2.0

# Utilities
tqdm==4.64.1
`;
    fs.writeFileSync(backendRequirementsPath, requirementsContent);
  }
  
  console.log('Folder structure creation completed.');
}

createFolderStructure();

if (require.main === module) {
  // Script was run directly
  console.log('✅ Workspace structure has been set up');
}

module.exports = { createFolderStructure };
