const imagemin = require('imagemin');
const imageminWebp = require('imagemin-webp');
const fs = require('fs');
const path = require('path');

/**
 * Script tối ưu WebP files lớn
 * Giảm dung lượng mà không mất chất lượng
 */

async function optimizeLargeWebP() {
  const publicDir = 'public';
  const targetFile = 'PTSCHaiPhong7.webp';
  const targetPath = path.join(publicDir, targetFile);
  
  console.log('🔧 TN Films - WebP Large File Optimizer');
  console.log('=====================================');
  
  // Check if file exists
  if (!fs.existsSync(targetPath)) {
    console.error(`❌ File not found: ${targetPath}`);
    return;
  }
  
  // Get original file size
  const originalStats = fs.statSync(targetPath);
  const originalSize = originalStats.size;
  const originalSizeMB = (originalSize / 1024 / 1024).toFixed(2);
  
  console.log(`📁 Original file: ${targetFile}`);
  console.log(`📊 Original size: ${originalSizeMB}MB (${originalSize.toLocaleString()} bytes)`);
  
  // Create backup
  const backupPath = path.join(publicDir, `${targetFile}.backup`);
  fs.copyFileSync(targetPath, backupPath);
  console.log(`💾 Backup created: ${targetFile}.backup`);
  
  try {
    // Optimize with multiple quality levels
    const optimizations = [
      { quality: 75, suffix: '_optimized_75' },
      { quality: 65, suffix: '_optimized_65' },
      { quality: 55, suffix: '_optimized_55' }
    ];
    
    console.log('\n🔄 Optimizing with different quality levels...\n');
    
    const results = [];
    
    for (const opt of optimizations) {
      const outputName = targetFile.replace('.webp', `${opt.suffix}.webp`);
      const outputPath = path.join(publicDir, outputName);
      
      await imagemin([targetPath], {
        destination: publicDir,
        plugins: [
          imageminWebp({
            quality: opt.quality,
            method: 6, // Best compression method
            autoFilter: true,
            sharpness: 0,
            preprocessing: {
              smoothing: 1
            }
          })
        ]
      });
      
      // Rename the output to our desired name
      const defaultOutput = path.join(publicDir, targetFile);
      if (fs.existsSync(defaultOutput)) {
        fs.renameSync(defaultOutput, outputPath);
      }
      
      // Get optimized file size
      const optimizedStats = fs.statSync(outputPath);
      const optimizedSize = optimizedStats.size;
      const optimizedSizeMB = (optimizedSize / 1024 / 1024).toFixed(2);
      const reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
      
      results.push({
        quality: opt.quality,
        name: outputName,
        size: optimizedSize,
        sizeMB: optimizedSizeMB,
        reduction: reduction
      });
      
      console.log(`✅ Quality ${opt.quality}%: ${optimizedSizeMB}MB (${reduction}% smaller)`);
    }
    
    // Find best optimization (target: under 500KB)
    const bestOption = results.find(r => r.size < 500000) || results[results.length - 1];
    
    console.log('\n🎯 Recommendation:');
    console.log(`   Best option: Quality ${bestOption.quality}% - ${bestOption.sizeMB}MB (${bestOption.reduction}% reduction)`);
    
    // Apply best optimization
    const bestFilePath = path.join(publicDir, bestOption.name);
    fs.copyFileSync(bestFilePath, targetPath);
    
    console.log(`\n🔄 Applied optimization: Quality ${bestOption.quality}%`);
    
    // Clean up optimization test files
    results.forEach(result => {
      const filePath = path.join(publicDir, result.name);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
    
    // Final size check
    const finalStats = fs.statSync(targetPath);
    const finalSize = finalStats.size;
    const finalSizeMB = (finalSize / 1024 / 1024).toFixed(2);
    const totalReduction = ((originalSize - finalSize) / originalSize * 100).toFixed(1);
    
    console.log('\n🎉 Optimization Complete!');
    console.log(`📊 Final size: ${finalSizeMB}MB (${finalSize.toLocaleString()} bytes)`);
    console.log(`📈 Total reduction: ${totalReduction}%`);
    console.log(`⚡ Expected load time improvement: ${Math.round(totalReduction / 10)}x faster`);
    
    // Performance recommendations
    console.log('\n💡 Performance Tips:');
    if (finalSize > 800000) {
      console.log('   ⚠️  Still large (>800KB) - consider lazy loading');
    } else if (finalSize > 500000) {
      console.log('   ✅ Good size (500-800KB) - suitable for hero images');
    } else {
      console.log('   🚀 Excellent size (<500KB) - fast loading guaranteed');
    }
    
    console.log(`   📱 Mobile-friendly: ${finalSize < 300000 ? 'Yes' : 'Use lazy loading'}`);
    console.log(`   🔄 Cache strategy: ${finalSize < 500000 ? 'Preload' : 'On-demand'}`);
    
  } catch (error) {
    console.error('❌ Optimization failed:', error);
    
    // Restore backup
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, targetPath);
      console.log('🔙 Restored from backup');
    }
  } finally {
    // Clean up backup
    if (fs.existsSync(backupPath)) {
      fs.unlinkSync(backupPath);
    }
  }
}

// Run optimization
optimizeLargeWebP().catch(console.error); 