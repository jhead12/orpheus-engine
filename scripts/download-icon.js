const https = require('https');
const fs = require('fs');
const path = require('path');

// Create directory if it doesn't exist
const iconDir = path.join(__dirname, '../assets/icons');
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

// Path for the icon
const iconPath = path.join(iconDir, 'icon.png');

if (!fs.existsSync(iconPath)) {
  console.log('Downloading placeholder icon...');
  // Using a placeholder music-related icon (replace with your actual icon)
  const url = 'https://cdn-icons-png.flaticon.com/512/4302/4302124.png';
  
  https.get(url, (response) => {
    if (response.statusCode !== 200) {
      console.error(`Failed to download icon: ${response.statusCode} ${response.statusMessage}`);
      return;
    }
    
    const file = fs.createWriteStream(iconPath);
    
    response.pipe(file);
    
    file.on('finish', () => {
      file.close();
      console.log('Icon downloaded successfully');
    });
    
    file.on('error', (err) => {
      fs.unlink(iconPath, () => {});
      console.error('Error writing icon file:', err.message);
    });
  }).on('error', (err) => {
    console.error('Error downloading icon:', err.message);
  });
} else {
  console.log('Icon already exists');
}
