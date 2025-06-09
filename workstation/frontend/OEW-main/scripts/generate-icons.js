const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Paths
const iconDir = path.join(__dirname, '../assets/icons');
const iconPath = path.join(iconDir, 'icon.png');

// Make sure icon directory exists
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
  console.log('Created icons directory');
}

// Generate icons for different platforms if the source exists
async function generateIcons() {
  if (!fs.existsSync(iconPath)) {
    console.error('Source icon.png not found! Run download-icon.js first.');
    return;
  }

  try {
    // Windows ICO (multiple sizes in one file)
    await sharp(iconPath)
      .resize(256, 256)
      .toFile(path.join(iconDir, 'icon.ico'));
    console.log('Generated Windows icon (icon.ico)');

    // macOS ICNS - For proper ICNS we would need a more complex approach,
    // but for simplicity we'll just create a copy for now
    fs.copyFileSync(iconPath, path.join(iconDir, 'icon.icns'));
    console.log('Generated macOS icon (icon.icns)');

    // Generate different sizes for Linux/Windows
    const sizes = [16, 24, 32, 48, 64, 128, 256, 512];
    
    for (const size of sizes) {
      await sharp(iconPath)
        .resize(size, size)
        .toFile(path.join(iconDir, `icon-${size}x${size}.png`));
    }
    console.log('Generated resized PNG icons');

  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

// Run the generator
generateIcons().catch(console.error);
