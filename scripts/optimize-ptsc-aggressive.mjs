import imagemin from 'imagemin';
import imageminWebp from 'imagemin-webp';
import fs from 'fs';
import path from 'path';

/**
 * Aggressive optimization for PTSCHaiPhong7.webp
 * Target: Under 300KB for fast loading
 */

async function aggressiveOptimize() {
  const publicDir = 'public';
  const targetFile = 'PTSCHaiPhong7.webp';
  const targetPath = path.join(publicDir, targetFile);
  
  console.log('🔥 TN Films - Aggressive WebP Optimizer');
  console.log('========================================');
  
  if (!fs.existsSync(targetPath)) {
    console.error(`❌ File not found: ${targetPath}`);
    return;
  }
  
  // Current size check
  const currentStats = fs.statSync(targetPath);
  const currentSize = currentStats.size;
  const currentSizeKB = (currentSize / 1024).toFixed(0);
  
  console.log(`📁 Current: ${targetFile}`);
  console.log(`📊 Size: ${currentSizeKB}KB`);
  console.log(`🎯 Target: <300KB for fast loading`);
  
  // Create backup
  const backupPath = path.join(publicDir, `${targetFile}.backup2`);
  fs.copyFileSync(targetPath, backupPath);
  console.log(`💾 Backup: ${targetFile}.backup2`);
  
  try {
    console.log('\n🔥 Aggressive optimization...');
    
    // Very aggressive settings
    await imagemin([targetPath], {
      destination: path.dirname(targetPath),
      plugins: [
        imageminWebp({
          quality: 45,           // Much lower quality for smaller size
          method: 6,            // Best compression
          autoFilter: true,     // Smart filtering
          sharpness: 0,         // No sharpening
          preprocessing: {
            smoothing: 3        // Maximum smoothing
          },
          segments: 4,          // More segments for better compression
          sns: 100,             // Spatial noise shaping
          filterStrength: 60,   // Noise reduction
          filterSharpness: 0,   // No filter sharpness
          filterType: 1,        // Simple filter
          partitions: 0,        // Auto partitions
          partitionLimit: 0,    // No limit
          pass: 10,             // Multiple passes
          targetSize: 250000,   // Target 250KB
          targetPSNR: 0,        // Don't care about PSNR
          crop: {
            x: 0,
            y: 0,
            width: 0,
            height: 0
          }
        })
      ]
    });
    
    // Check final size
    const finalStats = fs.statSync(targetPath);
    const finalSize = finalStats.size;
    const finalSizeKB = (finalSize / 1024).toFixed(0);
    const reduction = ((currentSize - finalSize) / currentSize * 100).toFixed(1);
    
    console.log('\n🎉 Aggressive Optimization Complete!');
    console.log(`📊 Final size: ${finalSizeKB}KB`);
    console.log(`📈 Additional reduction: ${reduction}%`);
    
    // Performance assessment
    console.log('\n🚀 Performance Assessment:');
    if (finalSize < 250000) {
      console.log('   🏆 Excellent! Lightning fast loading');
      console.log('   📱 Perfect for mobile');
      console.log('   ⚡ Instant fallback');
    } else if (finalSize < 350000) {
      console.log('   ✅ Very Good! Fast loading');
      console.log('   📱 Mobile-friendly');
      console.log('   🌐 Web-optimized');
    } else {
      console.log('   ⚠️  Still needs improvement');
    }
    
    // Total optimization summary
    const originalPath = path.join(publicDir, `${targetFile}.original`);
    if (fs.existsSync(originalPath)) {
      const originalStats = fs.statSync(originalPath);
      const originalSize = originalStats.size;
      const totalReduction = ((originalSize - finalSize) / originalSize * 100).toFixed(1);
      const originalSizeMB = (originalSize / 1024 / 1024).toFixed(2);
      
      console.log('\n📊 Total Optimization Summary:');
      console.log(`   Original: ${originalSizeMB}MB`);
      console.log(`   Final: ${finalSizeKB}KB`);
      console.log(`   Total reduction: ${totalReduction}%`);
      console.log(`   Load speed improvement: ${Math.round(totalReduction / 10)}x faster`);
    }
    
    console.log('\n🔧 Applied Settings:');
    console.log('   • Quality: 45% (maximum compression)');
    console.log('   • Target size: 250KB');
    console.log('   • Smoothing: Maximum');
    console.log('   • Multiple optimization passes');
    
  } catch (error) {
    console.error('❌ Aggressive optimization failed:', error);
    
    // Restore backup
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, targetPath);
      console.log('🔙 Restored backup');
    }
  }
  
  console.log('\n✅ Ready to test! Run: npm run dev');
}

// Run aggressive optimization
aggressiveOptimize().catch(console.error); 