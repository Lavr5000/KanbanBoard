const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const svgPath = path.join(__dirname, '../public/icon.svg');
const outputDir = path.join(__dirname, '../public/icons');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  const svgBuffer = fs.readFileSync(svgPath);

  for (const size of sizes) {
    console.log(`Generating ${size}x${size} icon...`);

    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(outputDir, `icon-${size}x${size}.png`));
  }

  // Generate maskable icon (with padding for safe zone)
  console.log('Generating maskable icon...');
  const maskableSize = 512;
  const iconSize = Math.floor(maskableSize * 0.8); // 80% of total size for safe zone
  const padding = Math.floor((maskableSize - iconSize) / 2);

  await sharp({
    create: {
      width: maskableSize,
      height: maskableSize,
      channels: 4,
      background: { r: 139, g: 92, b: 246, alpha: 1 } // #8B5CF6
    }
  })
    .composite([{
      input: await sharp(svgBuffer)
        .resize(iconSize, iconSize)
        .toBuffer(),
      top: padding,
      left: padding
    }])
    .png()
    .toFile(path.join(outputDir, 'maskable-512x512.png'));

  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);
