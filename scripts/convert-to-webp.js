import imagemin from 'imagemin';
import imageminWebp from 'imagemin-webp';
import fs from 'fs';
import path from 'path';

// Configuration
const inputDir = 'public';
const outputDir = 'public/webp';
const quality = 85; // WebP quality (0-100)

// File extensions to convert
const imageExtensions = ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'];

// Images to skip (logos, favicons, etc.)
const skipFiles = [
  'favicon.ico',
  'favicon.svg',
  'robots.txt',
  'ptsc-logo.png',
  'logo_transparent.png'
];

async function convertToWebP() {
  try {
    console.log('🖼️  Starting WebP conversion...\n');

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Get all files in public directory
    const files = fs.readdirSync(inputDir);
    
    // Filter image files
    const imageFiles = files.filter(file => {
      const ext = path.extname(file);
      return imageExtensions.includes(ext) && !skipFiles.includes(file);
    });

    console.log(`Found ${imageFiles.length} images to convert:\n`);

    for (const file of imageFiles) {
      const inputPath = path.join(inputDir, file);
      const stats = fs.statSync(inputPath);
      const originalSize = (stats.size / 1024 / 1024).toFixed(2); // MB
      
      console.log(`📷 Converting: ${file} (${originalSize}MB)`);
      
      try {
        // Convert to WebP
        const files = await imagemin([inputPath], {
          destination: outputDir,
          plugins: [
            imageminWebp({
              quality: quality,
              method: 6, // Compression method (0-6, 6 is best compression)
              autoFilter: true,
              sharpness: 0,
              lossless: false
            })
          ]
        });

        if (files.length > 0) {
          const webpFile = files[0];
          const webpStats = fs.statSync(webpFile.destinationPath);
          const webpSize = (webpStats.size / 1024 / 1024).toFixed(2); // MB
          const reduction = ((1 - webpStats.size / stats.size) * 100).toFixed(1);
          
          console.log(`   ✅ Created: ${path.basename(webpFile.destinationPath)} (${webpSize}MB) - ${reduction}% smaller\n`);
        }
      } catch (error) {
        console.log(`   ❌ Failed to convert ${file}: ${error.message}\n`);
      }
    }

    // Also copy the WebP files to public root with .webp extension
    console.log('📁 Copying WebP files to public root...\n');
    
    const webpFiles = fs.readdirSync(outputDir);
    for (const webpFile of webpFiles) {
      const srcPath = path.join(outputDir, webpFile);
      const destPath = path.join(inputDir, webpFile);
      
      fs.copyFileSync(srcPath, destPath);
      console.log(`   📋 Copied: ${webpFile}`);
    }

    console.log('\n🎉 WebP conversion completed!');
    
    // Generate summary
    generateSummary();
    
  } catch (error) {
    console.error('❌ Error during WebP conversion:', error);
  }
}

function generateSummary() {
  const files = fs.readdirSync(inputDir);
  const originalImages = files.filter(file => {
    const ext = path.extname(file);
    return imageExtensions.includes(ext) && !skipFiles.includes(file);
  });
  
  const webpImages = files.filter(file => path.extname(file) === '.webp');
  
  let totalOriginalSize = 0;
  let totalWebPSize = 0;
  
  originalImages.forEach(file => {
    const stats = fs.statSync(path.join(inputDir, file));
    totalOriginalSize += stats.size;
  });
  
  webpImages.forEach(file => {
    const stats = fs.statSync(path.join(inputDir, file));
    totalWebPSize += stats.size;
  });
  
  const originalSizeMB = (totalOriginalSize / 1024 / 1024).toFixed(2);
  const webpSizeMB = (totalWebPSize / 1024 / 1024).toFixed(2);
  const totalReduction = ((1 - totalWebPSize / totalOriginalSize) * 100).toFixed(1);
  
  console.log('\n📊 CONVERSION SUMMARY:');
  console.log('========================');
  console.log(`📸 Original images: ${originalImages.length} files (${originalSizeMB}MB)`);
  console.log(`🖼️  WebP images: ${webpImages.length} files (${webpSizeMB}MB)`);
  console.log(`💾 Total size reduction: ${totalReduction}%`);
  console.log(`🚀 Bandwidth savings: ${(originalSizeMB - webpSizeMB).toFixed(2)}MB`);
}

// Run the conversion
convertToWebP(); 