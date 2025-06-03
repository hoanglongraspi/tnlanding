import imagemin from 'imagemin';
import imageminWebp from 'imagemin-webp';
import fs from 'fs';
import path from 'path';

/**
 * Script tối ưu ảnh PTSCHaiPhong7.webp
 * Giảm từ 1.32MB xuống dưới 500KB
 */

async function optimizePTSCImage() {
  const publicDir = 'public';
  const targetFile = 'PTSCHaiPhong7.webp';
  const targetPath = path.join(publicDir, targetFile);
  
  console.log('🔧 TN Films - PTSC Image Optimizer');
  console.log('===================================');
  
  // Check if file exists
  if (!fs.existsSync(targetPath)) {
    console.error(`❌ File not found: ${targetPath}`);
    return;
  }
  
  // Get original file size
  const originalStats = fs.statSync(targetPath);
  const originalSize = originalStats.size;
  const originalSizeMB = (originalSize / 1024 / 1024).toFixed(2);
  
  console.log(`📁 Original: ${targetFile}`);
  console.log(`📊 Size: ${originalSizeMB}MB (${originalSize.toLocaleString()} bytes)`);
  console.log(`⚠️  Problem: Too large, causing slow loading`);
  
  // Create backup
  const backupPath = path.join(publicDir, `${targetFile}.original`);
  fs.copyFileSync(targetPath, backupPath);
  console.log(`💾 Backup: ${targetFile}.original`);
  
  try {
    console.log('\n🔄 Optimizing...');
    
    // Optimize với quality 60% để target dưới 500KB
    await imagemin([targetPath], {
      destination: path.dirname(targetPath),
      plugins: [
        imageminWebp({
          quality: 60,          // Aggressive compression
          method: 6,           // Best compression method
          autoFilter: true,    // Smart filtering
          sharpness: 0,        // Disable sharpening for smaller size
          preprocessing: {
            smoothing: 2       // More smoothing for better compression
          }
        })
      ]
    });
    
    // Check optimized size
    const optimizedStats = fs.statSync(targetPath);
    const optimizedSize = optimizedStats.size;
    const optimizedSizeMB = (optimizedSize / 1024 / 1024).toFixed(2);
    const optimizedSizeKB = (optimizedSize / 1024).toFixed(0);
    const reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
    
    console.log('\n🎉 Optimization Complete!');
    console.log(`📊 New size: ${optimizedSizeMB}MB (${optimizedSizeKB}KB)`);
    console.log(`📈 Reduction: ${reduction}% smaller`);
    console.log(`⚡ Load time: ${Math.round(reduction / 15)}x faster`);
    
    // Performance assessment
    console.log('\n💡 Performance Assessment:');
    if (optimizedSize < 300000) {
      console.log('   🚀 Excellent! Fast loading on all devices');
    } else if (optimizedSize < 500000) {
      console.log('   ✅ Good! Reasonable loading time');
    } else if (optimizedSize < 800000) {
      console.log('   ⚠️  Fair. Consider further optimization');
    } else {
      console.log('   ❌ Still too large. Need manual editing');
    }
    
    console.log('\n🔧 Applied Optimizations:');
    console.log('   • Quality: 60% (balanced quality/size)');
    console.log('   • Method: 6 (maximum compression)');
    console.log('   • Smoothing: Enabled for better compression');
    console.log('   • Auto-filter: Smart content detection');
    
    if (optimizedSize < 500000) {
      console.log('\n✅ Success! Image is now optimized for fast loading.');
      console.log('   📱 Mobile-friendly');
      console.log('   🌐 Web-optimized');
      console.log('   ⚡ Fast fallback image');
    } else {
      console.log('\n⚠️  Warning: Still larger than optimal.');
      console.log('   Consider manual image editing or using a different image.');
    }
    
  } catch (error) {
    console.error('❌ Optimization failed:', error);
    
    // Restore backup
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, targetPath);
      console.log('🔙 Restored original file');
    }
  }
  
  console.log('\n📝 Next Steps:');
  console.log('   1. Test image loading in browser');
  console.log('   2. Monitor WebP Performance Monitor');
  console.log('   3. Run: npm run dev');
}

// Run optimization
optimizePTSCImage().catch(console.error); 